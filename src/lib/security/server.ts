import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifyAccessToken } from "@/lib/security/token";

const adminRoles = ["ADMIN", "MANAGER", "STAFF"] as const;

function extractBearerToken(request: Request | NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) return null;
  return authHeader.slice(7).trim();
}

export async function getAuthUser(request: Request | NextRequest) {
  const token = extractBearerToken(request);
  if (!token) return null;

  try {
    const payload = await verifyAccessToken(token);

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(request: Request | NextRequest) {
  const user = await getAuthUser(request);

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true as const, user };
}

export async function requireAdmin(request: Request | NextRequest) {
  const auth = await requireAuth(request);

  if (!auth.ok) return auth;

  if (!adminRoles.includes(auth.user.role as (typeof adminRoles)[number])) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
    };
  }

  return auth;
}

export function clearRefreshCookie(response: NextResponse) {
  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
