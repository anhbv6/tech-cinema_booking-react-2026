// src/app/(auth)/register/page.tsx
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Offers ad-free viewing of high quality"
      description="Stream in cinema rooms and watch your favorite movies with high quality."
    >
      <RegisterForm />
    </AuthLayout>
  );
}