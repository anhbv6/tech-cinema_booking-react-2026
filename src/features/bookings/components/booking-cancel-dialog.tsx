"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";

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
};

type BookingCancelDialogProps = {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BookingCancelDialog({
  booking,
  open,
  onOpenChange,
}: BookingCancelDialogProps) {
  const queryClient = useQueryClient();

  const cancelBookingMutation = useMutation({
    mutationFn: async () => {
      if (!booking) return;

      const response = await api.patch(`/bookings/${booking.id}/cancel`);

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Booking cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to cancel booking";
      toast.error(message);
    },
  });

  if (!booking) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel booking?</AlertDialogTitle>
          <AlertDialogDescription>
            This booking will be marked as cancelled. This action should only be
            used when the customer booking is no longer valid.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
          <p className="font-medium text-zinc-950">
            #{booking.id.slice(-8).toUpperCase()}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {booking.user.name || "Unnamed user"} - {booking.user.email}
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelBookingMutation.isPending}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              type="button"
              variant="destructive"
              onClick={() => cancelBookingMutation.mutate()}
              disabled={cancelBookingMutation.isPending}
            >
              {cancelBookingMutation.isPending
                ? "Cancelling..."
                : "Cancel booking"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}