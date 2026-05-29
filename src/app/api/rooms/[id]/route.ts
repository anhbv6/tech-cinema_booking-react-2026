import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { roomSchema } from "@/features/admin/rooms";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const values = roomSchema.parse(body);

    const existingRoom = await prisma.room.findUnique({
      where: {
        id,
      },
    });

    if (!existingRoom) {
      return NextResponse.json(
        {
          message: "Room not found",
        },
        {
          status: 404,
        }
      );
    }

    const cinema = await prisma.cinema.findUnique({
      where: {
        id: values.cinemaId,
      },
    });

    if (!cinema) {
      return NextResponse.json(
        {
          message: "Cinema not found",
        },
        {
          status: 404,
        }
      );
    }

    const duplicatedRoom = await prisma.room.findFirst({
      where: {
        id: {
          not: id,
        },
        cinemaId: values.cinemaId,
        name: values.name,
      },
    });

    if (duplicatedRoom) {
      return NextResponse.json(
        {
          message: "Room name already exists in this cinema",
        },
        {
          status: 400,
        }
      );
    }

    const room = await prisma.room.update({
      where: {
        id,
      },
      data: {
        name: values.name,
        type: values.type,
        cinemaId: values.cinemaId,
        isActive: values.isActive,
      },
      include: {
        cinema: {
          select: {
            id: true,
            name: true,
            city: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Room updated successfully",
      data: room,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: (error as { issues?: Array<{ message?: string }> })?.issues?.[0]?.message || "Failed to update room",
      },
      {
        status: 400,
      }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    await prisma.room.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Room deleted successfully",
    });
  } catch {
    return NextResponse.json(
      {
        message: "Failed to delete room",
      },
      {
        status: 400,
      }
    );
  }
}