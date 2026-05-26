import { ShowtimeCreateDialog } from "@/features/showtimes/components/showtime-create-dialog";
import { ShowtimeTable } from "@/features/showtimes/components/showtime-table";

export default function AdminShowtimesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950">Showtimes</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Schedule movies by cinema, room, date, time, and ticket price.
          </p>
        </div>

        <ShowtimeCreateDialog />
      </div>

      <ShowtimeTable />
    </div>
  );
}