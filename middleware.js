import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = ["/dashboard", "/security", "/settings", "/login-logs"];

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (!isProtected) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // [FIX 9] Verify chữ ký JWT thật sự thay vì chỉ check token tồn tại
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    // Token không hợp lệ hoặc hết hạn → redirect về login
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/security/:path*", "/settings/:path*", "/login-logs/:path*"],
};
