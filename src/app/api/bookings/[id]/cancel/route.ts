import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const booking = await prisma.booking.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          message: "Booking not found",
        },
        { status: 404 }
      );
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        {
          message: "Booking is already cancelled",
        },
        { status: 400 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json({
      message: "Booking cancelled successfully",
      data: updatedBooking,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to cancel booking",
      },
      { status: 500 }
    );
  }
}