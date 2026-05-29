"use client";
/* eslint-disable react-hooks/incompatible-library */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "@/lib/axios";
import {
  generateSeatsSchema,
  seatTypes,
  type GenerateSeatsFormValues,
} from "@/features/admin/seats/schemas/seat.schema";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type GenerateSeatsDialogProps = {
  roomId: string;
  hasSeats: boolean;
};

function formatSeatType(type: string) {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export function GenerateSeatsDialog({
  roomId,
  hasSeats,
}: GenerateSeatsDialogProps) {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GenerateSeatsFormValues>({
    resolver: zodResolver(generateSeatsSchema),
    defaultValues: {
      rows: 8,
      seatsPerRow: 10,
      defaultType: "NORMAL",
    },
  });

  const defaultType = watch("defaultType");

  const generateSeatsMutation = useMutation({
    mutationFn: async (values: GenerateSeatsFormValues) => {
      const response = await api.post(`/rooms/${roomId}/seats`, values);

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Seats generated successfully");
      queryClient.invalidateQueries({ queryKey: ["room-seats", roomId] });
      reset();
      setOpen(false);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to generate seats";
      toast.error(message);
    },
  });

  function onSubmit(values: GenerateSeatsFormValues) {
    if (hasSeats) {
      const confirmed = window.confirm(
        "This room already has seats. Generating again will replace the current layout. Continue?"
      );

      if (!confirmed) return;
    }

    generateSeatsMutation.mutate(values);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-[#1DE782] text-zinc-950 hover:bg-[#19D675]">
          <RefreshCcw size={16} className="mr-2" />
          {hasSeats ? "Regenerate seats" : "Generate seats"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate seats</DialogTitle>
          <DialogDescription>
            Create a seat layout for this room using rows and seats per row.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {hasSeats ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              This room already has seats. Generating again will replace the
              current layout.
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rows">Rows</Label>
              <Input
                id="rows"
                type="number"
                min={1}
                max={26}
                {...register("rows")}
              />
              {errors.rows ? (
                <p className="text-sm text-red-500">{errors.rows.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="seatsPerRow">Seats per row</Label>
              <Input
                id="seatsPerRow"
                type="number"
                min={1}
                max={30}
                {...register("seatsPerRow")}
              />
              {errors.seatsPerRow ? (
                <p className="text-sm text-red-500">
                  {errors.seatsPerRow.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Default seat type</Label>
            <Select
              value={defaultType}
              onValueChange={(value) => {
                setValue(
                  "defaultType",
                  value as GenerateSeatsFormValues["defaultType"],
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  }
                );
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default type" />
              </SelectTrigger>

              <SelectContent>
                {seatTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {formatSeatType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.defaultType ? (
              <p className="text-sm text-red-500">
                {errors.defaultType.message}
              </p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={generateSeatsMutation.isPending}
              className="cursor-pointer bg-[#1DE782] text-zinc-950 hover:bg-[#19D675]"
            >
              {generateSeatsMutation.isPending ? "Generating..." : "Generate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
