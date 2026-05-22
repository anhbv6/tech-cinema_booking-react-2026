import Link from "next/link";
import "./style.css";
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Film,
  LayoutDashboard,
  MapPin,
  Settings,
  ShieldCog,
  Ticket,
  Users,
  DoorOpen,
  Gift,
  LayoutList,
  LogOut,
} from "lucide-react";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminUserCard } from "@/components/admin/admin-user-card";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Movies",
    href: "/admin/movies",
    icon: Film,
  },
  {
    title: "Cinemas",
    href: "/admin/cinemas",
    icon: MapPin,
  },
  {
    title: "Rooms",
    href: "/admin/rooms",
    icon: DoorOpen,
  },
  {
    title: "Showtimes",
    href: "/admin/showtimes",
    icon: CalendarDays,
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: Ticket,
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Promotions",
    href: "/admin/promotions",
    icon: Gift,
  },
  {
    title: "Genres",
    href: "/admin/genres",
    icon: LayoutList,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },
];

const adminRoles = ["ADMIN", "MANAGER", "STAFF"];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/admin/login?callbackUrl=/admin/dashboard");
  }

  if (!adminRoles.includes(String(session.user.role || ""))) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#F6F6F3] p-4">
      <div className="flex min-h-[calc(100vh-2rem)] overflow-hidden rounded-[2rem]">
        <AdminSidebar />

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-auto px-6 pb-6">
            <div className="min-h-full rounded-[1.5rem] bg-white p-6 shadow-sm">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}