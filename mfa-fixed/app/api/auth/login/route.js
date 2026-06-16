import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    if (!email || !password) {
      return Response.json(
        { message: "Missing email or password" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // [FIX 2] Trả cùng thông báo khi không tìm thấy user vs sai password
    // → tránh User Enumeration Attack
    if (!user) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.locked_until && user.locked_until > new Date()) {
      await prisma.loginLog.create({
        data: { user_id: user.id, ip_address: ip, user_agent: userAgent, status: "ACCOUNT_LOCKED" },
      });
      return Response.json(
        { message: "Account is locked. Please try again later." },
        { status: 423 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      const newFailedAttempts = user.failed_attempts + 1;
      const shouldLock = newFailedAttempts >= 5;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failed_attempts: newFailedAttempts,
          locked_until: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null,
        },
      });

      await prisma.loginLog.create({
        data: {
          user_id: user.id, ip_address: ip, user_agent: userAgent,
          status: shouldLock ? "ACCOUNT_LOCKED" : "FAILED_PASSWORD",
        },
      });

      return Response.json(
        {
          message: shouldLock
            ? "Wrong password too many times. Account locked for 15 minutes."
            : `Invalid email or password. Attempts: ${newFailedAttempts}/5`, // [FIX 2]
        },
        { status: shouldLock ? 423 : 401 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failed_attempts: 0, locked_until: null },
    });

    if (user.mfa_enabled) {
      await prisma.loginLog.create({
        data: { user_id: user.id, ip_address: ip, user_agent: userAgent, status: "PASSWORD_SUCCESS_MFA_REQUIRED" },
      });
      return Response.json({
        message: "MFA required",
        requireOTP: true,
        email: user.email,
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    await prisma.loginLog.create({
      data: { user_id: user.id, ip_address: ip, user_agent: userAgent, status: "LOGIN_SUCCESS" },
    });

    // [FIX 3] Set JWT qua httpOnly cookie từ server, không trả token ra body
    const response = Response.json({
      message: "Login success",
      user: { id: user.id, email: user.email, mfa_enabled: user.mfa_enabled },
    });

    response.headers.set(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`
    );

    return response;
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
