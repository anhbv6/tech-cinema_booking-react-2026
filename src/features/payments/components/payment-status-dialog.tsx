"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "CANCELLED";

type PaymentMethod =
  | "CASH"
  | "MOMO"
  | "VNPAY"
  | "BANK_TRANSFER"
  | "CREDIT_CARD";

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
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  };
};

type PaymentStatusDialogProps = {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const paymentStatuses: PaymentStatus[] = [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
  "CANCELLED",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export function PaymentStatusDialog({
  payment,
  open,
  onOpenChange,
}: PaymentStatusDialogProps) {
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<PaymentStatus>("PENDING");

  useEffect(() => {
    if (payment) {
      setStatus(payment.status);
    }
  }, [payment]);

  const availableStatuses = useMemo(() => {
    if (!payment) return paymentStatuses;

    if (payment.status === "PENDING") {
      return ["SUCCESS", "FAILED", "CANCELLED"] as PaymentStatus[];
    }

    if (payment.status === "SUCCESS") {
      return ["REFUNDED"] as PaymentStatus[];
    }

    return paymentStatuses;
  }, [payment]);

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      if (!payment) return;

      const response = await api.patch(`/payments/${payment.id}/status`, {
        status,
      });

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Payment status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to update payment status";
      toast.error(message);
    },
  });

  function handleSubmit() {
    if (!payment) return;

    if (payment.status === status) {
      onOpenChange(false);
      return;
    }

    updateStatusMutation.mutate();
  }

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update payment status</DialogTitle>
          <DialogDescription>
            Change the payment status for this transaction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
            <p className="font-medium text-zinc-950">
              #{payment.id.slice(-8).toUpperCase()}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {payment.booking.user.name || "Unnamed user"} -{" "}
              {payment.booking.user.email}
            </p>
            <p className="mt-2 text-sm font-medium text-zinc-950">
              {formatCurrency(payment.amount)}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Status</label>

            <Select
              value={status}
              onValueChange={(value) => setStatus(value as PaymentStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent>
                {availableStatuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {status === "SUCCESS" ? (
              <p className="text-xs text-zinc-500">
                When payment becomes successful, the related booking will be
                confirmed automatically.
              </p>
            ) : null}

            {status === "REFUNDED" ? (
              <p className="text-xs text-zinc-500">
                When payment is refunded, the related booking will be cancelled.
              </p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}