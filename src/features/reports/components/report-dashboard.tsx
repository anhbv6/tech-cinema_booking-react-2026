"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Banknote,
  CalendarDays,
  Download,
  Film,
  Search,
  Ticket,
  Users,
} from "lucide-react";

import { api } from "@/lib/axios";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ReportGroupBy = "day" | "month";

type ReportOverview = {
  range: {
    from: string;
    to: string;
    groupBy: ReportGroupBy;
  };
  summary: {
    totalRevenue: number;
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    pendingBookings: number;
    expiredBookings: number;
    ticketsSold: number;
    totalPayments: number;
    successfulPayments: number;
    averageOrderValue: number;
    totalUsers: number;
    totalActiveUsers: number;
  };
  revenueByPeriod: {
    period: string;
    revenue: number;
    payments: number;
    bookings: number;
    tickets: number;
  }[];
  bookingStatusBreakdown: {
    status: string;
    count: number;
  }[];
  paymentStatusBreakdown: {
    status: string;
    count: number;
  }[];
  paymentMethodBreakdown: {
    method: string;
    count: number;
    revenue: number;
  }[];
  topMovies: {
    movieId: string;
    title: string;
    revenue: number;
    bookings: number;
    tickets: number;
  }[];
  topCinemas: {
    cinemaId: string;
    name: string;
    city: string;
    revenue: number;
    bookings: number;
    tickets: number;
  }[];
  showtimeOccupancy: {
    showtimeId: string;
    movieTitle: string;
    cinemaName: string;
    roomName: string;
    startTime: string;
    soldSeats: number;
    totalSeats: number;
    occupancyRate: number;
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
    paidAt: string | null;
    createdAt: string;
    bookingId: string;
    customerName: string | null;
    customerEmail: string;
    movieTitle: string;
  }[];
};

type ReportOverviewResponse = {
  data: ReportOverview;
};

function getTodayInputValue() {
  return format(new Date(), "yyyy-MM-dd");
}

function getDefaultFromInputValue() {
  const date = new Date();
  date.setDate(date.getDate() - 30);

  return format(date, "yyyy-MM-dd");
}

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

function downloadCsv(filename: string, rows: string[][]) {
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell).replace(/"/g, '""');
          return `"${value}"`;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export function ReportDashboard() {
  const [from, setFrom] = useState(getDefaultFromInputValue());
  const [to, setTo] = useState(getTodayInputValue());
  const [groupBy, setGroupBy] = useState<ReportGroupBy>("day");
  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["reports", "overview", from, to, groupBy],
    queryFn: async () => {
      const response = await api.get<ReportOverviewResponse>(
        "/reports/overview",
        {
          params: {
            from,
            to,
            groupBy,
          },
        }
      );

      return response.data.data;
    },
  });

  const filteredRecentBookings = useMemo(() => {
    if (!data) return [];

    const keyword = searchValue.trim().toLowerCase();

    if (!keyword) return data.recentBookings;

    return data.recentBookings.filter((booking) => {
      return (
        booking.id.toLowerCase().includes(keyword) ||
        booking.customerName?.toLowerCase().includes(keyword) ||
        booking.customerEmail.toLowerCase().includes(keyword) ||
        booking.movieTitle.toLowerCase().includes(keyword) ||
        booking.cinemaName.toLowerCase().includes(keyword) ||
        booking.seats.join(", ").toLowerCase().includes(keyword)
      );
    });
  }, [data, searchValue]);

  const filteredRecentPayments = useMemo(() => {
    if (!data) return [];

    const keyword = searchValue.trim().toLowerCase();

    if (!keyword) return data.recentPayments;

    return data.recentPayments.filter((payment) => {
      return (
        payment.id.toLowerCase().includes(keyword) ||
        payment.bookingId.toLowerCase().includes(keyword) ||
        payment.customerName?.toLowerCase().includes(keyword) ||
        payment.customerEmail.toLowerCase().includes(keyword) ||
        payment.movieTitle.toLowerCase().includes(keyword) ||
        payment.method.toLowerCase().includes(keyword) ||
        payment.status.toLowerCase().includes(keyword)
      );
    });
  }, [data, searchValue]);

  function handleExportRevenue() {
    if (!data) return;

    downloadCsv("revenue-report.csv", [
      ["Period", "Revenue", "Payments", "Bookings", "Tickets"],
      ...data.revenueByPeriod.map((item) => [
        item.period,
        String(item.revenue),
        String(item.payments),
        String(item.bookings),
        String(item.tickets),
      ]),
    ]);
  }

  function handleExportTopMovies() {
    if (!data) return;

    downloadCsv("top-movies-report.csv", [
      ["Movie", "Revenue", "Bookings", "Tickets"],
      ...data.topMovies.map((item) => [
        item.title,
        String(item.revenue),
        String(item.bookings),
        String(item.tickets),
      ]),
    ]);
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-100 bg-white p-8 text-center text-sm text-zinc-500">
        Loading reports...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-zinc-100 bg-white p-8 text-center text-sm text-zinc-500">
        No report data found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-100 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-zinc-950">Report filters</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Select a date range and grouping type for report data.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-zinc-400" />
              <Input
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="w-full lg:w-40"
              />
            </div>

            <Input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="w-full lg:w-40"
            />

            <Select
              value={groupBy}
              onValueChange={(value) => setGroupBy(value as ReportGroupBy)}
            >
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="day">By day</SelectItem>
                <SelectItem value="month">By month</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-full lg:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search recent data..."
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Total revenue
            </CardTitle>
            <Banknote size={18} className="text-zinc-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-zinc-950">
              {formatCurrency(data.summary.totalRevenue)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              From successful payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Tickets sold
            </CardTitle>
            <Ticket size={18} className="text-zinc-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-zinc-950">
              {formatNumber(data.summary.ticketsSold)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              From confirmed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Bookings
            </CardTitle>
            <Film size={18} className="text-zinc-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-zinc-950">
              {formatNumber(data.summary.totalBookings)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {data.summary.confirmedBookings} confirmed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Active users
            </CardTitle>
            <Users size={18} className="text-zinc-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-zinc-950">
              {formatNumber(data.summary.totalActiveUsers)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {data.summary.totalUsers} total users
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-zinc-100 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-100 p-4">
            <div>
              <h2 className="font-semibold text-zinc-950">
                Revenue by period
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Revenue, payments, bookings, and tickets grouped by{" "}
                {groupBy}.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportRevenue}
            >
              <Download size={16} className="mr-2" />
              CSV
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Payments</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Tickets</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {!data.revenueByPeriod.length ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-sm text-zinc-500"
                  >
                    No revenue data.
                  </TableCell>
                </TableRow>
              ) : null}

              {data.revenueByPeriod.map((item) => (
                <TableRow key={item.period}>
                  <TableCell>{item.period}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(item.revenue)}
                  </TableCell>
                  <TableCell>{item.payments}</TableCell>
                  <TableCell>{item.bookings}</TableCell>
                  <TableCell>{item.tickets}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-white">
          <div className="border-b border-zinc-100 p-4">
            <h2 className="font-semibold text-zinc-950">Payment methods</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Successful revenue grouped by payment method.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.paymentMethodBreakdown.map((item) => (
                <TableRow key={item.method}>
                  <TableCell>
                    <Badge variant="secondary">{item.method}</Badge>
                  </TableCell>
                  <TableCell>{item.count}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(item.revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-zinc-100 bg-white">
          <div className="border-b border-zinc-100 p-4">
            <h2 className="font-semibold text-zinc-950">
              Booking status breakdown
            </h2>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Count</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.bookingStatusBreakdown.map((item) => (
                <TableRow key={item.status}>
                  <TableCell>
                    <Badge className={getStatusBadgeClassName(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-white">
          <div className="border-b border-zinc-100 p-4">
            <h2 className="font-semibold text-zinc-950">
              Payment status breakdown
            </h2>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Count</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.paymentStatusBreakdown.map((item) => (
                <TableRow key={item.status}>
                  <TableCell>
                    <Badge className={getStatusBadgeClassName(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-100 p-4">
          <div>
            <h2 className="font-semibold text-zinc-950">Top movies</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Movies ranked by successful revenue.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportTopMovies}
          >
            <Download size={16} className="mr-2" />
            CSV
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Movie</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Tickets</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!data.topMovies.length ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-sm text-zinc-500"
                >
                  No movie data.
                </TableCell>
              </TableRow>
            ) : null}

            {data.topMovies.map((movie) => (
              <TableRow key={movie.movieId}>
                <TableCell className="font-medium">{movie.title}</TableCell>
                <TableCell>{formatCurrency(movie.revenue)}</TableCell>
                <TableCell>{movie.bookings}</TableCell>
                <TableCell>{movie.tickets}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-white">
        <div className="border-b border-zinc-100 p-4">
          <h2 className="font-semibold text-zinc-950">Top cinemas</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Cinemas ranked by successful revenue.
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cinema</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Tickets</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!data.topCinemas.length ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-sm text-zinc-500"
                >
                  No cinema data.
                </TableCell>
              </TableRow>
            ) : null}

            {data.topCinemas.map((cinema) => (
              <TableRow key={cinema.cinemaId}>
                <TableCell className="font-medium">{cinema.name}</TableCell>
                <TableCell>{cinema.city}</TableCell>
                <TableCell>{formatCurrency(cinema.revenue)}</TableCell>
                <TableCell>{cinema.bookings}</TableCell>
                <TableCell>{cinema.tickets}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-white">
        <div className="border-b border-zinc-100 p-4">
          <h2 className="font-semibold text-zinc-950">Showtime occupancy</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Top showtimes by seat occupancy rate.
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Movie</TableHead>
              <TableHead>Cinema / Room</TableHead>
              <TableHead>Start time</TableHead>
              <TableHead>Sold seats</TableHead>
              <TableHead>Total seats</TableHead>
              <TableHead>Occupancy</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!data.showtimeOccupancy.length ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-sm text-zinc-500"
                >
                  No occupancy data.
                </TableCell>
              </TableRow>
            ) : null}

            {data.showtimeOccupancy.map((item) => (
              <TableRow key={item.showtimeId}>
                <TableCell className="font-medium">{item.movieTitle}</TableCell>
                <TableCell>
                  {item.cinemaName} / {item.roomName}
                </TableCell>
                <TableCell>
                  {format(new Date(item.startTime), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>{item.soldSeats}</TableCell>
                <TableCell>{item.totalSeats}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.occupancyRate}%</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-zinc-100 bg-white">
          <div className="border-b border-zinc-100 p-4">
            <h2 className="font-semibold text-zinc-950">Recent bookings</h2>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Movie</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {!filteredRecentBookings.length ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-sm text-zinc-500"
                  >
                    No recent bookings.
                  </TableCell>
                </TableRow>
              ) : null}

              {filteredRecentBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        #{booking.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{booking.customerName || "Unnamed user"}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {booking.customerEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{booking.movieTitle}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClassName(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-white">
          <div className="border-b border-zinc-100 p-4">
            <h2 className="font-semibold text-zinc-950">Recent payments</h2>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {!filteredRecentPayments.length ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-sm text-zinc-500"
                  >
                    No recent payments.
                  </TableCell>
                </TableRow>
              ) : null}

              {filteredRecentPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        #{payment.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {payment.method}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{payment.customerName || "Unnamed user"}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {payment.customerEmail}
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
        </div>
      </div>
    </div>
  );
}