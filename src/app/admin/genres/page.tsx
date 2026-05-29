import { GenreCreateForm } from "@/features/admin/genres";
import { GenreTable } from "@/features/admin/genres";

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