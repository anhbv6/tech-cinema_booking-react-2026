import { z } from "zod";

export const seatTypes = ["NORMAL", "VIP", "COUPLE"] as const;

export const generateSeatsSchema = z.object({
  rows: z.coerce
    .number()
    .min(1, "Rows must be at least 1")
    .max(26, "Rows cannot be greater than 26"),
  seatsPerRow: z.coerce
    .number()
    .min(1, "Seats per row must be at least 1")
    .max(30, "Seats per row cannot be greater than 30"),
  defaultType: z.enum(seatTypes).default("NORMAL"),
});

export const updateSeatSchema = z.object({
  type: z.enum(seatTypes),
  isActive: z.boolean(),
});

export type GenerateSeatsFormValues = z.input<typeof generateSeatsSchema>;
export type UpdateSeatFormValues = z.input<typeof updateSeatSchema>;
export type SeatType = (typeof seatTypes)[number];
