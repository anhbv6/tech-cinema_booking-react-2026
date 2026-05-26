import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-950">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Overview of revenue, bookings, payments, and recent cinema activity.
        </p>
      </div>

      <DashboardOverview />
    </div>
  );
}