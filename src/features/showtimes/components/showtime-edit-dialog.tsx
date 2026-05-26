"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  updateShowtimeSchema,
  type UpdateShowtimeFormValues,
} from "@/features/showtimes/schemas/showtime.schema";
import type { Showtime } from "@/features/showtimes/components/showtime-table";
import { api } from "@/lib/axios";

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

type Movie = {
  id: string;
  title: string;
  duration: number | null;
  status: string;
  isActive: boolean;
};

type Cinema = {
  id: string;
  name: string;
  city: string;
  isActive: boolean;
};

type Room = {
  id: string;
  name: string;
  type: string;
  cinemaId: string;
  isActive: boolean;
};

type MoviesResponse = {
  data: Movie[];
};

type CinemasResponse = {
  data: Cinema[];
};

type RoomsResponse = {
  data: Room[];
};

type ShowtimeEditDialogProps = {
  showtime: Showtime | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatRoomType(type: string) {
  return type.replace("_", " ");
}

function toDateTimeLocalValue(value: string) {
  return format(new Date(value), "yyyy-MM-dd'T'HH:mm");
}

function addMinutesToDateTimeLocal(value: string, minutes: number) {
  if (!value || !minutes) return "";

  const date = new Date(value);
  date.setMinutes(date.getMinutes() + minutes);

  return date.toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function ShowtimeEditDialog({
  showtime,
  open,
  onOpenChange,
}: ShowtimeEditDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
    } = useForm<UpdateShowtimeFormValues>({
    resolver: zodResolver(updateShowtimeSchema),
        defaultValues: {
        movieId: "",
        cinemaId: "",
        roomId: "",
        startTime: "",
        price: 90000,
        status: "SCHEDULED",
        isActive: true,
        },
  });

  const selectedMovieId = watch("movieId");
  const selectedCinemaId = watch("cinemaId");
  const selectedRoomId = watch("roomId");
  const selectedStartTime = watch("startTime");
  const selectedStatus = watch("status");
  const isActive = watch("isActive");

  const { data: movies = [] } = useQuery({
    queryKey: ["movies"],
    queryFn: async () => {
      const response = await api.get<MoviesResponse>("/movies");

      return response.data.data;
    },
  });

  const { data: cinemas = [] } = useQuery({
    queryKey: ["cinemas"],
    queryFn: async () => {
      const response = await api.get<CinemasResponse>("/cinemas");

      return response.data.data;
    },
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const response = await api.get<RoomsResponse>("/rooms");

      return response.data.data;
    },
  });

  useEffect(() => {
    if (!showtime) return;

    reset({
      movieId: showtime.movieId,
      cinemaId: showtime.room.cinema.id,
      roomId: showtime.roomId,
      startTime: toDateTimeLocalValue(showtime.startTime),
      price: showtime.price,
      status: showtime.status === "CANCELLED" ? "CANCELLED" : "SCHEDULED",
      isActive: showtime.isActive,
    });
  }, [showtime, reset]);

  const selectableMovies = movies.filter((movie) => {
    return movie.duration && (movie.isActive || movie.id === showtime?.movieId);
  });

  const selectableCinemas = cinemas.filter((cinema) => {
    return cinema.isActive || cinema.id === showtime?.room.cinema.id;
  });

  const selectableRooms = rooms.filter((room) => {
    return (
      room.cinemaId === selectedCinemaId &&
      (room.isActive || room.id === showtime?.roomId)
    );
  });

  const selectedMovie = useMemo(() => {
    return movies.find((movie) => movie.id === selectedMovieId);
  }, [movies, selectedMovieId]);

  const estimatedEndTime = addMinutesToDateTimeLocal(
    selectedStartTime,
    selectedMovie?.duration || 0
  );

  const updateShowtimeMutation = useMutation({
    mutationFn: async (values: UpdateShowtimeFormValues) => {
        if (!showtime) return null;

        const response = await api.patch(`/showtimes/${showtime.id}`, values);

        return response.data;
    },
    onSuccess: (data) => {
        toast.success(data?.message || "Showtime updated successfully");
        queryClient.invalidateQueries({ queryKey: ["showtimes"] });
        onOpenChange(false);
    },
    onError: (error: any) => {
        const message =
        error?.response?.data?.message || "Failed to update showtime";
        toast.error(message);
    },
    });

    function onSubmit(values: UpdateShowtimeFormValues) {
    updateShowtimeMutation.mutate(values);
    }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit showtime</DialogTitle>
          <DialogDescription>
            Update schedule, room, ticket price, or showtime status.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label>Movie</Label>
            <Select
              value={selectedMovieId}
              onValueChange={(value) => {
                setValue("movieId", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select movie" />
              </SelectTrigger>

              <SelectContent>
                {selectableMovies.map((movie) => (
                  <SelectItem key={movie.id} value={movie.id}>
                    {movie.title} · {movie.duration} min
                    {!movie.isActive ? " (Inactive)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.movieId ? (
              <p className="text-sm text-red-500">{errors.movieId.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cinema</Label>
              <Select
                value={selectedCinemaId}
                onValueChange={(value) => {
                  setValue("cinemaId", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue("roomId", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
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
                <p className="text-sm text-red-500">
                  {errors.cinemaId.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Room</Label>
              <Select
                value={selectedRoomId}
                onValueChange={(value) => {
                  setValue("roomId", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                disabled={!selectedCinemaId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>

                <SelectContent>
                  {selectableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} · {formatRoomType(room.type)}
                      {!room.isActive ? " (Inactive)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roomId ? (
                <p className="text-sm text-red-500">{errors.roomId.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-startTime">Start time</Label>
              <Input
                id="edit-startTime"
                type="datetime-local"
                {...register("startTime")}
              />
              {errors.startTime ? (
                <p className="text-sm text-red-500">
                  {errors.startTime.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Estimated end time</Label>
              <div className="flex h-10 items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-600">
                {estimatedEndTime || "Select movie and start time"}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Base price</Label>
              <Input
                id="edit-price"
                type="number"
                min={1000}
                step={1000}
                {...register("price")}
              />
              {errors.price ? (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setValue("status", value as UpdateShowtimeFormValues["status"], {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-zinc-100 p-4">
            <Checkbox
              id="edit-isActive"
              checked={isActive}
              onCheckedChange={(checked) => {
                setValue("isActive", checked === true, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />

            <div className="space-y-1">
              <Label htmlFor="edit-isActive">Active showtime</Label>
              <p className="text-sm text-zinc-500">
                Inactive showtimes will not be available for booking.
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
              disabled={updateShowtimeMutation.isPending}
              className="cursor-pointer bg-[#1DE782] text-zinc-950 hover:bg-[#19D675]"
            >
              {updateShowtimeMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}