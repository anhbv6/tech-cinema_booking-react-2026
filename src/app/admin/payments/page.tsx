import { PaymentTable } from "@/features/payments/components/payment-table";

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-950">Payments</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage payment transactions, methods, and payment status.
        </p>
      </div>

      <PaymentTable />
    </div>
  );
}