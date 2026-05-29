import { BookingTable } from "@/features/admin/bookings";

export default function AdminBookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-950">Bookings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage ticket bookings, customers, seats, and booking status.
        </p>
      </div>

      <BookingTable />
    </div>
  );
}