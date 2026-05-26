import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const isActive = body.isActive;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        {
          message: "Invalid active status",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      data: user,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update user status",
      },
      { status: 500 }
    );
  }
}