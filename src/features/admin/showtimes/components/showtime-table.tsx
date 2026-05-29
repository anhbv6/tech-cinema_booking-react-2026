"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { MoreHorizontal, Search } from "lucide-react";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";
import type { ShowtimeStatus } from "@/features/admin/showtimes/schemas/showtime.schema";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShowtimeEditDialog } from "./showtime-edit-dialog";

export type Showtime = {
  id: string;
  movieId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  price: number;
  status: ShowtimeStatus;
  isActive: boolean;
  movie: {
    id: string;
    title: string;
    posterUrl: string | null;
    duration: number | null;
    status: string;
    isActive: boolean;
  };
  room: {
    id: string;
    name: string;
    type: string;
    cinemaId: string;
    isActive: boolean;
    cinema: {
      id: string;
      name: string;
      city: string;
      isActive: boolean;
    };
  };
};

type ShowtimesResponse = {
  data: Showtime[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function getStatusBadge(status: ShowtimeStatus) {
  if (status === "SCHEDULED") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        Scheduled
      </Badge>
    );
  }

  if (status === "CANCELLED") {
    return <Badge variant="destructive">Cancelled</Badge>;
  }

  return <Badge variant="secondary">Finished</Badge>;
}

function getComputedShowtimeStatus(showtime: Showtime): ShowtimeStatus {
  if (showtime.status === "CANCELLED") {
    return "CANCELLED";
  }

  if (new Date(showtime.endTime) < new Date()) {
    return "FINISHED";
  }

  return "SCHEDULED";
}

export function ShowtimeTable() {
  const queryClient = useQueryClient();

  const today = format(new Date(), "yyyy-MM-dd");

  const [date, setDate] = useState(today);
  const [searchValue, setSearchValue] = useState("");
  const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["showtimes", date],
    queryFn: async () => {
      const response = await api.get<ShowtimesResponse>("/showtimes", {
        params: {
          date,
        },
      });

      return response.data.data;
    },
  });

  const cancelShowtimeMutation = useMutation({
    mutationFn: async (showtimeId: string) => {
      const response = await api.delete(`/showtimes/${showtimeId}`);

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Showtime cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["showtimes"] });
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to cancel showtime";
      toast.error(message);
    },
  });

  const filteredShowtimes = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    if (!keyword) return data;

    return data.filter((showtime) => {
      return (
        showtime.movie.title.toLowerCase().includes(keyword) ||
        showtime.room.name.toLowerCase().includes(keyword) ||
        showtime.room.cinema.name.toLowerCase().includes(keyword) ||
        showtime.room.cinema.city.toLowerCase().includes(keyword)
      );
    });
  }, [data, searchValue]);

  function handleCancel(showtimeId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this showtime?"
    );

    if (!confirmed) return;

    cancelShowtimeMutation.mutate(showtimeId);
  }

  return (
    <>
      <div className="rounded-2xl border border-zinc-100 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 p-4">
          <div>
            <h2 className="font-semibold text-zinc-950">Showtime schedule</h2>
            <p className="mt-1 text-sm text-zinc-500">
              View and manage movie schedules by date.
            </p>
          </div>

          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full sm:w-44"
            />

            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search showtimes..."
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Movie</TableHead>
                <TableHead>Cinema</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-28 text-center text-sm text-zinc-500"
                  >
                    Loading showtimes...
                  </TableCell>
                </TableRow>
              ) : null}

              {!isLoading && !filteredShowtimes.length ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-28 text-center text-sm text-zinc-500"
                  >
                    No showtimes found.
                  </TableCell>
                </TableRow>
              ) : null}

              {filteredShowtimes.map((showtime) => {
                const computedStatus = getComputedShowtimeStatus(showtime);
                return (
                <TableRow key={showtime.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-10 overflow-hidden rounded-lg bg-zinc-100">
                        {showtime.movie.posterUrl ? (
                          <img
                            src={showtime.movie.posterUrl}
                            alt={showtime.movie.title}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>

                      <div>
                        <p className="font-medium text-zinc-950">
                          {showtime.movie.title}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {showtime.movie.duration || "-"} min
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-zinc-950">
                        {showtime.room.cinema.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {showtime.room.cinema.city}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>{showtime.room.name}</TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-zinc-950">
                        {format(new Date(showtime.startTime), "HH:mm")}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {format(new Date(showtime.endTime), "HH:mm")}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>{formatCurrency(showtime.price)}</TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(computedStatus)}
                        {!showtime.isActive ? (
                            <div>
                            <Badge variant="secondary">Inactive</Badge>
                            </div>
                        ) : null}
                    </div>
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
                          onClick={() => setEditingShowtime(showtime)}
                        >
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="cursor-pointer text-red-600 focus:text-red-600"
                          onClick={() => handleCancel(showtime.id)}
                        >
                          Cancel showtime
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>)
                })}
            </TableBody>
          </Table>
        </div>
      </div>

      <ShowtimeEditDialog
        showtime={editingShowtime}
        open={!!editingShowtime}
        onOpenChange={(open) => {
          if (!open) setEditingShowtime(null);
        }}
      />
    </>
  );
}
