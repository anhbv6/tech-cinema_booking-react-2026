"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export function VerifyResetCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [digits, setDigits] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);

  const code = useMemo(() => digits.join(""), [digits]);

  function setDigit(index: number, value: string) {
    if (!/^[0-9]?$/.test(value)) return;

    const next = [...digits];
    next[index] = value;
    setDigits(next);
  }

  async function handleVerify() {
    if (!email) {
      toast.error("Email is missing");
      return;
    }

    if (code.length !== 4) {
      toast.error("Please enter 4-digit code");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Invalid code");
        return;
      }

      toast.success("Code verified");
      router.push(`/reset-password?email=${encodeURIComponent(email)}&code=${code}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[420px] bg-zinc-100 px-12 py-16">
      <div className="mb-8 text-center">
        <p className="text-[11px] font-semibold text-zinc-900">CineMax</p>
      </div>

      <h1 className="text-center text-[26px] font-bold text-zinc-900">Verifying Your Account</h1>
      <p className="mt-1 text-center text-xs text-zinc-500">
        Enter 4 digit code sent to your email <span className="font-semibold">{email || "(missing)"}</span>
      </p>

      <div className="mt-8 flex items-center justify-center gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            value={digit}
            onChange={(event) => setDigit(index, event.target.value)}
            className="h-10 w-10 rounded-full border border-zinc-300 bg-white text-center text-sm font-semibold outline-none focus:border-[#af38e8]"
            maxLength={1}
            inputMode="numeric"
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleVerify}
        disabled={isLoading}
        className="mt-6 h-10 w-full rounded-full bg-[#af38e8] text-xs font-semibold text-white transition hover:bg-[#9a2fd1] disabled:opacity-60"
      >
        {isLoading ? "Checking..." : "Next"}
      </button>

      <p className="mt-4 text-center text-xs text-zinc-500">
        Wrong email?{" "}
        <Link className="font-semibold text-[#af38e8]" href="/forgot-password">
          Resend
        </Link>
      </p>
    </div>
  );
}
