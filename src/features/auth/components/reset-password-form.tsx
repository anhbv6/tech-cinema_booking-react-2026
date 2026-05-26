"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { resetPasswordWithCodeSchema } from "@/features/auth/schemas/auth.schema";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const code = searchParams.get("code") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = resetPasswordWithCodeSchema.safeParse({
      email,
      code,
      password,
      confirmPassword,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid input");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to reset password");
        return;
      }

      toast.success("Password updated successfully");
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[420px] bg-zinc-100 px-12 py-16">
      <div className="mb-8 text-center">
        <p className="text-[11px] font-semibold text-zinc-900">CineMax</p>
      </div>

      <h1 className="text-center text-[26px] font-bold text-zinc-900">Create New Password</h1>
      <p className="mt-1 text-center text-xs text-zinc-500">Enter your new password</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-[11px] text-zinc-600">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className="h-10 w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 text-xs outline-none focus:border-[#af38e8]"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-[11px] text-zinc-600">
            New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Enter your new password"
            className="h-10 w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 text-xs outline-none focus:border-[#af38e8]"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="h-10 w-full rounded-full bg-[#af38e8] text-xs font-semibold text-white transition hover:bg-[#9a2fd1] disabled:opacity-60"
        >
          {isLoading ? "Saving..." : "Update Password"}
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
