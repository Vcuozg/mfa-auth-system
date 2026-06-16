import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
    let token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) token = req.cookies.get("token")?.value;
    if (!token) return Response.json({ message: "No token" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { oldPassword, newPassword } = await req.json();

    // [FIX] Validate độ mạnh mật khẩu mới
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return Response.json(
        { message: "Mật khẩu mới không đủ mạnh: " + passwordErrors.join(", ") },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user)
      return Response.json({ message: "User not found" }, { status: 404 });

    const valid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!valid)
      return Response.json(
        { message: "Old password is incorrect" },
        { status: 401 },
      );

    // [FIX] Không cho phép đặt lại mật khẩu cũ
    const isSame = await bcrypt.compare(newPassword, user.password_hash);
    if (isSame) {
      return Response.json(
        { message: "Mật khẩu mới không được trùng mật khẩu cũ" },
        { status: 400 },
      );
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: newHash, failed_attempts: 0, locked_until: null },
    });

    return Response.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
