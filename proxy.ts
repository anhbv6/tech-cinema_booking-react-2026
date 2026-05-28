import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyRefreshToken } from "@/lib/security/token";

const adminRoles = ["ADMIN", "MANAGER", "STAFF"] as const;
const clientProtectedPrefixes = ["/discovery", "/about"] as const;
const clientAuthRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-reset-code"] as const;

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isClientProtectedRoute = clientProtectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isClientAuthRoute = clientAuthRoutes.some((route) => pathname === route);
  const isAdminLoginRoute = pathname === "/admin/login";

  const shouldCheckSession =
    isAdminRoute || isClientProtectedRoute || isClientAuthRoute || isAdminLoginRoute;
  if (!shouldCheckSession) return NextResponse.next();

  const refreshToken = request.cookies.get("refreshToken")?.value;
  if (!refreshToken) {
    if (isClientAuthRoute || isAdminLoginRoute) {
      return NextResponse.next();
    }

    const loginPath = isAdminRoute ? "/admin/login" : "/login";
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  let role = "";
  try {
    const payload = await verifyRefreshToken(refreshToken);
    role = String(payload.role || "");
  } catch {
    if (isClientAuthRoute || isAdminLoginRoute) {
      return NextResponse.next();
    }

    const loginPath = isAdminRoute ? "/admin/login" : "/login";
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  if (isClientAuthRoute) {
    if (role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/discovery", request.url));
    }

    if (adminRoles.includes(role as (typeof adminRoles)[number])) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  if (isAdminLoginRoute) {
    if (adminRoles.includes(role as (typeof adminRoles)[number])) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return NextResponse.redirect(new URL("/discovery", request.url));
  }

  if (isAdminRoute && !adminRoles.includes(role as (typeof adminRoles)[number])) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isClientProtectedRoute && role !== "CUSTOMER") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/discovery/:path*",
    "/about/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-reset-code",
  ],
};
