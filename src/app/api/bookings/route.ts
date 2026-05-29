import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        showtime: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            price: true,
            movie: {
              select: {
                id: true,
                title: true,
                posterUrl: true,
              },
            },
            room: {
              select: {
                id: true,
                name: true,
                cinema: {
                  select: {
                    id: true,
                    name: true,
                    city: true,
                  },
                },
              },
            },
          },
        },
        seats: {
          orderBy: [
            {
              seat: {
                row: "asc",
              },
            },
            {
              seat: {
                number: "asc",
              },
            },
          ],
          select: {
            id: true,
            price: true,
            seat: {
              select: {
                id: true,
                row: true,
                number: true,
                type: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      data: bookings,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Failed to fetch bookings",
      },
      { status: 500 }
    );
  }
}
