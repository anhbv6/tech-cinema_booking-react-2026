import { z } from "zod";

export const movieStatusSchema = z.enum([
  "DRAFT",
  "NOW_SHOWING",
  "COMING_SOON",
  "ENDED",
]);

export const createMovieSchema = z.object({
    title: z
        .string()
        .min(1, "Movie title is required")
        .max(255, "Movie title is too long"),

    description: z
        .string()
        .max(2000, "Description is too long")
        .optional()
        .nullable(),

    posterUrl: z
        .string()
        .url("Poster URL must be a valid URL")
        .optional()
        .or(z.literal("")),

    trailerUrl: z
        .string()
        .url("Trailer URL must be a valid URL")
        .optional()
        .or(z.literal("")),

    duration: z.coerce
        .number()
        .int("Duration must be an integer")
        .min(1, "Duration must be greater than 0"),

    releaseDate: z
        .string()
        .optional()
        .nullable(),

    status: movieStatusSchema.default("DRAFT"),

    genreIds: z
        .array(z.string())
        .min(1, "Please select at least one genre"),
    }
);

export type CreateMovieInput = z.infer<typeof createMovieSchema>;