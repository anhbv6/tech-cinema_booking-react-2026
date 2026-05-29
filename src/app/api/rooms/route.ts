import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { roomSchema } from "@/features/admin/rooms";

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: rooms,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Failed to fetch rooms",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const values = roomSchema.parse(body);

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

    const existingRoom = await prisma.room.findUnique({
      where: {
        cinemaId_name: {
          cinemaId: values.cinemaId,
          name: values.name,
        },
      },
    });

    if (existingRoom) {
      return NextResponse.json(
        {
          message: "Room name already exists in this cinema",
        },
        {
          status: 400,
        }
      );
    }

    const room = await prisma.room.create({
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
      message: "Room created successfully",
      data: room,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: (error as { issues?: Array<{ message?: string }> })?.issues?.[0]?.message || "Failed to create room",
      },
      {
        status: 400,
      }
    );
  }
}