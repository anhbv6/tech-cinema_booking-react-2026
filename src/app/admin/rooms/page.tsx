import { RoomCreateDialog } from "@/features/admin/rooms";
import { RoomTable } from "@/features/admin/rooms";

export default function AdminRoomsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950">Rooms</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage screening rooms for each cinema location.
          </p>
        </div>

        <RoomCreateDialog />
      </div>

      <RoomTable />
    </div>
  );
}