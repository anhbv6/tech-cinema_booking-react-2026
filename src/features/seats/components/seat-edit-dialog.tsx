"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "@/lib/axios";
import {
  seatTypes,
  updateSeatSchema,
  type SeatType,
  type UpdateSeatFormValues,
} from "@/features/seats/schemas/seat.schema";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Seat = {
  id: string;
  roomId: string;
  row: string;
  number: number;
  type: SeatType;
  isActive: boolean;
};

type SeatEditDialogProps = {
  seat: Seat | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
};

function formatSeatType(type: string) {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export function SeatEditDialog({
  seat,
  open,
  onOpenChange,
  onUpdated,
}: SeatEditDialogProps) {
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateSeatFormValues>({
    resolver: zodResolver(updateSeatSchema),
    defaultValues: {
      type: "NORMAL",
      isActive: true,
    },
  });

  const selectedType = watch("type");
  const isActive = watch("isActive");

  useEffect(() => {
    if (!seat) return;

    reset({
      type: seat.type,
      isActive: seat.isActive,
    });
  }, [seat, reset]);

  const updateSeatMutation = useMutation({
    mutationFn: async (values: UpdateSeatFormValues) => {
      if (!seat) return null;

      const response = await api.patch(`/seats/${seat.id}`, values);

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Seat updated successfully");
      onUpdated();
      onOpenChange(false);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to update seat";
      toast.error(message);
    },
  });

  function onSubmit(values: UpdateSeatFormValues) {
    updateSeatMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Edit seat {seat?.row}
            {seat?.number}
          </DialogTitle>
          <DialogDescription>
            Update seat type or disable this seat if it is unavailable.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label>Seat type</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => {
                setValue("type", value as UpdateSeatFormValues["type"], {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select seat type" />
              </SelectTrigger>

              <SelectContent>
                {seatTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {formatSeatType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.type ? (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            ) : null}
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-zinc-100 p-4">
            <Checkbox
              id="seat-is-active"
              checked={isActive}
              onCheckedChange={(checked) => {
                setValue("isActive", checked === true, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />

            <div className="space-y-1">
              <Label htmlFor="seat-is-active">Active seat</Label>
              <p className="text-sm text-zinc-500">
                Inactive seats will not be available for booking.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={updateSeatMutation.isPending}
              className="cursor-pointer bg-[#1DE782] text-zinc-950 hover:bg-[#19D675]"
            >
              {updateSeatMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}