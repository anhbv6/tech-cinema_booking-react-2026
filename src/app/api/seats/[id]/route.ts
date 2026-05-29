import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { updateSeatSchema } from "@/features/admin/seats";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const body = await request.json();
    const values = updateSeatSchema.parse(body);

    const existingSeat = await prisma.seat.findUnique({
      where: {
        id,
      },
    });

    if (!existingSeat) {
      return NextResponse.json(
        {
          message: "Seat not found",
        },
        {
          status: 404,
        }
      );
    }

    const seat = await prisma.seat.update({
      where: {
        id,
      },
      data: {
        type: values.type,
        isActive: values.isActive,
      },
    });

    return NextResponse.json({
      message: "Seat updated successfully",
      data: seat,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: (error as { issues?: Array<{ message?: string }> })?.issues?.[0]?.message || "Failed to update seat",
      },
      {
        status: 400,
      }
    );
  }
}