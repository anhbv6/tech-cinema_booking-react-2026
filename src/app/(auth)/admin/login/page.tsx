import { AuthLayout } from "@/features/auth/components/auth-layout";
import { LoginForm } from "@/features/auth/components/login-form";

export default function AdminLoginPage() {
  return (
    <AuthLayout>
      <LoginForm portal="admin" />
    </AuthLayout>
  );
}
