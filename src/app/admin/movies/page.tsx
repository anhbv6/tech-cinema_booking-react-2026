import { MovieImportTmdbDialog } from "@/features/admin/movies";
import { MovieCreateDialog } from "@/features/admin/movies";
import { MovieTable } from "@/features/admin/movies";

export default function AdminMoviesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950">Movies</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage movies manually or import movie data from TMDB.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <MovieImportTmdbDialog />
          <MovieCreateDialog />
        </div>
      </div>

      <MovieTable />
    </div>
  );
}