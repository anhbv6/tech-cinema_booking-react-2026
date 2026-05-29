"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MovieEditDialog } from "./movie-edit-dialog";

type MovieGenre = {
  genre: {
    id: string;
    name: string;
    slug: string;
  };
};

type Movie = {
  id: string;
  tmdbId: number | null;
  source: "MANUAL" | "TMDB";
  title: string;
  slug: string;
  description: string | null;
  posterUrl: string | null;
  trailerUrl: string | null;
  backdropUrl: string | null;
  duration: number | null;
  releaseDate: string | null;
  status: "DRAFT" | "NOW_SHOWING" | "COMING_SOON" | "ENDED";
  isActive: boolean;
  genres: MovieGenre[];
};

const ITEMS_PER_PAGE = 8;

async function getMovies() {
  const response = await api.get<{ data: Movie[] }>("/movies");
  return response.data.data;
}

function formatDate(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function formatStatus(status: Movie["status"]) {
  const statusMap = {
    DRAFT: "Draft",
    NOW_SHOWING: "Now showing",
    COMING_SOON: "Coming soon",
    ENDED: "Ended",
  };

  return statusMap[status];
}

export function MovieTable() {
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["movies"],
        queryFn: getMovies,
    });

    const totalPages = data ? Math.ceil(data.length / ITEMS_PER_PAGE) : 1;

    const paginatedMovies = useMemo(() => {
        if (!data) return [];

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;

        return data.slice(startIndex, endIndex);
    }, [data, currentPage]);

    const handleDelete = async (id: string) => {
        try {
        const response = await api.delete(`/movies/${id}`);

        toast.success(response.data.message || "Movie deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        } catch (error: unknown) {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to delete movie";
        toast.error(message);
        }
    };

    if (isLoading) {
        return (
        <div className="rounded-2xl border border-zinc-100 p-5 text-sm text-zinc-500">
            Loading movie list...
        </div>
        );
    }

    if (isError) {
        return (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
            Unable to load movie list.
        </div>
        );
    }

    if (!data?.length) {
        return (
        <div className="rounded-2xl border border-zinc-100 p-8 text-center text-sm text-zinc-500">
            No movies have been created yet.
        </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-zinc-100">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Movie</TableHead>
                    <TableHead>Genres</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Release date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
                </TableHeader>

                <TableBody>
                {paginatedMovies.map((movie) => (
                    <TableRow key={movie.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                        <div className="h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                            {movie.posterUrl ? (
                            <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="h-full w-full object-cover"
                            />
                            ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                                No poster
                            </div>
                            )}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate font-medium text-zinc-950">
                            {movie.title}
                            </p>
                            <p className="mt-1 truncate text-xs text-zinc-500">
                            {movie.slug}
                            </p>
                        </div>
                        </div>
                    </TableCell>

                    <TableCell>
                        <div className="flex max-w-xs flex-wrap gap-1">
                        {movie.genres.length ? (
                            movie.genres.slice(0, 3).map((item) => (
                            <Badge key={item.genre.id} variant="secondary">
                                {item.genre.name}
                            </Badge>
                            ))
                        ) : (
                            <span className="text-sm text-zinc-500">-</span>
                        )}

                        {movie.genres.length > 3 ? (
                            <Badge variant="outline">
                            +{movie.genres.length - 3}
                            </Badge>
                        ) : null}
                        </div>
                    </TableCell>

                    <TableCell>
                        <Badge variant={movie.source === "TMDB" ? "default" : "outline"}>
                        {movie.source}
                        </Badge>
                    </TableCell>

                    <TableCell>
                        <Badge variant="secondary">
                        {formatStatus(movie.status)}
                        </Badge>
                    </TableCell>

                    <TableCell className="text-zinc-500">
                        {movie.duration ? `${movie.duration} min` : "-"}
                    </TableCell>

                    <TableCell className="text-zinc-500">
                        {formatDate(movie.releaseDate)}
                    </TableCell>

                    <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                        <MovieEditDialog movie={movie} />

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <button
                                type="button"
                                className="inline-flex cursor-pointer items-center justify-center rounded-md p-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                                <Trash size={16} />
                            </button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                Delete this movie?
                                </AlertDialogTitle>

                                <AlertDialogDescription>
                                Are you sure you want to delete &quot;{movie.title}&quot;? This
                                action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel className="cursor-pointer">
                                Cancel
                                </AlertDialogCancel>

                                <AlertDialogAction
                                onClick={() => handleDelete(movie.id)}
                                className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
                                >
                                Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </div>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>

            <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3">
                <p className="text-sm text-zinc-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(currentPage * ITEMS_PER_PAGE, data.length)} of{" "}
                {data.length} movies
                </p>

                <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => page - 1)}
                    className="cursor-pointer"
                >
                    Previous
                </Button>

                <span className="text-sm text-zinc-500">
                    Page {currentPage} of {totalPages}
                </span>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((page) => page + 1)}
                    className="cursor-pointer"
                >
                    Next
                </Button>
                </div>
            </div>
        </div>
    );
}
