import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/security/server";

const roles = ["ADMIN", "MANAGER", "STAFF", "CUSTOMER"];

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { id } = await context.params;
    const body = await request.json();

    const role = body.role;

    if (!roles.includes(role)) {
      return NextResponse.json(
        {
          message: "Invalid role",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        role,
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
      message: "User role updated successfully",
      data: user,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Failed to update user role",
      },
      { status: 500 }
    );
  }
}
