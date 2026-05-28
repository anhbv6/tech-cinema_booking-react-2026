"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-store";

type LogoutButtonProps = {
  redirectTo?: string;
  className?: string;
  children: ReactNode;
};

export function LogoutButton({
  redirectTo = "/login",
  className,
  children,
}: LogoutButtonProps) {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } finally {
      clearAuth();
      toast.success("Dang xuat thanh cong.");
      router.push(redirectTo);
      router.refresh();
    }
  }

  return (
    <button type="button" onClick={handleLogout} className={className}>
      {children}
    </button>
  );
}
