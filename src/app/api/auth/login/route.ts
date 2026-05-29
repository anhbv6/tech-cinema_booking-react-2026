import { NextRequest, NextResponse } from "next/server";

import { loginSchema } from "@/features/shared/auth";
import { loginByPortal } from "@/lib/auth/login-service";

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

    const portal = body?.portal === "admin" ? "admin" : "client";
    const result = await loginByPortal({
      email: parsed.data.email,
      password: parsed.data.password,
      remember: Boolean(parsed.data.remember),
      portal,
    });

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }

    const response = NextResponse.json({
      message: "Login successfully",
      accessToken: result.accessToken,
      user: result.user,
    });

    response.cookies.set("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: result.refreshMaxAge,
    });

    return response;
  } catch {
    return NextResponse.json({ message: "Failed to login" }, { status: 500 });
  }
}
