"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Search } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";
import type { RoomType } from "@/features/admin/rooms/schemas/room.schema";

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
import { RoomEditDialog } from "./room-edit-dialog";

export type Room = {
  id: string;
  name: string;
  type: RoomType;
  cinemaId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  cinema: {
    id: string;
    name: string;
    city: string;
    isActive: boolean;
  };
};

type RoomsResponse = {
  data: Room[];
};

function formatRoomType(type: string) {
  return type.replace("_", " ");
}

export function RoomTable() {
  const queryClient = useQueryClient();

  const [searchValue, setSearchValue] = useState("");
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const response = await api.get<RoomsResponse>("/rooms");

      return response.data.data;
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const response = await api.delete(`/rooms/${roomId}`);

      
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Room deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (error: unknown) => {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { data?: { message?: string } } }).response
          ?.data?.message
          ? (error as { response?: { data?: { message?: string } } }).response!
              .data!.message!
          : "Failed to delete room";
      toast.error(message);
    },
  });

  const filteredRooms = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    if (!keyword) return data;

    return data.filter((room) => {
      return (
        room.name.toLowerCase().includes(keyword) ||
        room.type.toLowerCase().includes(keyword) ||
        room.cinema.name.toLowerCase().includes(keyword) ||
        room.cinema.city.toLowerCase().includes(keyword)
      );
    });
  }, [data, searchValue]);

  function handleDelete(roomId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this room?"
    );

    if (!confirmed) return;

    deleteRoomMutation.mutate(roomId);
  }

  return (
    <>
      <div className="rounded-2xl border border-zinc-100 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 p-4">
          <div>
            <h2 className="font-semibold text-zinc-950">Room list</h2>
            <p className="mt-1 text-sm text-zinc-500">
              View and manage all cinema screening rooms.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search rooms..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Cinema</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-sm text-zinc-500"
                  >
                    Loading rooms...
                  </TableCell>
                </TableRow>
              ) : null}

              {!isLoading && !filteredRooms.length ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-sm text-zinc-500"
                  >
                    No rooms found.
                  </TableCell>
                </TableRow>
              ) : null}

              {filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>
                    <p className="font-medium text-zinc-950">{room.name}</p>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">{formatRoomType(room.type)}</Badge>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-zinc-950">
                        {room.cinema.name}
                      </p>
                      {!room.cinema.isActive ? (
                        <p className="mt-1 text-xs text-red-500">
                          Cinema inactive
                        </p>
                      ) : null}
                    </div>
                  </TableCell>

                  <TableCell>{room.cinema.city}</TableCell>

                  <TableCell>
                    {room.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
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
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/rooms/${room.id}/seats`}
                            className="cursor-pointer"
                          >
                            Manage seats
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => setEditingRoom(room)}
                        >
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="cursor-pointer text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(room.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <RoomEditDialog
        room={editingRoom}
        open={!!editingRoom}
        onOpenChange={(open) => {
          if (!open) setEditingRoom(null);
        }}
      />
    </>
  );
}
