// src/features/auth/components/register-form.tsx
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { registerSchema } from "@/features/auth/schemas/auth.schema";

export function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid register data");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Register failed");
        return;
      }

      toast.success("Register successfully");
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-[26px] font-bold text-zinc-950">Register</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-[18px]">
        <div className="space-y-2">
          <label htmlFor="name" className="text-[13px] text-zinc-600">
            Full Name
          </label>
          <input
            id="name"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-12 w-full rounded-full border border-transparent bg-zinc-50 px-5 text-[13px] outline-none focus:border-[#b935f5] focus:bg-white"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-[13px] text-zinc-600">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full rounded-full border border-transparent bg-zinc-50 px-5 text-[13px] outline-none focus:border-[#b935f5] focus:bg-white"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-[13px] text-zinc-600">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 w-full rounded-full border border-transparent bg-zinc-50 px-5 text-[13px] outline-none focus:border-[#b935f5] focus:bg-white"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-[13px] text-zinc-600"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Enter your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="h-12 w-full rounded-full border border-transparent bg-zinc-50 px-5 text-[13px] outline-none focus:border-[#b935f5] focus:bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-full bg-[#b935f5] text-[13px] font-semibold text-white transition hover:bg-[#a729df] disabled:opacity-60"
        >
          {isLoading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-6 text-center text-[12px] text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#b935f5]">
          Login
        </Link>
      </p>
    </div>
  );
}