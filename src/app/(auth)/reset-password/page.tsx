import { AuthLayout } from "@/features/shared/auth";
import { ResetPasswordForm } from "@/features/client/auth";

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  );
}
