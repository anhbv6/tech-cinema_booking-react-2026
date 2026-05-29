"use client";
/* eslint-disable react-hooks/incompatible-library */

import { useEffect, useState } from "react";
import { Pen } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";
import {
  createMovieSchema,
  type CreateMovieInput,
} from "@/features/admin/movies/schemas/movie.schema";

import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";

type Genre = {
  id: string;
  name: string;
  slug: string;
};

type MovieGenre = {
  genre: Genre;
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

type MovieEditDialogProps = {
  movie: Movie;
};

async function getGenres() {
  const response = await api.get<{ data: Genre[] }>("/genres");
  return response.data.data;
}

function getDateInputValue(value: string | null) {
  if (!value) return "";

  return new Date(value).toISOString().slice(0, 10);
}

export function MovieEditDialog({ movie }: MovieEditDialogProps) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: genres, isLoading: isLoadingGenres } = useQuery({
        queryKey: ["genres"],
        queryFn: getGenres,
    });

    const form = useForm<CreateMovieInput>({
        resolver: zodResolver(createMovieSchema),
        defaultValues: {
        title: movie.title,
        description: movie.description || "",
        posterUrl: movie.posterUrl || "",
        trailerUrl: movie.trailerUrl || "",
        duration: movie.duration || 90,
        releaseDate: getDateInputValue(movie.releaseDate),
        status: movie.status,
        genreIds: movie.genres.map((item) => item.genre.id),
        },
    });

    const selectedGenreIds = form.watch("genreIds");

    useEffect(() => {
        form.reset({
        title: movie.title,
        description: movie.description || "",
        posterUrl: movie.posterUrl || "",
        trailerUrl: movie.trailerUrl || "",
        duration: movie.duration || 90,
        releaseDate: getDateInputValue(movie.releaseDate),
        status: movie.status,
        genreIds: movie.genres.map((item) => item.genre.id),
        });
    }, [movie, form]);

    const updateMovieMutation = useMutation({
        mutationFn: async (values: CreateMovieInput) => {
        const response = await api.patch(`/movies/${movie.id}`, values);
        return response.data;
        },
        onSuccess: (data) => {
        toast.success(data.message || "Movie updated successfully");
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        setOpen(false);
        },
        onError: (error: unknown) => {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update movie";
        toast.error(message);
        },
    });

    function toggleGenre(genreId: string) {
        const currentGenreIds = form.getValues("genreIds");

        if (currentGenreIds.includes(genreId)) {
        form.setValue(
            "genreIds",
            currentGenreIds.filter((id) => id !== genreId),
            { shouldValidate: true }
        );
        return;
        }

        form.setValue("genreIds", [...currentGenreIds, genreId], {
        shouldValidate: true,
        });
    }

    function onSubmit(values: CreateMovieInput) {
        updateMovieMutation.mutate(values);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                type="button"
                className="inline-flex cursor-pointer items-center justify-center rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
                >
                <Pen size={16} />
                </button>
            </DialogTrigger>

            <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto">
                <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                    <div>
                    <DialogTitle>Edit movie</DialogTitle>
                    <DialogDescription>
                        Update movie information, status, and genres.
                    </DialogDescription>
                    </div>

                    <Badge variant={movie.source === "TMDB" ? "default" : "outline"}>
                    {movie.source}
                    </Badge>
                </div>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <Input placeholder="Movie title" {...form.register("title")} />

                    {form.formState.errors.title ? (
                    <p className="mt-2 text-sm text-red-500">
                        {form.formState.errors.title.message}
                    </p>
                    ) : null}
                </div>

                <div>
                    <Textarea
                    placeholder="Movie description"
                    {...form.register("description")}
                    />

                    {form.formState.errors.description ? (
                    <p className="mt-2 text-sm text-red-500">
                        {form.formState.errors.description.message}
                    </p>
                    ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                    <Input placeholder="Poster URL" {...form.register("posterUrl")} />

                    {form.formState.errors.posterUrl ? (
                        <p className="mt-2 text-sm text-red-500">
                        {form.formState.errors.posterUrl.message}
                        </p>
                    ) : null}
                    </div>

                    <div>
                    <Input
                        placeholder="Trailer URL"
                        {...form.register("trailerUrl")}
                    />

                    {form.formState.errors.trailerUrl ? (
                        <p className="mt-2 text-sm text-red-500">
                        {form.formState.errors.trailerUrl.message}
                        </p>
                    ) : null}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                    <Input
                        type="number"
                        placeholder="Duration"
                        {...form.register("duration")}
                    />

                    {form.formState.errors.duration ? (
                        <p className="mt-2 text-sm text-red-500">
                        {form.formState.errors.duration.message}
                        </p>
                    ) : null}
                    </div>

                    <div>
                    <Input type="date" {...form.register("releaseDate")} />

                    {form.formState.errors.releaseDate ? (
                        <p className="mt-2 text-sm text-red-500">
                        {form.formState.errors.releaseDate.message}
                        </p>
                    ) : null}
                    </div>

                    <div>
                    <select
                        {...form.register("status")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-zinc-950 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="DRAFT">Draft</option>
                        <option value="NOW_SHOWING">Now showing</option>
                        <option value="COMING_SOON">Coming soon</option>
                        <option value="ENDED">Ended</option>
                    </select>

                    {form.formState.errors.status ? (
                        <p className="mt-2 text-sm text-red-500">
                        {form.formState.errors.status.message}
                        </p>
                    ) : null}
                    </div>
                </div>

                <div>
                    <p className="mb-2 text-sm font-medium text-zinc-950">Genres</p>

                    {isLoadingGenres ? (
                    <div className="rounded-xl border border-zinc-100 bg-white p-4 text-sm text-zinc-500">
                        Loading genres...
                    </div>
                    ) : (
                    <div className="grid max-h-52 gap-3 overflow-y-auto rounded-xl border border-zinc-100 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
                        {genres?.map((genre) => (
                        <label
                            key={genre.id}
                            className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700"
                        >
                            <Checkbox
                            checked={selectedGenreIds.includes(genre.id)}
                            onCheckedChange={() => toggleGenre(genre.id)}
                            />
                            <span>{genre.name}</span>
                        </label>
                        ))}
                    </div>
                    )}

                    {form.formState.errors.genreIds ? (
                    <p className="mt-2 text-sm text-red-500">
                        {form.formState.errors.genreIds.message}
                    </p>
                    ) : null}
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="cursor-pointer"
                    >
                    Cancel
                    </Button>

                    <Button
                    type="submit"
                    disabled={updateMovieMutation.isPending}
                    className="cursor-pointer bg-[#1DE782] text-zinc-950 hover:bg-[#19D675]"
                    >
                    {updateMovieMutation.isPending ? "Saving..." : "Save changes"}
                    </Button>
                </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
