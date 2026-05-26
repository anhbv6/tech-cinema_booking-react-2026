import { UserTable } from "@/features/users/components/user-table";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-950">Users</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage user accounts, roles, and account status.
        </p>
      </div>

      <UserTable />
    </div>
  );
}