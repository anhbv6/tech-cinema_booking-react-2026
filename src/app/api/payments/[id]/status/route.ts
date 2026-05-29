import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { updatePaymentStatusSchema } from "@/features/admin/payments";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const result = updatePaymentStatusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message:
            result.error.issues[0]?.message || "Invalid payment status",
        },
        { status: 400 }
      );
    }

    const existingPayment = await prisma.payment.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
        bookingId: true,
      },
    });

    if (!existingPayment) {
      return NextResponse.json(
        {
          message: "Payment not found",
        },
        { status: 404 }
      );
    }

    if (existingPayment.status === "REFUNDED") {
      return NextResponse.json(
        {
          message: "Refunded payment cannot be updated",
        },
        { status: 400 }
      );
    }

    const nextStatus = result.data.status;

    const payment = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: {
          id,
        },
        data: {
          status: nextStatus,
          paidAt: nextStatus === "SUCCESS" ? new Date() : undefined,
        },
      });

      if (nextStatus === "SUCCESS") {
        await tx.booking.update({
          where: {
            id: existingPayment.bookingId,
          },
          data: {
            status: "CONFIRMED",
          },
        });
      }

      if (nextStatus === "REFUNDED") {
        await tx.booking.update({
          where: {
            id: existingPayment.bookingId,
          },
          data: {
            status: "CANCELLED",
          },
        });
      }

      return updatedPayment;
    });

    return NextResponse.json({
      message: "Payment status updated successfully",
      data: payment,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Failed to update payment status",
      },
      { status: 500 }
    );
  }
}
