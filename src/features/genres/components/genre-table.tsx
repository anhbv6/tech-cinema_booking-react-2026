"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Genre = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
};

async function getGenres() {
  const response = await api.get<{ data: Genre[] }>("/genres");
  return response.data.data;
}

export function GenreTable() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["genres"],
        queryFn: getGenres,
    });

    if (isLoading) {
        return (
        <div className="rounded-2xl border border-zinc-100 p-5 text-sm text-zinc-500">
            Đang tải danh sách thể loại...
        </div>
        );
    }

    if (isError) {
        return (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
            Không thể tải danh sách thể loại.
        </div>
        );
    }

    if (!data?.length) {
        return (
        <div className="rounded-2xl border border-zinc-100 p-5 text-sm text-zinc-500">
            Chưa có thể loại nào.
        </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-zinc-100">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Tên thể loại</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Mô tả</TableHead>
            </TableRow>
            </TableHeader>

            <TableBody>
            {data.map((genre) => (
                <TableRow key={genre.id}>
                <TableCell className="font-medium text-zinc-950">
                    {genre.name}
                </TableCell>

                <TableCell className="text-zinc-500">
                    {genre.slug}
                </TableCell>

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
                    {genre.description || "-"}
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </div>
    );
}