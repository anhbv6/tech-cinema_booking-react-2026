import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { updateShowtimeSchema } from "@/features/admin/showtimes";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

async function checkRoomScheduleConflict({
  roomId,
  startTime,
  endTime,
  excludeShowtimeId,
}: {
  roomId: string;
  startTime: Date;
  endTime: Date;
  excludeShowtimeId?: string;
}) {
  return prisma.showtime.findFirst({
    where: {
      roomId,
      status: {
        not: "CANCELLED",
      },
      isActive: true,
      ...(excludeShowtimeId
        ? {
            id: {
              not: excludeShowtimeId,
            },
          }
        : {}),
      AND: [
        {
          startTime: {
            lt: endTime,
          },
        },
        {
          endTime: {
            gt: startTime,
          },
        },
      ],
    },
  });
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const values = updateShowtimeSchema.parse(body);

    const existingShowtime = await prisma.showtime.findUnique({
      where: {
        id,
      },
    });

    if (!existingShowtime) {
      return NextResponse.json(
        {
          message: "Showtime not found",
        },
        {
          status: 404,
        }
      );
    }

    const movie = await prisma.movie.findUnique({
      where: {
        id: values.movieId,
      },
    });

    if (!movie) {
      return NextResponse.json(
        {
          message: "Movie not found",
        },
        {
          status: 404,
        }
      );
    }

    if (!movie.duration) {
      return NextResponse.json(
        {
          message: "Movie duration is required to update showtime",
        },
        {
          status: 400,
        }
      );
    }

    const room = await prisma.room.findUnique({
      where: {
        id: values.roomId,
      },
      include: {
        cinema: true,
        seats: {
          select: {
            id: true,
          },
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

    if (room.cinemaId !== values.cinemaId) {
      return NextResponse.json(
        {
          message: "Selected room does not belong to selected cinema",
        },
        {
          status: 400,
        }
      );
    }

    if (!room.seats.length) {
      return NextResponse.json(
        {
          message: "Room must have seats before updating showtime",
        },
        {
          status: 400,
        }
      );
    }

    const startTime = new Date(values.startTime);
    const endTime = addMinutes(startTime, movie.duration);

    if (Number.isNaN(startTime.getTime())) {
      return NextResponse.json(
        {
          message: "Invalid start time",
        },
        {
          status: 400,
        }
      );
    }

    if (values.status !== "CANCELLED" && values.isActive) {
      const conflict = await checkRoomScheduleConflict({
        roomId: values.roomId,
        startTime,
        endTime,
        excludeShowtimeId: id,
      });

      if (conflict) {
        return NextResponse.json(
          {
            message:
              "This room already has a showtime in the selected time range",
          },
          {
            status: 400,
          }
        );
      }
    }

    const showtime = await prisma.showtime.update({
      where: {
        id,
      },
      data: {
        movieId: values.movieId,
        roomId: values.roomId,
        startTime,
        endTime,
        price: values.price,
        status: values.status,
        isActive: values.isActive,
      },
    });

    return NextResponse.json({
      message: "Showtime updated successfully",
      data: showtime,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: (error as { issues?: Array<{ message?: string }> })?.issues?.[0]?.message || "Failed to update showtime",
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

    await prisma.showtime.update({
      where: {
        id,
      },
      data: {
        status: "CANCELLED",
        isActive: false,
      },
    });

    return NextResponse.json({
      message: "Showtime cancelled successfully",
    });
  } catch {
    return NextResponse.json(
      {
        message: "Failed to cancel showtime",
      },
      {
        status: 400,
      }
    );
  }
}
