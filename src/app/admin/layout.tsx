"use client";

import "./style.css";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F6F6F3] p-4">
      <div className="flex min-h-[calc(100vh-2rem)] overflow-hidden rounded-[2rem]">
        <AdminSidebar />

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-auto px-6">
            <div className="min-h-full rounded-[1.5rem] bg-white p-6 shadow-sm">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
