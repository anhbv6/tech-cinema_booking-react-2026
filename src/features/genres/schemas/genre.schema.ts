import { z } from "zod";

export const createGenreSchema = z.object({
    name: z
        .string()
        .min(1, "Tên thể loại là bắt buộc")
        .max(100, "Tên thể loại không được quá 100 ký tự"),

    description: z
        .string()
        .max(500, "Mô tả không được quá 500 ký tự")
        .optional()
        .or(z.literal("")),
});

export type CreateGenreInput = z.infer<typeof createGenreSchema>;