"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-store";

export function AdminLogoutButton() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } finally {
      clearAuth();
      toast.success("ау dang xu?t.");
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
    >
      <LogOut className="h-4 w-4" />
      <span>Log out</span>
    </button>
  );
}
