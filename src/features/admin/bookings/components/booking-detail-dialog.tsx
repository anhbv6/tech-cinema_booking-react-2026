"use client";

import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

type BookingDetailDialogProps = {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

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

export function BookingDetailDialog({
  booking,
  open,
  onOpenChange,
}: BookingDetailDialogProps) {
  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Booking #{booking.id.slice(-8).toUpperCase()}
          </DialogTitle>
          <DialogDescription>
            View booking details, customer information, showtime, and selected
            seats.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
            <div>
              <p className="text-sm text-zinc-500">Status</p>
              <Badge
                className={`mt-2 ${getStatusBadgeClassName(booking.status)}`}
              >
                {booking.status}
              </Badge>
            </div>

            <div className="text-right">
              <p className="text-sm text-zinc-500">Total amount</p>
              <p className="mt-1 text-lg font-semibold text-zinc-950">
                {formatCurrency(booking.totalAmount)}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-100 p-4">
              <h3 className="font-medium text-zinc-950">Customer</h3>
              <div className="mt-3 space-y-1">
                <p className="text-sm text-zinc-700">
                  {booking.user.name || "Unnamed user"}
                </p>
                <p className="text-sm text-zinc-500">{booking.user.email}</p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-100 p-4">
              <h3 className="font-medium text-zinc-950">Movie</h3>
              <div className="mt-3 space-y-1">
                <p className="text-sm text-zinc-700">
                  {booking.showtime.movie.title}
                </p>
                <p className="text-sm text-zinc-500">
                  {booking.showtime.room.cinema.name} -{" "}
                  {booking.showtime.room.name}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-100 p-4">
            <h3 className="font-medium text-zinc-950">Showtime</h3>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-zinc-500">Date</p>
                <p className="mt-1 text-sm text-zinc-700">
                  {format(new Date(booking.showtime.startTime), "dd/MM/yyyy")}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">Start</p>
                <p className="mt-1 text-sm text-zinc-700">
                  {format(new Date(booking.showtime.startTime), "HH:mm")}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">End</p>
                <p className="mt-1 text-sm text-zinc-700">
                  {format(new Date(booking.showtime.endTime), "HH:mm")}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-100 p-4">
            <h3 className="font-medium text-zinc-950">Seats</h3>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {booking.seats.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-950">
                      {item.seat.row}
                      {item.seat.number}
                    </p>
                    <p className="text-xs text-zinc-500">{item.seat.type}</p>
                  </div>

                  <p className="text-sm text-zinc-700">
                    {formatCurrency(item.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-100 p-4">
            <h3 className="font-medium text-zinc-950">Created at</h3>
            <p className="mt-2 text-sm text-zinc-600">
              {format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm")}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}