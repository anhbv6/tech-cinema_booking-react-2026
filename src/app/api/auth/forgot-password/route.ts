import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/features/auth/schemas/auth.schema";

function generateCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({
        message: "If this email exists, reset instructions were sent",
      });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.passwordResetToken.deleteMany({ where: { email } });
    await prisma.passwordResetToken.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    return NextResponse.json({
      message: "Verification code sent",
      devCode: process.env.NODE_ENV === "development" ? code : undefined,
      expiresAt,
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to process forgot password" },
      { status: 500 }
    );
  }
}
