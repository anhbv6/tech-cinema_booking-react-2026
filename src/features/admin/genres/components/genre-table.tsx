"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pen, Trash } from "lucide-react";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";
import {
  createGenreSchema,
  type CreateGenreInput,
} from "@/features/admin/genres/schemas/genre.schema";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Genre = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
};

const ITEMS_PER_PAGE = 7;

async function getGenres() {
  const response = await api.get<{ data: Genre[] }>("/genres");
  return response.data.data;
}

function GenreEditDialog({ genre }: { genre: Genre }) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<CreateGenreInput>({
            resolver: zodResolver(createGenreSchema),
            defaultValues: {
            name: genre.name,
            description: genre.description || "",
        },
    });

    useEffect(() => {
        form.reset({
        name: genre.name,
        description: genre.description || "",
        });
    }, [genre, form]);

    const updateGenreMutation = useMutation({
        mutationFn: async (values: CreateGenreInput) => {
            const response = await api.patch(`/genres/${genre.id}`, values);
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Genre updated successfully");
            queryClient.invalidateQueries({ queryKey: ["genres"] });
            setOpen(false);
        },
        onError: (error: unknown) => {
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update genre";
            toast.error(message);
        },
    });

    function onSubmit(values: CreateGenreInput) {
        updateGenreMutation.mutate(values);
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

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit genre</DialogTitle>
                    <DialogDescription>
                        Update the genre name and description.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Input placeholder="Example: Action" {...form.register("name")} />

                        {form.formState.errors.name ? (
                        <p className="mt-2 text-sm text-red-500">
                            {form.formState.errors.name.message}
                        </p>
                        ) : null}
                    </div>

                    <div>
                        <Textarea
                        placeholder="A brief description for this genre."
                        {...form.register("description")}
                        />

                        {form.formState.errors.description ? (
                        <p className="mt-2 text-sm text-red-500">
                            {form.formState.errors.description.message}
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
                        disabled={updateGenreMutation.isPending}
                        className="cursor-pointer bg-[#1DE782] text-zinc-950 hover:bg-[#19D675]"
                        >
                        {updateGenreMutation.isPending ? "Saving..." : "Save changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function GenreTable() {
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["genres"],
        queryFn: getGenres,
        // refetchOnMount: false,
        // refetchOnWindowFocus: false,
    });

    const totalPages = data ? Math.ceil(data.length / ITEMS_PER_PAGE) : 1;
    const safeCurrentPage = Math.min(currentPage, totalPages);

    const paginatedGenres = useMemo(() => {
        if (!data) return [];

        const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;

        return data.slice(startIndex, endIndex);
    }, [data, safeCurrentPage]);

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/genres/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to delete genre");
                return;
            }

            toast.success(data.message || "Genre deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["genres"] });
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete genre");
        }
    };

    if (isLoading) {
        return (
        <div className="rounded-2xl border border-zinc-100 p-5 text-sm text-zinc-500">
            Loading genre list...
        </div>
        );
    }

    if (isError) {
        return (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
            Unable to load genre list.
        </div>
        );
    }

    if (!data?.length) {
        return (
        <div className="rounded-2xl border border-zinc-100 p-5 text-sm text-zinc-500">
            No genres have been created yet.
        </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="overflow-hidden rounded-2xl border border-zinc-100">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Genre name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                    {paginatedGenres.map((genre) => (
                        <TableRow key={genre.id}>
                            <TableCell className="font-medium text-zinc-950">
                                {genre.name}
                            </TableCell>

                            <TableCell className="text-zinc-500">{genre.slug}</TableCell>

                            <TableCell>
                                {genre.isActive ? (
                                    <Badge className="bg-[#1DE782]/10 text-[#13A85F] hover:bg-[#1DE782]/10">
                                        Active
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">Inactive</Badge>
                                )}
                            </TableCell>

                            <TableCell className="max-w-md text-zinc-500">
                                {genre.description ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <p className="max-w-md cursor-default truncate">
                                            {genre.description}
                                            </p>
                                        </TooltipTrigger>

                                        <TooltipContent className="max-w-sm">
                                            <p>{genre.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ) : ("-")}
                            </TableCell>

                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                    <GenreEditDialog genre={genre} />

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
                                                <AlertDialogTitle>Delete this genre?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                Are you sure you want to delete &quot;{genre.name}&quot;? This
                                                action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>

                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(genre.id)}
                                                    className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
                                                >Delete</AlertDialogAction>
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
                        Showing {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}-
                        {Math.min(safeCurrentPage * ITEMS_PER_PAGE, data.length)} of{" "}
                        {data.length} genres
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
                        Page {safeCurrentPage} of {totalPages}
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
        </TooltipProvider>
    );
}
