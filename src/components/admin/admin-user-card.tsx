"use client";

import { useSession } from "next-auth/react";

function getInitial(name?: string | null, email?: string | null) {
  const value = name || email || "A";
  return value.charAt(0).toUpperCase();
}

function formatRole(role?: string | null) {
    if (!role) return "User";

    return role
        .toLowerCase()
        .split("_")
        .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
        .join(" ");
    }

    export function AdminUserCard() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
        <div className="mb-4 flex items-center gap-3 rounded-2xl py-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-100" />
            <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-zinc-100" />
            <div className="h-3 w-16 animate-pulse rounded bg-zinc-100" />
            </div>
        </div>
        );
    }

    const user = session?.user;
    const initial = getInitial(user?.name, user?.email);

    return (
        <div className="mb-4 flex items-center gap-3 rounded-2xl py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1DE782]/10 text-sm font-semibold text-[#14B968]">
                {initial}
            </div>

            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-950">
                {user?.name || "Admin User"}
                </p>
                <p className="truncate text-xs text-zinc-500">
                {formatRole(user?.role)}
                </p>
            </div>
        </div>
    );
}