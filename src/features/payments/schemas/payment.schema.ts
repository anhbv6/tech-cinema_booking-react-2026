import { z } from "zod";

export const paymentStatusSchema = z.enum([
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
  "CANCELLED",
]);

export const paymentMethodSchema = z.enum([
  "CASH",
  "MOMO",
  "VNPAY",
  "BANK_TRANSFER",
  "CREDIT_CARD",
]);

export const updatePaymentStatusSchema = z.object({
  status: paymentStatusSchema,
});

export const createPaymentSchema = z.object({
  bookingId: z.string().min(1, "Booking is required"),

  amount: z.coerce
    .number()
    .int("Amount must be an integer")
    .min(1, "Amount must be greater than 0"),

  method: paymentMethodSchema,

  transactionId: z.string().optional().nullable(),
  provider: z.string().optional().nullable(),
});

export type PaymentStatusInput = z.infer<typeof paymentStatusSchema>;
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;
export type UpdatePaymentStatusInput = z.infer<
  typeof updatePaymentStatusSchema
>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;