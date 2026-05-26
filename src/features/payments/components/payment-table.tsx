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

import { PaymentDetailDialog } from "./payment-detail-dialog";
import { PaymentStatusDialog } from "./payment-status-dialog";

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

type PaymentsResponse = {
  data: Payment[];
};

type StatusFilter = PaymentStatus | "ALL";
type MethodFilter = PaymentMethod | "ALL";

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

function getMethodBadgeClassName(method: PaymentMethod) {
  switch (method) {
    case "CASH":
      return "bg-zinc-100 text-zinc-700 hover:bg-zinc-100";
    case "MOMO":
      return "bg-pink-100 text-pink-700 hover:bg-pink-100";
    case "VNPAY":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    case "BANK_TRANSFER":
      return "bg-cyan-100 text-cyan-700 hover:bg-cyan-100";
    case "CREDIT_CARD":
      return "bg-indigo-100 text-indigo-700 hover:bg-indigo-100";
    default:
      return "";
  }
}

export function PaymentTable() {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("ALL");

  const [detailPayment, setDetailPayment] = useState<Payment | null>(null);
  const [statusPayment, setStatusPayment] = useState<Payment | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const response = await api.get<PaymentsResponse>("/payments");

      return response.data.data;
    },
  });

  const filteredPayments = useMemo(() => {
    if (!data) return [];

    const keyword = searchValue.trim().toLowerCase();

    return data.filter((payment) => {
      const matchesSearch =
        !keyword ||
        payment.id.toLowerCase().includes(keyword) ||
        payment.booking.id.toLowerCase().includes(keyword) ||
        payment.booking.user.name?.toLowerCase().includes(keyword) ||
        payment.booking.user.email.toLowerCase().includes(keyword) ||
        payment.booking.showtime.movie.title.toLowerCase().includes(keyword) ||
        payment.transactionId?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" || payment.status === statusFilter;

      const matchesMethod =
        methodFilter === "ALL" || payment.method === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [data, searchValue, statusFilter, methodFilter]);

  return (
    <>
      <div className="rounded-2xl border border-zinc-100 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 p-4">
          <div>
            <h2 className="font-semibold text-zinc-950">Payment list</h2>
            <p className="mt-1 text-sm text-zinc-500">
              View payment transactions, methods, and payment status.
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
                placeholder="Search payments..."
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
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={methodFilter}
              onValueChange={(value) =>
                setMethodFilter(value as MethodFilter)
              }
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Method" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All methods</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="MOMO">MoMo</SelectItem>
                <SelectItem value="VNPAY">VNPay</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank transfer</SelectItem>
                <SelectItem value="CREDIT_CARD">Credit card</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Movie</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid at</TableHead>
                <TableHead className="w-[80px] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-28 text-center text-sm text-zinc-500"
                  >
                    Loading payments...
                  </TableCell>
                </TableRow>
              ) : null}

              {!isLoading && !filteredPayments.length ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-28 text-center text-sm text-zinc-500"
                  >
                    No payments found.
                  </TableCell>
                </TableRow>
              ) : null}

              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-zinc-950">
                        #{payment.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="font-medium text-zinc-950">
                      #{payment.booking.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {payment.booking.status}
                    </p>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-zinc-950">
                        {payment.booking.user.name || "Unnamed user"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {payment.booking.user.email}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-zinc-950">
                        {payment.booking.showtime.movie.title}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {payment.booking.showtime.room.cinema.name}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="font-medium text-zinc-950">
                      {formatCurrency(payment.amount)}
                    </p>
                  </TableCell>

                  <TableCell>
                    <Badge className={getMethodBadgeClassName(payment.method)}>
                      {payment.method}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge className={getStatusBadgeClassName(payment.status)}>
                      {payment.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <p className="text-sm text-zinc-600">
                      {payment.paidAt
                        ? format(new Date(payment.paidAt), "dd/MM/yyyy HH:mm")
                        : "-"}
                    </p>
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
                          onClick={() => setDetailPayment(payment)}
                        >
                          View details
                        </DropdownMenuItem>

                        {payment.status !== "REFUNDED" ? (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => setStatusPayment(payment)}
                          >
                            Update status
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

      <PaymentDetailDialog
        payment={detailPayment}
        open={!!detailPayment}
        onOpenChange={(open) => {
          if (!open) setDetailPayment(null);
        }}
      />

      <PaymentStatusDialog
        payment={statusPayment}
        open={!!statusPayment}
        onOpenChange={(open) => {
          if (!open) setStatusPayment(null);
        }}
      />
    </>
  );
}