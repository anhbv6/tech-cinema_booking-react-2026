"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

export function AdminLogoutButton() {
  async function handleLogout() {
    toast.success("Đã đăng xuất.");

    await signOut({
      callbackUrl: "/admin/login",
    });
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