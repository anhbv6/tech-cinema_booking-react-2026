"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { SocialLogin } from "./social-login";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl = rawCallback && rawCallback.startsWith("/") ? rawCallback : "/";

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

      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast.error("Email or password is incorrect");
        return;
      }

      toast.success("Login successfully");
      router.push(result?.url || callbackUrl);
      router.refresh();
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

      <SocialLogin callbackUrl={callbackUrl} />

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

          <Link
            href="/forgot-password"
            className="text-[12px] font-medium text-[#b935f5] hover:underline"
          >
            Forgot Password
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-full bg-[#b935f5] text-[13px] font-semibold text-white transition hover:bg-[#a729df] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-[12px] text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-[#b935f5]">
          Register
        </Link>
      </p>
    </div>
  );
}
