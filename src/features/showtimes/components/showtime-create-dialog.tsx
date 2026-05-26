"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "@/lib/axios";
import {
  createShowtimeSchema,
  type CreateShowtimeFormValues,
} from "@/features/showtimes/schemas/showtime.schema";

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

function formatRoomType(type: string) {
  return type.replace("_", " ");
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

export function ShowtimeCreateDialog() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateShowtimeFormValues>({
    resolver: zodResolver(createShowtimeSchema),
    defaultValues: {
      movieId: "",
      cinemaId: "",
      roomId: "",
      startTime: "",
      price: 90000,
      isActive: true,
    },
  });

  const selectedMovieId = watch("movieId");
  const selectedCinemaId = watch("cinemaId");
  const selectedRoomId = watch("roomId");
  const selectedStartTime = watch("startTime");
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

  const availableMovies = movies.filter((movie) => {
    return movie.isActive && movie.duration;
  });

  const availableCinemas = cinemas.filter((cinema) => cinema.isActive);

  const availableRooms = rooms.filter((room) => {
    return room.isActive && room.cinemaId === selectedCinemaId;
  });

  const selectedMovie = useMemo(() => {
    return movies.find((movie) => movie.id === selectedMovieId);
  }, [movies, selectedMovieId]);

  const estimatedEndTime = addMinutesToDateTimeLocal(
    selectedStartTime,
    selectedMovie?.duration || 0
  );

  const createShowtimeMutation = useMutation({
    mutationFn: async (values: CreateShowtimeFormValues) => {
      const response = await api.post("/showtimes", values);

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Showtime created successfully");
      queryClient.invalidateQueries({ queryKey: ["showtimes"] });
      reset();
      setOpen(false);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to create showtime";
      toast.error(message);
    },
  });

  function onSubmit(values: CreateShowtimeFormValues) {
    createShowtimeMutation.mutate(values);
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
          <CalendarPlus size={16} className="mr-2" />
          Add showtime
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create showtime</DialogTitle>
          <DialogDescription>
            Schedule a movie to a cinema room. End time will be calculated from
            movie duration.
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
                {availableMovies.map((movie) => (
                  <SelectItem key={movie.id} value={movie.id}>
                    {movie.title} · {movie.duration} min
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
                  {availableCinemas.map((cinema) => (
                    <SelectItem key={cinema.id} value={cinema.id}>
                      {cinema.name} — {cinema.city}
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
                  {availableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} · {formatRoomType(room.type)}
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
              <Label htmlFor="startTime">Start time</Label>
              <Input
                id="startTime"
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

          <div className="space-y-2">
            <Label htmlFor="price">Base price</Label>
            <Input
              id="price"
              type="number"
              min={1000}
              step={1000}
              {...register("price")}
            />
            {errors.price ? (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            ) : null}
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
              <Label htmlFor="isActive">Active showtime</Label>
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
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={createShowtimeMutation.isPending}
              className="cursor-pointer bg-[#1DE782] text-zinc-950 hover:bg-[#19D675]"
            >
              {createShowtimeMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}