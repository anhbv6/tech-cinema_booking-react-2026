import { z } from "zod";

export const bookingStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "EXPIRED",
]);

export const createBookingSchema = z.object({
  showtimeId: z.string().min(1, "Showtime is required"),

  seatIds: z
    .array(z.string().min(1, "Seat is required"))
    .min(1, "Please select at least one seat"),
});

export const updateBookingStatusSchema = z.object({
  status: bookingStatusSchema,
});

export type BookingStatusInput = z.infer<typeof bookingStatusSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<
  typeof updateBookingStatusSchema
>;