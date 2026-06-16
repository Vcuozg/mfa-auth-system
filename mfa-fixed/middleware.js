import { NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/security",
  "/settings",
  "/login-logs",
  "/setup-mfa",
  "/admin",
];

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const isProtected = protectedRoutes.some((r) =>
    req.nextUrl.pathname.startsWith(r),
  );

  if (!isProtected) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Chỉ check token tồn tại ở middleware, verify chi tiết ở từng API route
  // (jose verify bị lỗi trên một số môi trường Next.js 16)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/security/:path*",
    "/settings/:path*",
    "/login-logs/:path*",
    "/setup-mfa/:path*",
    "/admin/:path*",
  ],
};
