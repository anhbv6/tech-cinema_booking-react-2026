import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { resetPasswordWithCodeSchema } from "@/features/shared/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetPasswordWithCodeSchema.safeParse(body);

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
      orderBy: {
        createdAt: "desc",
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

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ message: "Password has been reset successfully" });
  } catch {
    return NextResponse.json(
      { message: "Failed to reset password" },
      { status: 500 }
    );
  }
}
