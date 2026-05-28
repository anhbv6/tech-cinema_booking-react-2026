"use client";

import { LogOut } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";

export function AdminLogoutButton() {
  return (
    <LogoutButton
      redirectTo="/admin/login"
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
    >
      <LogOut className="h-4 w-4" />
      <span>Log out</span>
    </LogoutButton>
  );
}