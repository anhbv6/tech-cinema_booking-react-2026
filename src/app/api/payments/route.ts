import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
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
          },
        },
      },
    });

    return NextResponse.json({
      data: payments,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch payments",
      },
      { status: 500 }
    );
  }
}