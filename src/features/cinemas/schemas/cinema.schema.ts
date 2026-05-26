import { z } from "zod";

export const cinemaSchema = z.object({
  name: z.string().min(1, "Cinema name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  phone: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type CinemaFormValues = z.infer<typeof cinemaSchema>;