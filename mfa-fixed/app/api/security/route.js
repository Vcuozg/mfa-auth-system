import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    let token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) token = req.cookies.get("token")?.value;

    if (!token) {
      return Response.json({ message: "No token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        email: true,
        mfa_enabled: true,
        failed_attempts: true,
        locked_until: true,
        role: true,
      },
    });

    return Response.json({ user });
  } catch (error) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
}
