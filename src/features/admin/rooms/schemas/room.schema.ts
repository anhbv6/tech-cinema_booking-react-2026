import { z } from "zod";

export const roomTypes = ["STANDARD", "IMAX", "FOUR_DX", "VIP"] as const;

export const roomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  type: z.enum(roomTypes),
  cinemaId: z.string().min(1, "Cinema is required"),
  isActive: z.boolean().default(true),
});

export type RoomFormValues = z.input<typeof roomSchema>;
export type RoomType = (typeof roomTypes)[number];
