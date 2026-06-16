import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    // [FIX] Hỗ trợ cả Authorization header lẫn httpOnly cookie
    let token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) token = req.cookies.get("token")?.value;

    if (!token) {
      return Response.json({ message: "No token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        mfa_enabled: true,
        failed_attempts: true,
        locked_until: true,
        created_at: true,
      },
    });

    return Response.json({ message: "Get users success", users });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
}
