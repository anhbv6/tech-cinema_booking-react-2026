import { NextResponse } from "next/server";
import { format, subDays } from "date-fns";

import { prisma } from "@/lib/prisma";

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);

  return result;
}

function endOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);

  return result;
}

function getDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export async function GET() {
  try {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const sevenDaysAgo = startOfDay(subDays(today, 6));

    const [
      todayBookings,
      todayPayments,
      recentBookings,
      recentPayments,
      totalUsers,
      activeMovies,
      upcomingShowtimes,
      allBookingsLast7Days,
      successfulPaymentsLast7Days,
    ] = await Promise.all([
      prisma.booking.findMany({
        where: {
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        include: {
          seats: {
            select: {
              id: true,
            },
          },
        },
      }),

      prisma.payment.findMany({
        where: {
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),

      prisma.booking.findMany({
        take: 6,
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
                    },
                  },
                },
              },
            },
          },
          seats: {
            select: {
              id: true,
              seat: {
                select: {
                  row: true,
                  number: true,
                },
              },
            },
          },
        },
      }),

      prisma.payment.findMany({
        take: 6,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          booking: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              showtime: {
                select: {
                  movie: {
                    select: {
                      id: true,
                      title: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),

      prisma.user.count(),

      prisma.movie.count({
        where: {
          isActive: true,
          status: {
            in: ["NOW_SHOWING", "COMING_SOON"],
          },
        },
      }),

      prisma.showtime.count({
        where: {
          isActive: true,
          status: "SCHEDULED",
          startTime: {
            gte: todayStart,
          },
        },
      }),

      prisma.booking.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
            lte: todayEnd,
          },
        },
        include: {
          seats: {
            select: {
              id: true,
            },
          },
          showtime: {
            select: {
              movie: {
                select: {
                  id: true,
                  title: true,
                },
              },
              room: {
                select: {
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
          payments: {
            select: {
              amount: true,
              status: true,
            },
          },
        },
      }),

      prisma.payment.findMany({
        where: {
          status: "SUCCESS",
          createdAt: {
            gte: sevenDaysAgo,
            lte: todayEnd,
          },
        },
      }),
    ]);

    const todaySuccessfulPayments = todayPayments.filter(
      (payment) => payment.status === "SUCCESS"
    );

    const todayRevenue = todaySuccessfulPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const todayConfirmedBookings = todayBookings.filter(
      (booking) => booking.status === "CONFIRMED"
    );

    const todayTicketsSold = todayConfirmedBookings.reduce(
      (sum, booking) => sum + booking.seats.length,
      0
    );

    const revenueMap = new Map<
      string,
      {
        date: string;
        revenue: number;
        bookings: number;
        tickets: number;
      }
    >();

    for (let index = 6; index >= 0; index--) {
      const date = subDays(today, index);
      const key = getDateKey(date);

      revenueMap.set(key, {
        date: format(date, "dd/MM"),
        revenue: 0,
        bookings: 0,
        tickets: 0,
      });
    }

    for (const payment of successfulPaymentsLast7Days) {
      const key = getDateKey(payment.createdAt);
      const current = revenueMap.get(key);

      if (current) {
        current.revenue += payment.amount;
      }
    }

    for (const booking of allBookingsLast7Days) {
      const key = getDateKey(booking.createdAt);
      const current = revenueMap.get(key);

      if (current) {
        current.bookings += 1;

        if (booking.status === "CONFIRMED") {
          current.tickets += booking.seats.length;
        }
      }
    }

    const revenueChart = Array.from(revenueMap.values());

    const bookingStatusOverview = [
      {
        status: "PENDING",
        count: allBookingsLast7Days.filter(
          (booking) => booking.status === "PENDING"
        ).length,
      },
      {
        status: "CONFIRMED",
        count: allBookingsLast7Days.filter(
          (booking) => booking.status === "CONFIRMED"
        ).length,
      },
      {
        status: "CANCELLED",
        count: allBookingsLast7Days.filter(
          (booking) => booking.status === "CANCELLED"
        ).length,
      },
      {
        status: "EXPIRED",
        count: allBookingsLast7Days.filter(
          (booking) => booking.status === "EXPIRED"
        ).length,
      },
    ];

    const movieMap = new Map<
      string,
      {
        id: string;
        title: string;
        revenue: number;
        tickets: number;
      }
    >();

    for (const booking of allBookingsLast7Days) {
      if (booking.status !== "CONFIRMED") continue;

      const movie = booking.showtime.movie;

      const current = movieMap.get(movie.id) || {
        id: movie.id,
        title: movie.title,
        revenue: 0,
        tickets: 0,
      };

      current.tickets += booking.seats.length;
      current.revenue += booking.payments
        .filter((payment) => payment.status === "SUCCESS")
        .reduce((sum, payment) => sum + payment.amount, 0);

      movieMap.set(movie.id, current);
    }

    const topMovies = Array.from(movieMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const cinemaMap = new Map<
      string,
      {
        id: string;
        name: string;
        city: string;
        revenue: number;
        tickets: number;
      }
    >();

    for (const booking of allBookingsLast7Days) {
      if (booking.status !== "CONFIRMED") continue;

      const cinema = booking.showtime.room.cinema;

      const current = cinemaMap.get(cinema.id) || {
        id: cinema.id,
        name: cinema.name,
        city: cinema.city,
        revenue: 0,
        tickets: 0,
      };

      current.tickets += booking.seats.length;
      current.revenue += booking.payments
        .filter((payment) => payment.status === "SUCCESS")
        .reduce((sum, payment) => sum + payment.amount, 0);

      cinemaMap.set(cinema.id, current);
    }

    const topCinemas = Array.from(cinemaMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return NextResponse.json({
      data: {
        summary: {
          todayRevenue,
          todayBookings: todayBookings.length,
          todayTicketsSold,
          todaySuccessfulPayments: todaySuccessfulPayments.length,
          totalUsers,
          activeMovies,
          upcomingShowtimes,
        },
        revenueChart,
        bookingStatusOverview,
        topMovies,
        topCinemas,
        recentBookings: recentBookings.map((booking) => ({
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
        })),
        recentPayments: recentPayments.map((payment) => ({
          id: payment.id,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          createdAt: payment.createdAt.toISOString(),
          paidAt: payment.paidAt?.toISOString() || null,
          customerName: payment.booking.user.name,
          customerEmail: payment.booking.user.email,
          movieTitle: payment.booking.showtime.movie.title,
        })),
      },
    });
  } catch {
    return NextResponse.json(
      {
        message: "Failed to fetch dashboard data",
      },
      { status: 500 }
    );
  }
}
