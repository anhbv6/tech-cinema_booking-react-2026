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

type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "CANCELLED";

type PaymentMethod =
  | "CASH"
  | "MOMO"
  | "VNPAY"
  | "BANK_TRANSFER"
  | "CREDIT_CARD";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";

type Payment = {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string | null;
  provider: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  booking: {
    id: string;
    status: BookingStatus;
    totalAmount: number;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
    showtime: {
      id: string;
      startTime: string;
      endTime: string;
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
  };
};

type PaymentDetailDialogProps = {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function getStatusBadgeClassName(status: PaymentStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-700 hover:bg-amber-100";
    case "SUCCESS":
      return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
    case "FAILED":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    case "REFUNDED":
      return "bg-purple-100 text-purple-700 hover:bg-purple-100";
    case "CANCELLED":
      return "bg-zinc-100 text-zinc-700 hover:bg-zinc-100";
    default:
      return "";
  }
}

export function PaymentDetailDialog({
  payment,
  open,
  onOpenChange,
}: PaymentDetailDialogProps) {
  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Payment #{payment.id.slice(-8).toUpperCase()}
          </DialogTitle>
          <DialogDescription>
            View payment transaction, customer, booking, and showtime details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
            <div>
              <p className="text-sm text-zinc-500">Status</p>
              <Badge
                className={`mt-2 ${getStatusBadgeClassName(payment.status)}`}
              >
                {payment.status}
              </Badge>
            </div>

            <div className="text-right">
              <p className="text-sm text-zinc-500">Amount</p>
              <p className="mt-1 text-lg font-semibold text-zinc-950">
                {formatCurrency(payment.amount)}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-100 p-4">
              <h3 className="font-medium text-zinc-950">Customer</h3>
              <div className="mt-3 space-y-1">
                <p className="text-sm text-zinc-700">
                  {payment.booking.user.name || "Unnamed user"}
                </p>
                <p className="text-sm text-zinc-500">
                  {payment.booking.user.email}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-100 p-4">
              <h3 className="font-medium text-zinc-950">Booking</h3>
              <div className="mt-3 space-y-1">
                <p className="text-sm text-zinc-700">
                  #{payment.booking.id.slice(-8).toUpperCase()}
                </p>
                <p className="text-sm text-zinc-500">
                  Status: {payment.booking.status}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-100 p-4">
            <h3 className="font-medium text-zinc-950">Payment info</h3>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-zinc-500">Method</p>
                <p className="mt-1 text-sm text-zinc-700">{payment.method}</p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">Provider</p>
                <p className="mt-1 text-sm text-zinc-700">
                  {payment.provider || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">Transaction ID</p>
                <p className="mt-1 break-all text-sm text-zinc-700">
                  {payment.transactionId || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500">Paid at</p>
                <p className="mt-1 text-sm text-zinc-700">
                  {payment.paidAt
                    ? format(new Date(payment.paidAt), "dd/MM/yyyy HH:mm")
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-100 p-4">
            <h3 className="font-medium text-zinc-950">Movie & showtime</h3>

            <div className="mt-3 space-y-1">
              <p className="text-sm text-zinc-700">
                {payment.booking.showtime.movie.title}
              </p>
              <p className="text-sm text-zinc-500">
                {payment.booking.showtime.room.cinema.name} -{" "}
                {payment.booking.showtime.room.name}
              </p>
              <p className="text-sm text-zinc-500">
                {format(
                  new Date(payment.booking.showtime.startTime),
                  "dd/MM/yyyy HH:mm"
                )}{" "}
                - {format(new Date(payment.booking.showtime.endTime), "HH:mm")}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-100 p-4">
            <h3 className="font-medium text-zinc-950">Created at</h3>
            <p className="mt-2 text-sm text-zinc-600">
              {format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm")}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}