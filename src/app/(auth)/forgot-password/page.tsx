import { AuthLayout } from "@/features/shared/auth";
import { ForgotPasswordForm } from "@/features/client/auth";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
