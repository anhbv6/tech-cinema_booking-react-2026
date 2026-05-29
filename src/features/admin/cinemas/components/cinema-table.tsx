"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Search } from "lucide-react";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";

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
import { CinemaEditDialog } from "./cinema-edit-dialog";

type Cinema = {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type CinemasResponse = {
  data: Cinema[];
};

export function CinemaTable() {
  const queryClient = useQueryClient();

  const [searchValue, setSearchValue] = useState("");
  const [editingCinema, setEditingCinema] = useState<Cinema | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["cinemas"],
    queryFn: async () => {
      const response = await api.get<CinemasResponse>("/cinemas");

      return response.data.data;
    },
  });

  const deleteCinemaMutation = useMutation({
    mutationFn: async (cinemaId: string) => {
      const response = await api.delete(`/cinemas/${cinemaId}`);

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Cinema deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["cinemas"] });
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to delete cinema";
      toast.error(message);
    },
  });

  const filteredCinemas = useMemo(() => {
    if (!data) return [];

    const keyword = searchValue.trim().toLowerCase();

    if (!keyword) return data;

    return data.filter((cinema) => {
      return (
        cinema.name.toLowerCase().includes(keyword) ||
        cinema.city.toLowerCase().includes(keyword) ||
        cinema.address.toLowerCase().includes(keyword)
      );
    });
  }, [data, searchValue]);

  function handleDelete(cinemaId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this cinema?"
    );

    if (!confirmed) return;

    deleteCinemaMutation.mutate(cinemaId);
  }

  return (
    <>
      <div className="rounded-2xl border border-zinc-100 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 p-4">
          <div>
            <h2 className="font-semibold text-zinc-950">Cinema list</h2>
            <p className="mt-1 text-sm text-zinc-500">
              View and manage all cinema locations.
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
              placeholder="Search cinemas..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cinema</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
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
                    Loading cinemas...
                  </TableCell>
                </TableRow>
              ) : null}

              {!isLoading && !filteredCinemas.length ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-sm text-zinc-500"
                  >
                    No cinemas found.
                  </TableCell>
                </TableRow>
              ) : null}

              {filteredCinemas.map((cinema) => (
                <TableRow key={cinema.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-zinc-950">
                        {cinema.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        /{cinema.slug}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>{cinema.city}</TableCell>

                  <TableCell className="max-w-[320px]">
                    <p className="line-clamp-2 text-sm text-zinc-600">
                      {cinema.address}
                    </p>
                  </TableCell>

                  <TableCell>{cinema.phone || "-"}</TableCell>

                  <TableCell>
                    {cinema.isActive ? (
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
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => setEditingCinema(cinema)}
                        >
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="cursor-pointer text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(cinema.id)}
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

      <CinemaEditDialog
        cinema={editingCinema}
        open={!!editingCinema}
        onOpenChange={(open) => {
          if (!open) setEditingCinema(null);
        }}
      />
    </>
  );
}