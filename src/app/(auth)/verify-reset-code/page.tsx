import { VerifyResetCodeForm } from "@/features/auth/components/verify-reset-code-form";

export default function VerifyResetCodePage() {
  return (
    <main className="min-h-screen bg-[#7e13b9] p-6">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-[1240px] items-center justify-center">
        <VerifyResetCodeForm />
      </div>
    </main>
  );
}
