import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createShowtimeSchema } from "@/features/showtimes/schemas/showtime.schema";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date");
    const cinemaId = searchParams.get("cinemaId");
    const movieId = searchParams.get("movieId");

    const startOfDay = date ? new Date(`${date}T00:00:00`) : null;
    const endOfDay = date ? new Date(`${date}T23:59:59`) : null;

    const showtimes = await prisma.showtime.findMany({
      where: {
        ...(movieId
          ? {
              movieId,
            }
          : {}),
        ...(cinemaId
          ? {
              room: {
                cinemaId,
              },
            }
          : {}),
        ...(startOfDay && endOfDay
          ? {
              startTime: {
                gte: startOfDay,
                lte: endOfDay,
              },
            }
          : {}),
      },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
            duration: true,
            status: true,
            isActive: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            type: true,
            isActive: true,
            cinemaId: true,
            cinema: {
              select: {
                id: true,
                name: true,
                city: true,
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json({
      data: showtimes,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Failed to fetch showtimes",
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
    const values = createShowtimeSchema.parse(body);

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

    if (!movie.isActive) {
      return NextResponse.json(
        {
          message: "Movie is inactive",
        },
        {
          status: 400,
        }
      );
    }

    if (!movie.duration) {
      return NextResponse.json(
        {
          message: "Movie duration is required to create showtime",
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

    if (!room.isActive || !room.cinema.isActive) {
      return NextResponse.json(
        {
          message: "Room or cinema is inactive",
        },
        {
          status: 400,
        }
      );
    }

    if (!room.seats.length) {
      return NextResponse.json(
        {
          message: "Room must have seats before creating showtime",
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

    const conflict = await checkRoomScheduleConflict({
      roomId: values.roomId,
      startTime,
      endTime,
    });

    if (conflict) {
      return NextResponse.json(
        {
          message: "This room already has a showtime in the selected time range",
        },
        {
          status: 400,
        }
      );
    }

    const showtime = await prisma.showtime.create({
        data: {
            movieId: values.movieId,
            roomId: values.roomId,
            startTime,
            endTime,
            price: values.price,
            status: "SCHEDULED",
            isActive: values.isActive,
        },
    });

    return NextResponse.json({
      message: "Showtime created successfully",
      data: showtime,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.issues?.[0]?.message || "Failed to create showtime",
      },
      {
        status: 400,
      }
    );
  }
}