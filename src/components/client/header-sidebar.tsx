"use client";

import { Bell, ChevronDown, Clock3, Compass, Download, History, Moon, Play, Search, Settings, Star } from 'lucide-react';
import React, { useState } from 'react'

const menuItems = [
    { label: "Discovery", icon: Compass, active: true },
    { label: "Top Rated", icon: Star },
    { label: "Coming Soon", icon: Clock3 },
]

const libraryItems = [
  { label: "Recent Played", icon: History },
  { label: "Download", icon: Download },
];

function NavItem({ item }) {
  const Icon = item.icon;

  return (
    <button
      className={`group flex w-full items-center gap-3 rounded-xl px-1 py-3 text-left text-[13px] font-semibold transition ${
        item.active ? "text-purple-500" : "text-slate-400 hover:text-slate-700"
      }`}
    >
      <span
        className={`grid h-5 w-5 place-items-center rounded-md transition ${
          item.active ? "bg-purple-500 text-white shadow-sm" : "text-slate-300 group-hover:text-slate-500"
        }`}
      >
        <Icon size={15} strokeWidth={2.3} />
      </span>
      <span>{item.label}</span>
    </button>
  );
}

function Header() {
  return (
    <header className="flex h-16 flex-1 items-center justify-between border-b border-slate-100 bg-white px-12">
      <nav className="flex h-full items-center gap-12 text-[14px] font-bold text-slate-800">
        <a className="flex h-full items-center border-b-2 border-transparent px-1" href="#">Movies</a>
        <a className="flex h-full items-center border-b-2 border-transparent px-1" href="#">Series</a>
        <a className="flex h-full items-center border-b-2 border-transparent px-1" href="#">Animation</a>
        <a className="flex h-full items-center border-b-2 border-transparent px-1" href="#">Genres</a>
      </nav>

      <div className="flex items-center gap-8">
        <button className="grid h-10 w-10 place-items-center rounded-full text-slate-900 transition hover:bg-slate-50" aria-label="Search">
          <Search size={24} strokeWidth={2.2} />
        </button>

        <button className="rounded-full bg-purple-500 px-7 py-3 text-[14px] font-extrabold text-white shadow-[0_8px_18px_rgba(168,85,247,0.25)] transition hover:bg-purple-600">
          Subscribe
        </button>

        <button className="relative grid h-10 w-10 place-items-center rounded-full text-slate-700 transition hover:bg-slate-50" aria-label="Notifications">
          <Bell size={23} strokeWidth={2.1} />
          <span className="absolute right-0.5 top-1 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">3</span>
        </button>

        <button className="flex items-center gap-3 rounded-full text-slate-600 transition hover:text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-[12px] font-bold text-slate-400 shadow-inner">U</span>
          <ChevronDown size={17} strokeWidth={2.4} />
        </button>
      </div>
    </header>
  );
}

const HeaderSidebar = () => {
    const [darkMode, setDarkMode] = useState(false);
    return (
        <div className="flex min-h-screen bg-white p-0">
        <aside className="flex min-h-screen w-[225px] flex-col bg-[#fbfbfc] px-7 py-7 text-slate-500 shadow-[inset_-1px_0_0_rgba(15,23,42,0.03)]">
            <div className="mb-12 flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-purple-500 text-white shadow-sm">
                <Play size={14} fill="currentColor" />
            </div>
            <h1 className="text-[17px] font-extrabold tracking-tight text-slate-900">CineMax</h1>
            </div>

            <nav className="space-y-10">
            <section>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">Menu</p>
                <div className="space-y-1">
                {menuItems.map((item) => (
                    <NavItem key={item.label} item={item} />
                ))}
                </div>
            </section>

            <section>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">Library</p>
                <div className="space-y-1">
                {libraryItems.map((item) => (
                    <NavItem key={item.label} item={item} />
                ))}
                </div>
            </section>
            </nav>

            <div className="mt-5 space-y-1">
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

        <main className="min-h-screen flex-1 bg-white">
            <Header />
        </main>
        </div>
    )
}

export default HeaderSidebar