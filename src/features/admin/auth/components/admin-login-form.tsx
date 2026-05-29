"use client";

import { Eye } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import toast from "react-hot-toast";

import { loginSchema } from "@/features/shared/auth/schemas/auth.schema";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-store";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const rawCallback = searchParams.get("callbackUrl");
  const fallbackUrl = "/admin/dashboard";
  const callbackUrl =
    rawCallback && rawCallback.startsWith("/") ? rawCallback : fallbackUrl;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = loginSchema.safeParse({
      email,
      password,
      remember: false,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid login data");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("/auth/login", {
        email: parsed.data.email,
        password: parsed.data.password,
        remember: false,
        portal: "admin",
      });

      const { accessToken, user } = response.data;
      setCredentials({ accessToken, user });
      toast.success("Login successfully");
      router.push(callbackUrl);
      router.refresh();
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data?.message
          ? (error as { response?: { data?: { message?: string } } }).response!.data!.message!
          : "Email or password is incorrect";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Admin Login</h1>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm text-zinc-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="admin@gmail.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm text-zinc-700">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 pr-10 text-sm outline-none focus:border-zinc-500"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <Eye className="h-4 w-4" />
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 h-11 w-full rounded-md bg-emerald-500 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Logging in..." : "Login now"}
      </button>
    </form>
  );
}
