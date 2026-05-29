import { AuthLayout } from "@/features/shared/auth";
import { VerifyResetCodeForm } from "@/features/client/auth";

export default function VerifyResetCodePage() {
  return (
    <AuthLayout>
      <VerifyResetCodeForm />
    </AuthLayout>
  );
}
