import { ReportDashboard } from "@/features/admin/reports";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-950">Reports</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Track revenue, bookings, payments, movie performance, and cinema
          occupancy.
        </p>
      </div>

      <ReportDashboard />
    </div>
  );
}