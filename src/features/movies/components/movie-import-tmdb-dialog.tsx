"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type TmdbMovie = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
};

type TmdbSearchResponse = {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
};

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w185";

function getPosterUrl(path: string | null) {
  if (!path) return null;

  return `${TMDB_IMAGE_BASE_URL}${path}`;
}

export function MovieImportTmdbDialog() {
    const queryClient = useQueryClient();

    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [query, setQuery] = useState("");

    const { data, isFetching } = useQuery({
        queryKey: ["tmdb-movies", query],
        queryFn: async () => {
        const response = await api.get<{ data: TmdbSearchResponse }>(
            "/tmdb/movies/search",
            {
            params: {
                query,
            },
            }
        );

        return response.data.data;
        },
        enabled: !!query,
    });

    const importMovieMutation = useMutation({
        mutationFn: async (tmdbId: number) => {
        const response = await api.post("tmdb/movies/import-tmdb", {
            tmdbId,
        });

        return response.data;
        },
        onSuccess: (data) => {
        toast.success(data.message || "Movie imported successfully");
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        },
        onError: (error: any) => {
        const message =
            error?.response?.data?.message || "Failed to import movie";
        toast.error(message);
        },
    });

    function handleSearch() {
        const trimmedValue = searchValue.trim();

        if (!trimmedValue) {
        toast.error("Please enter a movie title");
        return;
        }

        setQuery(trimmedValue);
    }

    function handleImport(tmdbId: number) {
        importMovieMutation.mutate(tmdbId);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button className="cursor-pointer bg-[#1DE782] text-zinc-950 hover:bg-[#19D675]">
            Import from TMDB
            </Button>
        </DialogTrigger>

        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
            <DialogTitle>Import movie from TMDB</DialogTitle>
            <DialogDescription>
                Search movies from TMDB and import selected data into your system.
            </DialogDescription>
            </DialogHeader>

            <div className="flex gap-2">
            <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onKeyDown={(event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    handleSearch();
                }
                }}
                placeholder="Search movie title..."
            />

            <Button
                type="button"
                onClick={handleSearch}
                disabled={isFetching}
                className="cursor-pointer"
            >
                <Search size={16} className="mr-2" />
                {isFetching ? "Searching..." : "Search"}
            </Button>
            </div>

            {!query ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500">
                Search for a movie to start importing from TMDB.
            </div>
            ) : null}

            {query && !isFetching && !data?.results?.length ? (
            <div className="rounded-2xl border border-zinc-100 p-8 text-center text-sm text-zinc-500">
                No movies found.
            </div>
            ) : null}

            {data?.results?.length ? (
            <div className="grid gap-4">
                {data.results.map((movie) => {
                const posterUrl = getPosterUrl(movie.poster_path);

                return (
                    <div
                    key={movie.id}
                    className="flex gap-4 rounded-2xl border border-zinc-100 bg-white p-4"
                    >
                    <div className="h-[138px] w-[92px] shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                        {posterUrl ? (
                        <img
                            src={posterUrl}
                            alt={movie.title}
                            className="h-full w-full object-cover"
                        />
                        ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                            No poster
                        </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h3 className="font-semibold text-zinc-950">
                            {movie.title}
                            </h3>

                            <div className="mt-1 flex flex-wrap items-center gap-2">
                            {movie.release_date ? (
                                <Badge variant="secondary">
                                {movie.release_date}
                                </Badge>
                            ) : null}

                            <Badge variant="outline">
                                TMDB ID: {movie.id}
                            </Badge>

                            {movie.vote_average ? (
                                <Badge variant="outline">
                                Rating: {movie.vote_average.toFixed(1)}
                                </Badge>
                            ) : null}
                            </div>
                        </div>

                        <Button
                            type="button"
                            onClick={() => handleImport(movie.id)}
                            disabled={importMovieMutation.isPending}
                            className="cursor-pointer bg-[#1DE782] text-zinc-950 hover:bg-[#19D675]"
                        >
                            Import
                        </Button>
                        </div>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-500">
                        {movie.overview || "No overview available."}
                        </p>
                    </div>
                    </div>
                );
                })}
            </div>
            ) : null}
        </DialogContent>
        </Dialog>
    );
}