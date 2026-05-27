import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, ShieldCog } from "lucide-react";

import { adminNavItems } from "@/config/admin-navigation";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminUserCard } from "@/components/admin/admin-user-card";

function isActiveRoute(pathname: string, href: string) {
  if (href === "/admin/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="flex w-64 shrink-0 flex-col rounded-[1.5rem] bg-white px-5 py-6">
            <div className="mb-8">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1DE782]/10 text-[#1DE782]">
                    <ShieldCog className="h-5 w-5" />
                </div>

                <h1 className="text-lg font-bold leading-none text-zinc-950">
                    Admin
                </h1>
                </Link>
            </div>

            <div className="mb-6">
                <div className="flex h-10 items-center rounded-full border border-zinc-200 px-4 text-sm text-zinc-400 transition focus-within:border-[#1DE782]">
                Search
                </div>
            </div>

            <nav className="scroll-hiddenNav flex max-h-[520px] flex-col gap-2">
                {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(pathname, item.href);

                return (
                    <Link
                    key={item.href}
                    href={item.href}
                    className={[
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                        isActive
                        ? "bg-[#1DE782]/10 text-[#13A85F]"
                        : "text-zinc-600 hover:bg-[#1DE782]/10 hover:text-[#14B968]",
                    ].join(" ")}
                    >
                    <Icon
                        className={[
                        "h-4 w-4",
                        isActive ? "text-[#13A85F]" : "text-zinc-500",
                        ].join(" ")}
                    />
                    <span>{item.title}</span>
                    </Link>
                );
                })}
            </nav>

            <div className="mt-6 border-t border-zinc-100 pt-5">
                <AdminUserCard />

                <Link
                href="/admin/settings"
                className={[
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    isActiveRoute(pathname, "/admin/settings")
                    ? "bg-[#1DE782]/10 text-[#13A85F]"
                    : "text-zinc-600 hover:bg-[#1DE782]/10 hover:text-[#14B968]",
                ].join(" ")}
                >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
                </Link>

                <AdminLogoutButton />
            </div>
        </aside>
    );
}