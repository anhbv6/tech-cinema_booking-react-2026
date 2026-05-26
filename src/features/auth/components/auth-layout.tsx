// src/features/auth/components/auth-layout.tsx
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  imageSrc?: string;
};

export function AuthLayout({
  children,
  title = "The biggest international and local film streaming",
  description = "Stream in cinema rooms and watch your favorite movies with high quality.",
  imageSrc = "/images/auth/auth-laptop.png",
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#8a00c4] p-4">
      <section className="mx-auto grid min-h-[calc(100vh-32px)] max-w-[1180px] overflow-hidden bg-white lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#bb3df4] to-[#9820df] px-12 py-14 text-white lg:block">
          <div className="relative z-10 max-w-[360px]">
            <h1 className="text-[28px] font-bold leading-[1.15]">{title}</h1>
            <p className="mt-4 text-[13px] leading-6 text-white/75">
              {description}
            </p>

            <div className="mt-6 flex items-center gap-1.5">
              <span className="h-1.5 w-6 rounded-full bg-white" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
            </div>
          </div>

          <Image
            src={imageSrc}
            alt="CinemaMax preview"
            width={720}
            height={520}
            priority
            className="absolute -bottom-8 -left-8 max-w-[680px]"
          />
        </div>

        <div className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[410px]">
            <div className="mb-12 text-center">
              <Link href="/" className="text-[13px] font-bold text-zinc-950">
                CineMax
              </Link>
            </div>

            {children}
          </div>
        </div>
      </section>
    </main>
  );
}