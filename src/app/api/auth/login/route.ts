import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/features/auth/schemas/auth.schema";
import {
  getRefreshCookieMaxAge,
  signAccessToken,
  signRefreshToken,
} from "@/lib/security/token";

const adminRoles = ["ADMIN", "MANAGER", "STAFF"] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid credentials" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password || !user.isActive) {
      return NextResponse.json(
        { message: "Email or password is incorrect" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(parsed.data.password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Email or password is incorrect" },
        { status: 401 }
      );
    }

    const remember = Boolean(parsed.data.remember);
    const portal = body?.portal === "admin" ? "admin" : "client";

    const isAdminRole = adminRoles.includes(
      user.role as (typeof adminRoles)[number]
    );

    if (portal === "client" && user.role !== "CUSTOMER") {
      return NextResponse.json(
        { message: "Please login via admin portal" },
        { status: 403 }
      );
    }

    if (portal === "admin" && !isAdminRole) {
      return NextResponse.json(
        { message: "You are not allowed to access admin portal" },
        { status: 403 }
      );
    }

    const accessToken = await signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await signRefreshToken(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      remember
    );

    const response = NextResponse.json({
      message: "Login successfully",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      },
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: getRefreshCookieMaxAge(remember),
    });

    return response;
  } catch {
    return NextResponse.json({ message: "Failed to login" }, { status: 500 });
  }
}
