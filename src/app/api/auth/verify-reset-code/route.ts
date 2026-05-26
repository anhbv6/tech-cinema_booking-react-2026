import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyResetCodeSchema } from "@/features/auth/schemas/auth.schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifyResetCodeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();

    const token = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        code: parsed.data.code,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
      },
    });

    if (!token) {
      return NextResponse.json(
        { message: "Invalid or expired code" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Code is valid" });
  } catch {
    return NextResponse.json(
      { message: "Failed to verify code" },
      { status: 500 }
    );
  }
}
