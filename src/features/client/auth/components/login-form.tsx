"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";
import { loginSchema } from "@/features/shared/auth/schemas/auth.schema";
import { useAuthStore } from "@/store/auth-store";
import { SocialLogin } from "./social-login";

type LoginFormProps = {
  portal?: "client" | "admin";
  fallbackUrl: string;
  forgotPasswordHref?: string | null;
  showRegister?: boolean;
};

export function LoginForm({
  portal = "client",
  fallbackUrl,
  forgotPasswordHref = "/forgot-password",
  showRegister = true,
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl =
    rawCallback && rawCallback.startsWith("/") ? rawCallback : fallbackUrl;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = loginSchema.safeParse({
      email,
      password,
      remember,
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
        remember: Boolean(parsed.data.remember),
        portal,
      });

      const { accessToken, user } = response.data;
      setCredentials({ accessToken, user });

      toast.success("Login successfully");
      router.push(callbackUrl || fallbackUrl);
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
    <div>
      <div className="mb-7 text-center">
        <h1 className="text-[28px] font-bold leading-tight text-zinc-950">
          Hey there,
          <br />
          welcome back
        </h1>
      </div>

      <SocialLogin />

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-100" />
        <span className="text-[12px] text-zinc-400">Or login with</span>
        <div className="h-px flex-1 bg-zinc-100" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-[18px]">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-[13px] font-normal text-zinc-600"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="h-12 w-full rounded-full border border-transparent bg-zinc-50 px-5 text-[13px] text-zinc-700 outline-none transition placeholder:text-zinc-300 focus:border-[#b935f5] focus:bg-white"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-[13px] font-normal text-zinc-600"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="h-12 w-full rounded-full border border-transparent bg-zinc-50 px-5 text-[13px] text-zinc-700 outline-none transition placeholder:text-zinc-300 focus:border-[#b935f5] focus:bg-white"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-[12px] text-zinc-500">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 accent-[#b935f5]"
            />
            Remember me
          </label>

          {forgotPasswordHref ? (
            <Link
              href={forgotPasswordHref}
              className="text-[12px] font-medium text-[#b935f5] hover:underline"
            >
              Forgot Password
            </Link>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-full bg-[#b935f5] text-[13px] font-semibold text-white transition hover:bg-[#a729df] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      {showRegister ? (
        <p className="mt-6 text-center text-[12px] text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-[#b935f5]">
            Register
          </Link>
        </p>
      ) : null}
    </div>
  );
}
