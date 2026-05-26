import { CinemaCreateDialog } from "@/features/cinemas/components/cinema-create-dialog";
import { CinemaTable } from "@/features/cinemas/components/cinema-table";

export default function AdminCinemasPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950">Cinemas</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage cinema locations, addresses, and active status.
          </p>
        </div>

        <CinemaCreateDialog />
      </div>

      <CinemaTable />
    </div>
  );
}