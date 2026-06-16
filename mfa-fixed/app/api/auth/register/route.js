import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// [FIX 1] Password strength validation
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push("Ít nhất 8 ký tự");
  if (!/[A-Z]/.test(password)) errors.push("Có ít nhất 1 chữ hoa");
  if (!/[0-9]/.test(password)) errors.push("Có ít nhất 1 chữ số");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    errors.push("Có ít nhất 1 ký tự đặc biệt");
  return errors;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { message: "Missing email or password" },
        { status: 400 },
      );
    }

    // [FIX 1] Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return Response.json(
        { message: "Mật khẩu không đủ mạnh: " + passwordErrors.join(", ") },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return Response.json(
        { message: "Email already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password_hash: hashedPassword },
    });

    return Response.json({
      message: "Register success",
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
