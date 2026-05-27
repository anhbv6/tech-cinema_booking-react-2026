import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { clearRefreshCookie } from "@/lib/security/server";
import { signAccessToken, verifyRefreshToken } from "@/lib/security/token";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      const res = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      clearRefreshCookie(res);
      return res;
    }

    const accessToken = await signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      accessToken,
      user,
    });
  } catch {
    const res = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    clearRefreshCookie(res);
    return res;
  }
}
