import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[#7e13b9] p-6">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-[1240px] items-center justify-center">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
