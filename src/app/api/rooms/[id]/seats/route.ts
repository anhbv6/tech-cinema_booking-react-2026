import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { generateSeatsSchema } from "@/features/seats/schemas/seat.schema";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

function getRowLabel(index: number) {
  return String.fromCharCode(65 + index);
}

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    const room = await prisma.room.findUnique({
      where: {
        id,
      },
      include: {
        cinema: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        seats: {
          orderBy: [
            {
              row: "asc",
            },
            {
              number: "asc",
            },
          ],
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        {
          message: "Room not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      data: room,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Failed to fetch room seats",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const values = generateSeatsSchema.parse(body);

    const room = await prisma.room.findUnique({
      where: {
        id,
      },
    });

    if (!room) {
      return NextResponse.json(
        {
          message: "Room not found",
        },
        {
          status: 404,
        }
      );
    }

    const seats = [];

    for (let rowIndex = 0; rowIndex < values.rows; rowIndex++) {
      const row = getRowLabel(rowIndex);

      for (let number = 1; number <= values.seatsPerRow; number++) {
        seats.push({
          roomId: id,
          row,
          number,
          type: values.defaultType,
          isActive: true,
        });
      }
    }

    await prisma.$transaction([
      prisma.seat.deleteMany({
        where: {
          roomId: id,
        },
      }),
      prisma.seat.createMany({
        data: seats,
      }),
    ]);

    return NextResponse.json({
      message: "Seats generated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.issues?.[0]?.message || "Failed to generate seats",
      },
      {
        status: 400,
      }
    );
  }
}