import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Film,
  Gift,
  LayoutDashboard,
  LayoutList,
  MapPin,
  Ticket,
  Users,
  DoorOpen,
} from "lucide-react";

export const adminNavItems = [
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