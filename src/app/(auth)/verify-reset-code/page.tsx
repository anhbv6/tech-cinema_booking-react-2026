import { AuthLayout } from "@/features/auth/components/auth-layout";
import { VerifyResetCodeForm } from "@/features/auth/components/verify-reset-code-form";

export default function VerifyResetCodePage() {
  return (
    <AuthLayout>
      <VerifyResetCodeForm />
    </AuthLayout>
  );
}
