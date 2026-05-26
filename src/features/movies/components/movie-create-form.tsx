"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";
import {
  createMovieSchema,
  type CreateMovieInput,
} from "@/features/movies/schemas/movie.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

type Genre = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
};

type MovieCreateFormProps = {
  onCreated?: () => void;
};

async function getGenres() {
  const response = await api.get<{ data: Genre[] }>("/genres");
  return response.data.data;
}

export function MovieCreateForm({ onCreated }: MovieCreateFormProps) {
    const queryClient = useQueryClient();

    const { data: genres, isLoading: isLoadingGenres } = useQuery({
        queryKey: ["genres"],
        queryFn: getGenres,
    });

    const form = useForm<CreateMovieInput>({
        resolver: zodResolver(createMovieSchema),
        defaultValues: {
        title: "",
        description: "",
        posterUrl: "",
        trailerUrl: "",
        duration: 90,
        releaseDate: "",
        status: "DRAFT",
        genreIds: [],
        },
    });

    const selectedGenreIds = form.watch("genreIds");

    const createMovieMutation = useMutation({
        mutationFn: async (values: CreateMovieInput) => {
        const response = await api.post("/movies", values);
        return response.data;
        },
        onSuccess: (data) => {
        toast.success(data.message || "Movie created successfully");
        form.reset();
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        onCreated?.();
        },
        onError: (error: any) => {
        const message =
            error?.response?.data?.message || "Failed to create movie";
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
        createMovieMutation.mutate(values);
    }

    return (
        <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5"
        >
        <div className="mb-5">
            <h2 className="text-lg font-semibold text-zinc-950">Add movie</h2>
            <p className="mt-1 text-sm text-zinc-500">
            Create a movie and assign it to one or more genres.
            </p>
        </div>

        <div className="space-y-4">
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

            <Button
            type="submit"
            disabled={createMovieMutation.isPending}
            className="min-h-[40px] cursor-pointer bg-[#1DE782] text-zinc-950 hover:bg-[#19D675]"
            >
            {createMovieMutation.isPending ? "Creating..." : "Create movie"}
            </Button>
        </div>
        </form>
    );
}