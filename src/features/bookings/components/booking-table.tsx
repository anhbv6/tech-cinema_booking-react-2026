"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { MoreHorizontal, Search } from "lucide-react";

import { api } from "@/lib/axios";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import { BookingDetailDialog } from "./booking-detail-dialog";
import { BookingCancelDialog } from "./booking-cancel-dialog";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";

type BookingSeat = {
  id: string;
  price: number;
  seat: {
    id: string;
    row: string;
    number: number;
    type: "NORMAL" | "VIP" | "COUPLE";
  };
};

type Booking = {
  id: string;
  status: BookingStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  showtime: {
    id: string;
    startTime: string;
    endTime: string;
    price: number;
    movie: {
      id: string;
      title: string;
      posterUrl: string | null;
    };
    room: {
      id: string;
      name: string;
      cinema: {
        id: string;
        name: string;
        city: string;
      };
    };
  };
  seats: BookingSeat[];
};

type BookingsResponse = {
  data: Booking[];
};

type StatusFilter = BookingStatus | "ALL";

function getStatusBadgeClassName(status: BookingStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-700 hover:bg-amber-100";
    case "CONFIRMED":
      return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
    case "CANCELLED":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    case "EXPIRED":
      return "bg-zinc-100 text-zinc-700 hover:bg-zinc-100";
    default:
      return "";
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function formatSeats(seats: BookingSeat[]) {
  if (!seats.length) return "-";

  return seats
    .map((item) => `${item.seat.row}${item.seat.number}`)
    .join(", ");
}

export function BookingTable() {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const response = await api.get<BookingsResponse>("/bookings");

      return response.data.data;
    },
  });

  const filteredBookings = useMemo(() => {
    if (!data) return [];

    const keyword = searchValue.trim().toLowerCase();

    return data.filter((booking) => {
      const seatsText = formatSeats(booking.seats).toLowerCase();

      const matchesSearch =
        !keyword ||
        booking.id.toLowerCase().includes(keyword) ||
        booking.user.name?.toLowerCase().includes(keyword) ||
        booking.user.email.toLowerCase().includes(keyword) ||
        booking.showtime.movie.title.toLowerCase().includes(keyword) ||
        booking.showtime.room.cinema.name.toLowerCase().includes(keyword) ||
        seatsText.includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data, searchValue, statusFilter]);

  return (
    <>
      <div className="rounded-2xl border border-zinc-100 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 p-4">
          <div>
            <h2 className="font-semibold text-zinc-950">Booking list</h2>
            <p className="mt-1 text-sm text-zinc-500">
              View booking history, seats, customers, and booking status.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search bookings..."
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as StatusFilter)
              }
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Movie</TableHead>
                <TableHead>Showtime</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-28 text-center text-sm text-zinc-500"
                  >
                    Loading bookings...
                  </TableCell>
                </TableRow>
              ) : null}

              {!isLoading && !filteredBookings.length ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-28 text-center text-sm text-zinc-500"
                  >
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : null}

              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-zinc-950">
                        #{booking.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-zinc-950">
                        {booking.user.name || "Unnamed user"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {booking.user.email}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-zinc-950">
                        {booking.showtime.movie.title}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {booking.showtime.room.cinema.name}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="text-sm text-zinc-700">
                        {format(new Date(booking.showtime.startTime), "dd/MM/yyyy")}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {format(new Date(booking.showtime.startTime), "HH:mm")} -{" "}
                        {format(new Date(booking.showtime.endTime), "HH:mm")}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="max-w-[160px] truncate text-sm text-zinc-700">
                      {formatSeats(booking.seats)}
                    </p>
                  </TableCell>

                  <TableCell>
                    <p className="font-medium text-zinc-950">
                      {formatCurrency(booking.totalAmount)}
                    </p>
                  </TableCell>

                  <TableCell>
                    <Badge className={getStatusBadgeClassName(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                        >
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => setDetailBooking(booking)}
                        >
                          View details
                        </DropdownMenuItem>

                        {booking.status !== "CANCELLED" ? (
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-600"
                            onClick={() => setCancelBooking(booking)}
                          >
                            Cancel booking
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <BookingDetailDialog
        booking={detailBooking}
        open={!!detailBooking}
        onOpenChange={(open) => {
          if (!open) setDetailBooking(null);
        }}
      />

      <BookingCancelDialog
        booking={cancelBooking}
        open={!!cancelBooking}
        onOpenChange={(open) => {
          if (!open) setCancelBooking(null);
        }}
      />
    </>
  );
}