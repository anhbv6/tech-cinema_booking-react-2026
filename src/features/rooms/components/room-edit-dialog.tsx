"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "@/lib/axios";
import {
  roomSchema,
  roomTypes,
  type RoomFormValues,
} from "@/features/rooms/schemas/room.schema";
import type { Room } from "@/features/rooms/components/room-table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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

type Cinema = {
  id: string;
  name: string;
  city: string;
  isActive: boolean;
};

type CinemasResponse = {
  data: Cinema[];
};

type RoomEditDialogProps = {
  room: Room | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatRoomType(type: string) {
  return type.replace("_", " ");
}

export function RoomEditDialog({
  room,
  open,
  onOpenChange,
}: RoomEditDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: "",
      type: "STANDARD",
      cinemaId: "",
      isActive: true,
    },
  });

  const selectedCinemaId = watch("cinemaId");
  const selectedType = watch("type");
  const isActive = watch("isActive");

  const { data: cinemas = [], isLoading: isLoadingCinemas } = useQuery({
    queryKey: ["cinemas"],
    queryFn: async () => {
      const response = await api.get<CinemasResponse>("/cinemas");

      return response.data.data;
    },
  });

  useEffect(() => {
    if (!room) return;

    reset({
      name: room.name,
      type: room.type,
      cinemaId: room.cinemaId,
      isActive: room.isActive,
    });
  }, [room, reset]);

  const updateRoomMutation = useMutation({
    mutationFn: async (values: RoomFormValues) => {
      if (!room) return null;

      const response = await api.patch(`/rooms/${room.id}`, values);

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Room updated successfully");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to update room";
      toast.error(message);
    },
  });

  function onSubmit(values: RoomFormValues) {
    updateRoomMutation.mutate(values);
  }

  const selectableCinemas = cinemas.filter((cinema) => {
    return cinema.isActive || cinema.id === room?.cinemaId;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit room</DialogTitle>
          <DialogDescription>
            Update screening room information and availability.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label>Cinema</Label>
            <Select
              value={selectedCinemaId}
              onValueChange={(value) => {
                setValue("cinemaId", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              disabled={isLoadingCinemas}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cinema" />
              </SelectTrigger>

              <SelectContent>
                {selectableCinemas.map((cinema) => (
                  <SelectItem key={cinema.id} value={cinema.id}>
                    {cinema.name} — {cinema.city}
                    {!cinema.isActive ? " (Inactive)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.cinemaId ? (
              <p className="text-sm text-red-500">{errors.cinemaId.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-room-name">Room name</Label>
              <Input
                id="edit-room-name"
                placeholder="Room 1"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Room type</Label>
              <Select
                value={selectedType}
                onValueChange={(value) => {
                  setValue("type", value as RoomFormValues["type"], {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>

                <SelectContent>
                  {roomTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatRoomType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.type ? (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-zinc-100 p-4">
            <Checkbox
              id="edit-room-is-active"
              checked={isActive}
              onCheckedChange={(checked) => {
                setValue("isActive", checked === true, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />

            <div className="space-y-1">
              <Label htmlFor="edit-room-is-active">Active room</Label>
              <p className="text-sm text-zinc-500">
                Inactive rooms will not be available for new seats or showtimes.
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
              disabled={updateRoomMutation.isPending}
              className="cursor-pointer bg-[#1DE782] text-zinc-950 hover:bg-[#19D675]"
            >
              {updateRoomMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}