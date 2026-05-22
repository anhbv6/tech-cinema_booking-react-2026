"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";
import {
  createGenreSchema,
  type CreateGenreInput,
} from "@/features/genres/schemas/genre.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function GenreCreateForm() {
    const queryClient = useQueryClient();

    const form = useForm<CreateGenreInput>({
        resolver: zodResolver(createGenreSchema),
        defaultValues: {
        name: "",
        description: "",
        },
    });

    const createGenreMutation = useMutation({
        mutationFn: async (values: CreateGenreInput) => {
        const response = await api.post("/genres", values);
        return response.data;
        },
        onSuccess: () => {
        toast.success("Tạo thể loại thành công");
        form.reset();
        queryClient.invalidateQueries({ queryKey: ["genres"] });
        },
        onError: (error: any) => {
        const message =
            error?.response?.data?.message || "Không thể tạo thể loại";
        toast.error(message);
        },
    });

    function onSubmit(values: CreateGenreInput) {
        createGenreMutation.mutate(values);
    }

    return (
        <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5"
        >
        <div className="mb-5">
            <h2 className="text-lg font-semibold text-zinc-950">
            Thêm thể loại
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
            Tạo thể loại phim dùng cho quản lý phim sau này.
            </p>
        </div>

        <div className="space-y-4">
            <div>
            <Input
                placeholder="Ví dụ: Hành động"
                {...form.register("name")}
            />

            {form.formState.errors.name ? (
                <p className="mt-2 text-sm text-red-500">
                {form.formState.errors.name.message}
                </p>
            ) : null}
            </div>

            <div>
            <Textarea
                placeholder="Mô tả ngắn cho thể loại này"
                {...form.register("description")}
            />

            {form.formState.errors.description ? (
                <p className="mt-2 text-sm text-red-500">
                {form.formState.errors.description.message}
                </p>
            ) : null}
            </div>

            <Button
            type="submit"
            disabled={createGenreMutation.isPending}
            className="bg-[#1DE782] text-zinc-950 hover:bg-[#19D675]"
            >
            {createGenreMutation.isPending ? "Đang tạo..." : "Tạo thể loại"}
            </Button>
        </div>
        </form>
    );
}