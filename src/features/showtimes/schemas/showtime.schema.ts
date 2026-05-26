import { z } from "zod";

export const showtimeStatuses = [
  "SCHEDULED",
  "CANCELLED",
  "FINISHED",
] as const;

export const createShowtimeSchema = z.object({
  movieId: z.string().min(1, "Movie is required"),
  cinemaId: z.string().min(1, "Cinema is required"),
  roomId: z.string().min(1, "Room is required"),
  startTime: z.string().min(1, "Start time is required"),
  price: z.coerce
    .number()
    .min(1000, "Price must be at least 1,000")
    .max(10000000, "Price is too high"),
  isActive: z.boolean().default(true),
});

export const updateShowtimeSchema = z.object({
  movieId: z.string().min(1, "Movie is required"),
  cinemaId: z.string().min(1, "Cinema is required"),
  roomId: z.string().min(1, "Room is required"),
  startTime: z.string().min(1, "Start time is required"),
  price: z.coerce
    .number()
    .min(1000, "Price must be at least 1,000")
    .max(10000000, "Price is too high"),
  status: z.enum(["SCHEDULED", "CANCELLED"]),
  isActive: z.boolean().default(true),
});

export type CreateShowtimeFormValues = z.infer<typeof createShowtimeSchema>;
export type UpdateShowtimeFormValues = z.infer<typeof updateShowtimeSchema>;
export type ShowtimeStatus = (typeof showtimeStatuses)[number];