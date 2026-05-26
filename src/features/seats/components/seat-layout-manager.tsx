"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Armchair, RefreshCcw } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";
import type { SeatType } from "@/features/seats/schemas/seat.schema";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GenerateSeatsDialog } from "./generate-seats-dialog";
import { SeatEditDialog } from "./seat-edit-dialog";

type Seat = {
  id: string;
  roomId: string;
  row: string;
  number: number;
  type: SeatType;
  isActive: boolean;
};

type RoomSeatsResponse = {
  data: {
    id: string;
    name: string;
    type: string;
    isActive: boolean;
    cinema: {
      id: string;
      name: string;
      city: string;
    };
    seats: Seat[];
  };
};

function formatRoomType(type: string) {
  return type.replace("_", " ");
}

function getSeatClassName(seat: Seat) {
  if (!seat.isActive) {
    return "border-zinc-200 bg-zinc-100 text-zinc-400";
  }

  if (seat.type === "VIP") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (seat.type === "COUPLE") {
    return "border-pink-200 bg-pink-50 text-pink-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export function SeatLayoutManager({ roomId }: { roomId: string }) {
  const queryClient = useQueryClient();

  const [editingSeat, setEditingSeat] = useState<Seat | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["room-seats", roomId],
    queryFn: async () => {
      const response = await api.get<RoomSeatsResponse>(
        `/rooms/${roomId}/seats`
      );

      return response.data.data;
    },
  });

  const seatsByRow = useMemo(() => {
    const result = new Map<string, Seat[]>();

    if (!data?.seats) return result;

    data.seats.forEach((seat) => {
      if (!result.has(seat.row)) {
        result.set(seat.row, []);
      }

      result.get(seat.row)?.push(seat);
    });

    return result;
  }, [data?.seats]);

  const totalSeats = data?.seats.length || 0;
  const activeSeats = data?.seats.filter((seat) => seat.isActive).length || 0;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-100 bg-white p-8 text-center text-sm text-zinc-500">
        Loading seat layout...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-zinc-100 bg-white p-8 text-center text-sm text-zinc-500">
        Room not found.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Button variant="ghost" asChild className="mb-3 cursor-pointer">
              <Link href="/admin/rooms">
                <ArrowLeft size={16} className="mr-2" />
                Back to rooms
              </Link>
            </Button>

            <h1 className="text-2xl font-semibold text-zinc-950">
              Seat layout
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Manage seats for {data.name} at {data.cinema.name}.
            </p>
          </div>

          <GenerateSeatsDialog roomId={roomId} hasSeats={totalSeats > 0} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-zinc-100 bg-white p-4">
            <p className="text-sm text-zinc-500">Cinema</p>
            <p className="mt-1 font-semibold text-zinc-950">
              {data.cinema.name}
            </p>
            <p className="mt-1 text-sm text-zinc-500">{data.cinema.city}</p>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-white p-4">
            <p className="text-sm text-zinc-500">Room</p>
            <p className="mt-1 font-semibold text-zinc-950">{data.name}</p>
            <p className="mt-1 text-sm text-zinc-500">
              {formatRoomType(data.type)}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-white p-4">
            <p className="text-sm text-zinc-500">Total seats</p>
            <p className="mt-1 font-semibold text-zinc-950">{totalSeats}</p>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-white p-4">
            <p className="text-sm text-zinc-500">Active seats</p>
            <p className="mt-1 font-semibold text-zinc-950">{activeSeats}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 p-4">
            <div>
              <h2 className="font-semibold text-zinc-950">Layout preview</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Click a seat to update type or availability.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                Normal
              </Badge>
              <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                VIP
              </Badge>
              <Badge className="bg-pink-50 text-pink-700 hover:bg-pink-50">
                Couple
              </Badge>
              <Badge variant="secondary">Inactive</Badge>
            </div>
          </div>

          {totalSeats === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                <Armchair size={22} />
              </div>

              <h3 className="mt-4 font-semibold text-zinc-950">
                No seats generated
              </h3>

              <p className="mt-1 max-w-md text-sm text-zinc-500">
                Generate a seat layout first. You can edit individual seats
                after generating.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto p-6">
              <div className="mx-auto mb-8 flex h-10 max-w-xl items-center justify-center rounded-b-full border border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-500">
                SCREEN
              </div>

              <div className="space-y-3">
                {Array.from(seatsByRow.entries()).map(([row, seats]) => (
                  <div key={row} className="flex items-center gap-3">
                    <div className="w-6 text-sm font-medium text-zinc-500">
                      {row}
                    </div>

                    <div className="flex flex-1 justify-center gap-2">
                      {seats.map((seat) => (
                        <button
                          key={seat.id}
                          type="button"
                          onClick={() => setEditingSeat(seat)}
                          className={`h-10 min-w-10 rounded-lg border px-2 text-xs font-semibold transition hover:scale-105 ${getSeatClassName(
                            seat
                          )}`}
                        >
                          {seat.row}
                          {seat.number}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <SeatEditDialog
        seat={editingSeat}
        open={!!editingSeat}
        onOpenChange={(open) => {
          if (!open) setEditingSeat(null);
        }}
        onUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ["room-seats", roomId] });
        }}
      />
    </>
  );
}