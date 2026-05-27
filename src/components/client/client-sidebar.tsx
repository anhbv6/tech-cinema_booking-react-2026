"use client";
import React, { useState } from 'react';
import { Compass, Star, Clock3, History, Download, Moon, Settings, Play, Telescope, CalendarCheck2, Heart, Newspaper, Ticket } from "lucide-react";

const menuItems = [
  { label: "Discovery", icon: Telescope, active: true },
  { label: "Top Rated", icon: Star },
  { label: "Schedule", icon: CalendarCheck2 },
];

const libraryItems = [
  { label: "Favorites", icon: Heart },
  { label: "News", icon: Newspaper },
  { label: "Promotions", icon: Ticket },

];

function NavItem({ item }) {
  const Icon = item.icon;

  return (
    <button
      className={`group flex w-full items-center gap-3 rounded-xl px-1 py-3 text-left cursor-pointer text-[13px] font-semibold transition ${
        item.active ? "text-red-600" : "text-slate-400 hover:text-slate-700"
      }`}
    >
      <span
        className={`grid h-5 w-5 place-items-center rounded-md transition ${
          item.active ? "" : "text-slate-300 group-hover:text-slate-500"
        }`}
      >
        <Icon size={15} strokeWidth={2.3} />
      </span>
      <span>{item.label}</span>
    </button>
  );
}

const ClientSidebar = () => {
    const [darkMode, setDarkMode] = useState(false);

    return (
        <div className="min-h-screen bg-white p-0">
            <aside className="flex min-h-screen w-64 flex-col bg-[#F9F9F9] px-5 py-7 text-slate-500 shadow-[inset_-1px_0_0_rgba(15,23,42,0.03)]">
                <div className='flex gap-2 items-center mb-12'>
                    <div className="w-12 h-8 bg-red-600 flex items-center justify-center">
                        <Star
                            fill="#facc15"
                            color="#facc15"
                            strokeWidth={1.5}
                            className="w-5 h-5"
                        />
                    </div>
                    <h1 className="text-[17px] font-extrabold tracking-tight text-slate-900">Tea</h1>
                </div>

                <nav className="space-y-10">
                <section>
                    <p className="mb-3 text-base font-bold uppercase tracking-[0.14em] text-slate-900">Menu</p>
                    <div className="space-y-1">
                    {menuItems.map((item) => (
                        <NavItem key={item.label} item={item} />
                    ))}
                    </div>
                </section>

                <section>
                    <p className="mb-3 text-base font-bold uppercase tracking-[0.14em] text-slate-900">Library</p>
                    <div className="space-y-1">
                    {libraryItems.map((item) => (
                        <NavItem key={item.label} item={item} />
                    ))}
                    </div>
                </section>
                </nav>

                <div className="mt-auto space-y-1">
                <div className="flex w-full items-center justify-between rounded-xl px-1 py-3 text-[13px] font-semibold text-slate-400">
                    <div className="flex items-center gap-3">
                    <Moon size={17} className="text-slate-300" />
                    <span>Dark Mode</span>
                    </div>

                    <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative h-5 w-9 rounded-full transition ${darkMode ? "bg-purple-500" : "bg-slate-200"}`}
                    aria-label="Toggle dark mode"
                    >
                    <span
                        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-slate-400 shadow-sm transition ${
                        darkMode ? "left-[18px] bg-white" : "left-0.5"
                        }`}
                    />
                    </button>
                </div>

                <button className="group flex w-full items-center gap-3 rounded-xl px-1 py-3 text-left text-[13px] font-semibold text-slate-400 transition hover:text-slate-700">
                    <Settings size={17} className="text-slate-300 group-hover:text-slate-500" />
                    <span>Setting</span>
                </button>
                </div>
            </aside>
        </div>
    )
}

export default ClientSidebar