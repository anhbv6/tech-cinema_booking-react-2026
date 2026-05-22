import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const adminRoles = ["ADMIN", "MANAGER", "STAFF"] as const;

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/admin/login", request.url);

    loginUrl.searchParams.set("callbackUrl", pathname + search);

    return NextResponse.redirect(loginUrl);
  }

  const role = String(token.role || "");

  if (!adminRoles.includes(role as (typeof adminRoles)[number])) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};