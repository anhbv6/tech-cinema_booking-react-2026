import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";

import { prisma } from "@/lib/prisma";
import { reportOverviewQuerySchema } from "@/features/admin/reports";

function getDefaultFromDate() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  date.setHours(0, 0, 0, 0);

  return date;
}

function getDefaultToDate() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);

  return date;
}

function parseDateRange(from?: string, to?: string) {
  const fromDate = from ? new Date(from) : getDefaultFromDate();
  const toDate = to ? new Date(to) : getDefaultToDate();

  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);

  return {
    fromDate,
    toDate,
  };
}

function getPeriodKey(date: Date, groupBy: "day" | "month") {
  if (groupBy === "month") {
    return format(date, "yyyy-MM");
  }

  return format(date, "yyyy-MM-dd");
}

function formatCurrencyValue(value: number) {
  return Math.round(value);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const result = reportOverviewQuerySchema.safeParse({
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
      groupBy: searchParams.get("groupBy") || "day",
    });

    if (!result.success) {
      return NextResponse.json(
        {
          message: result.error.issues[0]?.message || "Invalid report query",
        },
        { status: 400 }
      );
    }

    const { fromDate, toDate } = parseDateRange(
      result.data.from,
      result.data.to
    );

    const groupBy = result.data.groupBy;

    const [bookings, payments, totalUsers, totalActiveUsers] =
      await Promise.all([
        prisma.booking.findMany({
          where: {
            createdAt: {
              gte: fromDate,
              lte: toDate,
            },
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
                movie: {
                  select: {
                    id: true,
                    title: true,
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
                    seats: {
                      where: {
                        isActive: true,
                      },
                      select: {
                        id: true,
                      },
                    },
                  },
                },
              },
            },
            seats: {
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
            payments: {
              select: {
                id: true,
                amount: true,
                method: true,
                status: true,
                paidAt: true,
                createdAt: true,
              },
            },
          },
        }),

        prisma.payment.findMany({
          where: {
            createdAt: {
              gte: fromDate,
              lte: toDate,
            },
          },
          include: {
            booking: {
              select: {
                id: true,
                status: true,
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
                    movie: {
                      select: {
                        id: true,
                        title: true,
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
        }),

        prisma.user.count(),

        prisma.user.count({
          where: {
            isActive: true,
          },
        }),
      ]);

    const successfulPayments = payments.filter(
      (payment) => payment.status === "SUCCESS"
    );

    const confirmedBookings = bookings.filter(
      (booking) => booking.status === "CONFIRMED"
    );

    const cancelledBookings = bookings.filter(
      (booking) => booking.status === "CANCELLED"
    );

    const pendingBookings = bookings.filter(
      (booking) => booking.status === "PENDING"
    );

    const expiredBookings = bookings.filter(
      (booking) => booking.status === "EXPIRED"
    );

    const totalRevenue = successfulPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const ticketsSold = confirmedBookings.reduce(
      (sum, booking) => sum + booking.seats.length,
      0
    );

    const averageOrderValue =
      successfulPayments.length > 0
        ? totalRevenue / successfulPayments.length
        : 0;

    const revenueMap = new Map<
      string,
      {
        period: string;
        revenue: number;
        payments: number;
        bookings: number;
        tickets: number;
      }
    >();

    for (const payment of successfulPayments) {
      const date = payment.paidAt || payment.createdAt;
      const period = getPeriodKey(date, groupBy);

      const current = revenueMap.get(period) || {
        period,
        revenue: 0,
        payments: 0,
        bookings: 0,
        tickets: 0,
      };

      current.revenue += payment.amount;
      current.payments += 1;

      revenueMap.set(period, current);
    }

    for (const booking of confirmedBookings) {
      const period = getPeriodKey(booking.createdAt, groupBy);

      const current = revenueMap.get(period) || {
        period,
        revenue: 0,
        payments: 0,
        bookings: 0,
        tickets: 0,
      };

      current.bookings += 1;
      current.tickets += booking.seats.length;

      revenueMap.set(period, current);
    }

    const revenueByPeriod = Array.from(revenueMap.values()).sort((a, b) =>
      a.period.localeCompare(b.period)
    );

    const bookingStatusBreakdown = [
      {
        status: "PENDING",
        count: pendingBookings.length,
      },
      {
        status: "CONFIRMED",
        count: confirmedBookings.length,
      },
      {
        status: "CANCELLED",
        count: cancelledBookings.length,
      },
      {
        status: "EXPIRED",
        count: expiredBookings.length,
      },
    ];

    const paymentStatusBreakdown = [
      "PENDING",
      "SUCCESS",
      "FAILED",
      "REFUNDED",
      "CANCELLED",
    ].map((status) => ({
      status,
      count: payments.filter((payment) => payment.status === status).length,
    }));

    const paymentMethodBreakdown = [
      "CASH",
      "MOMO",
      "VNPAY",
      "BANK_TRANSFER",
      "CREDIT_CARD",
    ].map((method) => {
      const methodPayments = successfulPayments.filter(
        (payment) => payment.method === method
      );

      return {
        method,
        count: methodPayments.length,
        revenue: methodPayments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        ),
      };
    });

    const movieMap = new Map<
      string,
      {
        movieId: string;
        title: string;
        revenue: number;
        bookings: number;
        tickets: number;
      }
    >();

    for (const booking of confirmedBookings) {
      const movie = booking.showtime.movie;

      const current = movieMap.get(movie.id) || {
        movieId: movie.id,
        title: movie.title,
        revenue: 0,
        bookings: 0,
        tickets: 0,
      };

      current.bookings += 1;
      current.tickets += booking.seats.length;
      current.revenue += booking.payments
        .filter((payment) => payment.status === "SUCCESS")
        .reduce((sum, payment) => sum + payment.amount, 0);

      movieMap.set(movie.id, current);
    }

    const topMovies = Array.from(movieMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const cinemaMap = new Map<
      string,
      {
        cinemaId: string;
        name: string;
        city: string;
        revenue: number;
        bookings: number;
        tickets: number;
      }
    >();

    for (const booking of confirmedBookings) {
      const cinema = booking.showtime.room.cinema;

      const current = cinemaMap.get(cinema.id) || {
        cinemaId: cinema.id,
        name: cinema.name,
        city: cinema.city,
        revenue: 0,
        bookings: 0,
        tickets: 0,
      };

      current.bookings += 1;
      current.tickets += booking.seats.length;
      current.revenue += booking.payments
        .filter((payment) => payment.status === "SUCCESS")
        .reduce((sum, payment) => sum + payment.amount, 0);

      cinemaMap.set(cinema.id, current);
    }

    const topCinemas = Array.from(cinemaMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const showtimeMap = new Map<
      string,
      {
        showtimeId: string;
        movieTitle: string;
        cinemaName: string;
        roomName: string;
        startTime: Date;
        soldSeats: number;
        totalSeats: number;
        occupancyRate: number;
      }
    >();

    for (const booking of confirmedBookings) {
      const showtime = booking.showtime;
      const totalSeats = showtime.room.seats.length;

      const current = showtimeMap.get(showtime.id) || {
        showtimeId: showtime.id,
        movieTitle: showtime.movie.title,
        cinemaName: showtime.room.cinema.name,
        roomName: showtime.room.name,
        startTime: showtime.startTime,
        soldSeats: 0,
        totalSeats,
        occupancyRate: 0,
      };

      current.soldSeats += booking.seats.length;
      current.occupancyRate =
        current.totalSeats > 0
          ? Math.round((current.soldSeats / current.totalSeats) * 100)
          : 0;

      showtimeMap.set(showtime.id, current);
    }

    const showtimeOccupancy = Array.from(showtimeMap.values())
      .sort((a, b) => b.occupancyRate - a.occupancyRate)
      .slice(0, 10)
      .map((item) => ({
        ...item,
        startTime: item.startTime.toISOString(),
      }));

    const recentBookings = bookings.slice(0, 10).map((booking) => ({
      id: booking.id,
      status: booking.status,
      totalAmount: booking.totalAmount,
      createdAt: booking.createdAt.toISOString(),
      customerName: booking.user.name,
      customerEmail: booking.user.email,
      movieTitle: booking.showtime.movie.title,
      cinemaName: booking.showtime.room.cinema.name,
      seats: booking.seats.map(
        (item) => `${item.seat.row}${item.seat.number}`
      ),
    }));

    const recentPayments = payments.slice(0, 10).map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      paidAt: payment.paidAt?.toISOString() || null,
      createdAt: payment.createdAt.toISOString(),
      bookingId: payment.booking.id,
      customerName: payment.booking.user.name,
      customerEmail: payment.booking.user.email,
      movieTitle: payment.booking.showtime.movie.title,
    }));

    return NextResponse.json({
      data: {
        range: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
          groupBy,
        },
        summary: {
          totalRevenue: formatCurrencyValue(totalRevenue),
          totalBookings: bookings.length,
          confirmedBookings: confirmedBookings.length,
          cancelledBookings: cancelledBookings.length,
          pendingBookings: pendingBookings.length,
          expiredBookings: expiredBookings.length,
          ticketsSold,
          totalPayments: payments.length,
          successfulPayments: successfulPayments.length,
          averageOrderValue: formatCurrencyValue(averageOrderValue),
          totalUsers,
          totalActiveUsers,
        },
        revenueByPeriod,
        bookingStatusBreakdown,
        paymentStatusBreakdown,
        paymentMethodBreakdown,
        topMovies,
        topCinemas,
        showtimeOccupancy,
        recentBookings,
        recentPayments,
      },
    });
  } catch {
    return NextResponse.json(
      {
        message: "Failed to fetch report overview",
      },
      { status: 500 }
    );
  }
}
