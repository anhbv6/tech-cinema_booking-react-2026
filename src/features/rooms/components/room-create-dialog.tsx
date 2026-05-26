"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "@/lib/axios";
import {
  roomSchema,
  roomTypes,
  type RoomFormValues,
} from "@/features/rooms/schemas/room.schema";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

type Cinema = {
  id: string;
  name: string;
  city: string;
  isActive: boolean;
};

type CinemasResponse = {
  data: Cinema[];
};

function formatRoomType(type: string) {
  return type.replace("_", " ");
}

export function RoomCreateDialog() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

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

  const activeCinemas = cinemas.filter((cinema) => cinema.isActive);

  const createRoomMutation = useMutation({
    mutationFn: async (values: RoomFormValues) => {
      const response = await api.post("/rooms", values);

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Room created successfully");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      reset();
      setOpen(false);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to create room";
      toast.error(message);
    },
  });

  function onSubmit(values: RoomFormValues) {
    createRoomMutation.mutate(values);
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
          <Plus size={16} className="mr-2" />
          Add room
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create room</DialogTitle>
          <DialogDescription>
            Add a screening room to a cinema location.
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
                {activeCinemas.map((cinema) => (
                  <SelectItem key={cinema.id} value={cinema.id}>
                    {cinema.name} — {cinema.city}
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
              <Label htmlFor="name">Room name</Label>
              <Input id="name" placeholder="Room 1" {...register("name")} />
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
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => {
                setValue("isActive", checked === true, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />

            <div className="space-y-1">
              <Label htmlFor="isActive">Active room</Label>
              <p className="text-sm text-zinc-500">
                Active rooms can be used later when creating seats and
                showtimes.
              </p>
            </div>
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
              disabled={createRoomMutation.isPending}
              className="cursor-pointer bg-[#1DE782] text-zinc-950 hover:bg-[#19D675]"
            >
              {createRoomMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}