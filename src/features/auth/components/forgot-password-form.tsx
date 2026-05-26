"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { forgotPasswordSchema } from "@/features/auth/schemas/auth.schema";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = forgotPasswordSchema.safeParse({ email });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid email");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to send reset code");
        return;
      }

      if (data.devCode) {
        toast.success(`Dev code: ${data.devCode}`);
      } else {
        toast.success(data.message || "Verification code sent");
      }

      router.push(`/verify-reset-code?email=${encodeURIComponent(parsed.data.email)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[420px] bg-zinc-100 px-12 py-16">
      <div className="mb-8 text-center">
        <p className="text-[11px] font-semibold text-zinc-900">CineMax</p>
      </div>

      <h1 className="text-center text-[26px] font-bold text-zinc-900">Reset Password</h1>
      <p className="mt-1 text-center text-xs text-zinc-500">Retrieve your password</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-[11px] text-zinc-600">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email address"
            className="h-10 w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 text-xs outline-none focus:border-[#af38e8]"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="h-10 w-full rounded-full bg-[#af38e8] text-xs font-semibold text-white transition hover:bg-[#9a2fd1] disabled:opacity-60"
        >
          {isLoading ? "Sending..." : "Continue"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-zinc-500">
        Back to{" "}
        <Link className="font-semibold text-[#af38e8]" href="/login">
          Login
        </Link>
      </p>
    </div>
  );
}
