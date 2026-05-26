"use client";

import { signIn } from "next-auth/react";

type SocialLoginProps = {
  callbackUrl?: string;
};

export function SocialLogin({ callbackUrl = "/" }: SocialLoginProps) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="flex h-11 w-full items-center justify-center rounded-full bg-zinc-50 text-[13px] font-medium text-zinc-700 transition hover:bg-zinc-100"
      >
        <span className="mr-2 text-[15px] font-bold text-red-500">G</span>
        Login with Google
      </button>

      <button
        type="button"
        disabled
        className="flex h-11 w-full items-center justify-center rounded-full bg-zinc-50 text-[13px] font-medium text-zinc-400"
      >
        <span className="mr-2 text-[15px] font-bold text-blue-400">f</span>
        Facebook (coming soon)
      </button>
    </div>
  );
}
