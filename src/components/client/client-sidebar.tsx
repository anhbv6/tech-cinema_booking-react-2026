"use client";

import React, { useState } from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  ClipboardClock,
  Heart,
  List,
  Moon,
  Newspaper,
  Settings,
  Star,
  Telescope,
  Ticket,
} from "lucide-react";

const menuItems = [
  {
    label: "Discovery",
    icon: Telescope,
    href: "/discovery",
  },
  {
    label: "Top Rated",
    icon: Star,
    href: "/top-rated",
  },
  {
    label: "Genres",
    icon: List,
    href: "/genres",
  },
  {
    label: "News",
    icon: Newspaper,
    href: "/news",
  },
];

const libraryItems = [
  {
    label: "History buy",
    icon: ClipboardClock,
    href: "/history",
  },
  {
    label: "Promotions",
    icon: Ticket,
    href: "/promotions",
  },
  {
    label: "Favorites",
    icon: Heart,
    href: "/favorites",
  },
];

function NavItem({ item }: any) {
  const pathname = usePathname();

  const Icon = item.icon;

  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold transition ${
        isActive
          ? "bg-red-50 text-red-600"
          : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      <span
        className={`grid h-5 w-5 place-items-center rounded-md transition ${
          isActive
            ? "text-red-500"
            : "text-slate-300 group-hover:text-slate-500"
        }`}
      >
        <Icon size={15} strokeWidth={2.3} />
      </span>

      <span>{item.label}</span>
    </Link>
  );
}

const ClientSidebar = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="bg-white">
      <aside className="flex h-full w-64 flex-col bg-[#F9F9F9] px-5 py-7 text-slate-500 shadow-[inset_-1px_0_0_rgba(15,23,42,0.03)]">
        <nav className="space-y-10">
          {/* MENU */}
          <section>
            <p className="mb-3 text-base font-bold uppercase tracking-[0.14em] text-slate-900">
              Menu
            </p>

            <div className="space-y-1">
              {menuItems.map((item) => (
                <NavItem key={item.label} item={item} />
              ))}
            </div>
          </section>

          {/* LIBRARY */}
          <section>
            <p className="mb-3 text-base font-bold uppercase tracking-[0.14em] text-slate-900">
              Library
            </p>

            <div className="space-y-1">
              {libraryItems.map((item) => (
                <NavItem key={item.label} item={item} />
              ))}
            </div>
          </section>
        </nav>

        {/* BOTTOM */}
        <div className="mt-auto space-y-1">
          {/* DARK MODE */}
          <div className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-[13px] font-semibold text-slate-400">
            <div className="flex items-center gap-3">
              <Moon size={17} className="text-slate-300" />

              <span>Dark Mode</span>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative h-5 w-9 rounded-full transition ${
                darkMode ? "bg-purple-500" : "bg-slate-200"
              }`}
              aria-label="Toggle dark mode"
            >
              <span
                className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full shadow-sm transition ${
                  darkMode
                    ? "left-[18px] bg-white"
                    : "left-0.5 bg-slate-400"
                }`}
              />
            </button>
          </div>

          {/* SETTINGS */}
          <Link
            href="/settings"
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <Settings
              size={17}
              className="text-slate-300 group-hover:text-slate-500"
            />

            <span>Setting</span>
          </Link>
        </div>
      </aside>
    </div>
  );
};

export default ClientSidebar;
