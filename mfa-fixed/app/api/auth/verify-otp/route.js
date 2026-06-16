import { prisma } from "@/lib/db";
import speakeasy from "speakeasy";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// [FIX 4] Giải mã mfa_secret
const ENCRYPTION_KEY = Buffer.from(process.env.MFA_ENCRYPTION_KEY || "", "hex");

function decryptSecret(ciphertext) {
  const [ivHex, tagHex, dataHex] = ciphertext.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  decipher.setAuthTag(tag);
  return decipher.update(data) + decipher.final("utf8");
}

// [FIX 6] In-memory store để chặn replay attack (dùng Set lưu token đã dùng)
// Production nên dùng Redis
const usedTokens = new Set();
function cleanupUsedTokens() {
  // Xóa entries cũ sau 2 phút (1 window TOTP = 30s, window:1 → max 60s)
  setTimeout(() => usedTokens.clear(), 120_000);
}

export async function POST(req) {
  try {
    const { email, token } = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    if (!email || !token) {
      return Response.json({ message: "Missing email or OTP" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.mfa_secret) {
      return Response.json({ message: "MFA not setup" }, { status: 400 });
    }

    // [FIX 7] Rate limit OTP: khóa tài khoản nếu sai quá 5 lần
    if (user.locked_until && user.locked_until > new Date()) {
      return Response.json(
        { message: "Account is locked. Please try again later." },
        { status: 423 }
      );
    }

    // [FIX 4] Giải mã trước khi verify
    const plainSecret = decryptSecret(user.mfa_secret);

    // [FIX 6] Chặn replay attack
    const tokenKey = `${email}:${token}`;
    if (usedTokens.has(tokenKey)) {
      return Response.json({ message: "OTP đã được sử dụng" }, { status: 401 });
    }

    const verified = speakeasy.totp.verify({
      secret: plainSecret,
      encoding: "base32",
      token: token.trim(),
      window: 1, // [FIX 6] Giảm window từ 2 → 1 (±30s là đủ)
    });

    if (!verified) {
      // [FIX 7] Tăng failed_attempts cho cả OTP sai
      const newFailed = user.failed_attempts + 1;
      const shouldLock = newFailed >= 5;

      await prisma.user.update({
        where: { email },
        data: {
          failed_attempts: newFailed,
          locked_until: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null,
        },
      });

      await prisma.loginLog.create({
        data: { user_id: user.id, ip_address: ip, user_agent: userAgent, status: "FAILED_OTP" },
      });

      return Response.json({ message: "Invalid OTP" }, { status: 401 });
    }

    // OTP đúng → đánh dấu đã dùng
    usedTokens.add(tokenKey);
    cleanupUsedTokens();

    await prisma.user.update({
      where: { email },
      data: { mfa_enabled: true, failed_attempts: 0, locked_until: null },
    });

    await prisma.loginLog.create({
      data: { user_id: user.id, ip_address: ip, user_agent: userAgent, status: "OTP_SUCCESS" },
    });

    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // [FIX 3] Set httpOnly cookie từ server
    const response = Response.json({
      message: "OTP verified successfully",
      user: { id: user.id, email: user.email, mfa_enabled: true },
    });

    response.headers.set(
      "Set-Cookie",
      `token=${jwtToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`
    );

    return response;
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
