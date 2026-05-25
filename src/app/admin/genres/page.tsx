import { GenreCreateForm } from "@/features/genres/components/genre-create-form";
import { GenreTable } from "@/features/genres/components/genre-table";

export default function AdminGenresPage() {
  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <h1 className="text-2xl font-bold text-zinc-950">Genres</h1>
        <p className="mt-2 text-sm text-zinc-500">Manage film genres within the system.</p>
      </div>

      <GenreCreateForm />

      <GenreTable />
    </div>
  );
}