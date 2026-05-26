"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Banknote,
  CalendarClock,
  CreditCard,
  Film,
  Ticket,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "@/lib/axios";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DashboardResponse = {
  data: {
    summary: {
      todayRevenue: number;
      todayBookings: number;
      todayTicketsSold: number;
      todaySuccessfulPayments: number;
      totalUsers: number;
      activeMovies: number;
      upcomingShowtimes: number;
    };
    revenueChart: {
      date: string;
      revenue: number;
      bookings: number;
      tickets: number;
    }[];
    bookingStatusOverview: {
      status: string;
      count: number;
    }[];
    topMovies: {
      id: string;
      title: string;
      revenue: number;
      tickets: number;
    }[];
    topCinemas: {
      id: string;
      name: string;
      city: string;
      revenue: number;
      tickets: number;
    }[];
    recentBookings: {
      id: string;
      status: string;
      totalAmount: number;
      createdAt: string;
      customerName: string | null;
      customerEmail: string;
      movieTitle: string;
      cinemaName: string;
      seats: string[];
    }[];
    recentPayments: {
      id: string;
      amount: number;
      method: string;
      status: string;
      createdAt: string;
      paidAt: string | null;
      customerName: string | null;
      customerEmail: string;
      movieTitle: string;
    }[];
  };
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function getStatusBadgeClassName(status: string) {
  switch (status) {
    case "CONFIRMED":
    case "SUCCESS":
      return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
    case "PENDING":
      return "bg-amber-100 text-amber-700 hover:bg-amber-100";
    case "CANCELLED":
    case "FAILED":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    case "REFUNDED":
      return "bg-purple-100 text-purple-700 hover:bg-purple-100";
    case "EXPIRED":
      return "bg-zinc-100 text-zinc-700 hover:bg-zinc-100";
    default:
      return "bg-zinc-100 text-zinc-700 hover:bg-zinc-100";
  }
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Banknote;
}) {
  return (
    <Card className="rounded-2xl border-zinc-100">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-500">
          {title}
        </CardTitle>
        <Icon size={18} className="text-zinc-400" />
      </CardHeader>

      <CardContent>
        <p className="text-2xl font-semibold text-zinc-950">{value}</p>
        <p className="mt-1 text-xs text-zinc-500">{description}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await api.get<DashboardResponse>("/dashboard");

      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-100 bg-white p-8 text-center text-sm text-zinc-500">
        Loading dashboard...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-zinc-100 bg-white p-8 text-center text-sm text-zinc-500">
        No dashboard data found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today revenue"
          value={formatCurrency(data.summary.todayRevenue)}
          description="Successful payments today"
          icon={Banknote}
        />

        <StatCard
          title="Today bookings"
          value={formatNumber(data.summary.todayBookings)}
          description="New bookings today"
          icon={Ticket}
        />

        <StatCard
          title="Tickets sold"
          value={formatNumber(data.summary.todayTicketsSold)}
          description="From confirmed bookings today"
          icon={CreditCard}
        />

        <StatCard
          title="Upcoming showtimes"
          value={formatNumber(data.summary.upcomingShowtimes)}
          description="Scheduled showtimes from today"
          icon={CalendarClock}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Users"
          value={formatNumber(data.summary.totalUsers)}
          description="Total registered accounts"
          icon={Users}
        />

        <StatCard
          title="Active movies"
          value={formatNumber(data.summary.activeMovies)}
          description="Now showing and coming soon"
          icon={Film}
        />

        <StatCard
          title="Successful payments"
          value={formatNumber(data.summary.todaySuccessfulPayments)}
          description="Payment success count today"
          icon={CreditCard}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="rounded-2xl border-zinc-100">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-zinc-950">
              Revenue overview
            </CardTitle>
            <p className="text-sm text-zinc-500">
              Revenue, bookings, and tickets in the last 7 days.
            </p>
          </CardHeader>

          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueChart}>
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#18181b" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("vi-VN", {
                        notation: "compact",
                      }).format(Number(value))
                    }
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "revenue") {
                        return [formatCurrency(Number(value)), "Revenue"];
                      }

                      return [value, name];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#18181b"
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-100">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-zinc-950">
              Booking status
            </CardTitle>
            <p className="text-sm text-zinc-500">
              Last 7 days booking status.
            </p>
          </CardHeader>

          <CardContent className="space-y-3">
            {data.bookingStatusOverview.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-3"
              >
                <Badge className={getStatusBadgeClassName(item.status)}>
                  {item.status}
                </Badge>

                <span className="font-semibold text-zinc-950">
                  {item.count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl border-zinc-100">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-zinc-950">
              Top movies
            </CardTitle>
            <p className="text-sm text-zinc-500">
              Best performing movies in the last 7 days.
            </p>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Movie</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Tickets</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {!data.topMovies.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-sm text-zinc-500"
                    >
                      No movie data.
                    </TableCell>
                  </TableRow>
                ) : null}

                {data.topMovies.map((movie) => (
                  <TableRow key={movie.id}>
                    <TableCell className="font-medium text-zinc-950">
                      {movie.title}
                    </TableCell>
                    <TableCell>{formatCurrency(movie.revenue)}</TableCell>
                    <TableCell>{movie.tickets}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-100">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-zinc-950">
              Top cinemas
            </CardTitle>
            <p className="text-sm text-zinc-500">
              Best performing cinemas in the last 7 days.
            </p>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cinema</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Tickets</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {!data.topCinemas.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-sm text-zinc-500"
                    >
                      No cinema data.
                    </TableCell>
                  </TableRow>
                ) : null}

                {data.topCinemas.map((cinema) => (
                  <TableRow key={cinema.id}>
                    <TableCell>
                      <p className="font-medium text-zinc-950">
                        {cinema.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {cinema.city}
                      </p>
                    </TableCell>
                    <TableCell>{formatCurrency(cinema.revenue)}</TableCell>
                    <TableCell>{cinema.tickets}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl border-zinc-100">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-zinc-950">
              Recent bookings
            </CardTitle>
            <p className="text-sm text-zinc-500">
              Latest bookings from customers.
            </p>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {!data.recentBookings.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-sm text-zinc-500"
                    >
                      No recent bookings.
                    </TableCell>
                  </TableRow>
                ) : null}

                {data.recentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-zinc-950">
                          #{booking.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {format(new Date(booking.createdAt), "dd/MM HH:mm")}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium text-zinc-950">
                          {booking.customerName || "Unnamed user"}
                        </p>
                        <p className="mt-1 max-w-[180px] truncate text-xs text-zinc-500">
                          {booking.movieTitle}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={getStatusBadgeClassName(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-100">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-zinc-950">
              Recent payments
            </CardTitle>
            <p className="text-sm text-zinc-500">
              Latest payment transactions.
            </p>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {!data.recentPayments.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-sm text-zinc-500"
                    >
                      No recent payments.
                    </TableCell>
                  </TableRow>
                ) : null}

                {data.recentPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-zinc-950">
                          #{payment.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {payment.method}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>{formatCurrency(payment.amount)}</TableCell>

                    <TableCell>
                      <Badge className={getStatusBadgeClassName(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}