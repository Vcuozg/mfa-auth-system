import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    // [FIX 8] Thêm xác thực JWT — trước đây API này hoàn toàn public
    let token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) token = req.cookies.get("token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!currentUser) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    // [FIX 8] User thường chỉ xem log của chính mình, ADMIN xem tất cả
    const where = currentUser.role === "ADMIN" ? {} : { user_id: currentUser.id };

    const logs = await prisma.loginLog.findMany({
      where,
      orderBy: { login_time: "desc" },
      take: 50,
      include: { user: { select: { email: true } } },
    });

    return Response.json({ message: "Get login logs success", logs });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
}
