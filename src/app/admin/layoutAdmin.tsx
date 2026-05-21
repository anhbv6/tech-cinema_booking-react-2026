import Link from "next/link";

const adminNavItems = [
  { title: "Dashboard", href: "/admin/dashboard" },
  { title: "Movies", href: "/admin/movies" },
  { title: "Cinemas", href: "/admin/cinemas" },
  { title: "Rooms", href: "/admin/rooms" },
  { title: "Showtimes", href: "/admin/showtimes" },
  { title: "Bookings", href: "/admin/bookings" },
  { title: "Users", href: "/admin/users" },
  { title: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r bg-card px-4 py-6">
          <div className="mb-8">
            <h1 className="text-xl font-bold">Cinema Admin</h1>
            <p className="text-sm text-muted-foreground">Management</p>
          </div>

          <nav className="space-y-1">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <header className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          </header>

          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}