import { z } from "zod";

export const createGenreSchema = z.object({
    name: z
        .string()
        .min(1, "Category name is required.")
        .max(100, "Category names must not exceed 100 characters."),

    description: z
        .string()
        .max(500, "The description should not exceed 500 characters.")
        .optional()
        .or(z.literal("")),
});

export type CreateGenreInput = z.infer<typeof createGenreSchema>;