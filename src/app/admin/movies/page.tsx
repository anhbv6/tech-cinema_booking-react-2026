import { MovieImportTmdbDialog } from "@/features/movies/components/movie-import-tmdb-dialog";
import { MovieCreateDialog } from "@/features/movies/components/movie-create-dialog";
import { MovieTable } from "@/features/movies/components/movie-table";

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