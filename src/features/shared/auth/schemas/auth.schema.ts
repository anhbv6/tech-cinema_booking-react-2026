// src/features/auth/schemas/auth.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const verifyAccountSchema = z.object({
  code: z.string().length(4, "Code must be 4 digits"),
});

export const verifyResetCodeSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  code: z.string().length(4, "Code must be 4 digits"),
});

export const resetPasswordWithCodeSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email"),
    code: z.string().length(4, "Code must be 4 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyAccountInput = z.infer<typeof verifyAccountSchema>;
export type VerifyResetCodeInput = z.infer<typeof verifyResetCodeSchema>;
export type ResetPasswordWithCodeInput = z.infer<typeof resetPasswordWithCodeSchema>;
