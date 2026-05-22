import { GenreCreateForm } from "@/features/genres/components/genre-create-form";
import { GenreTable } from "@/features/genres/components/genre-table";

export default function AdminGenresPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950">Genres</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Quản lý thể loại phim trong hệ thống.
        </p>
      </div>

      <GenreCreateForm />

      <GenreTable />
    </div>
  );
}