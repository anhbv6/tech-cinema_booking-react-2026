// src/app/(auth)/login/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { LoginForm } from "@/features/auth/components/login-form";
import { verifyRefreshToken } from "@/lib/security/token";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    try {
      const payload = await verifyRefreshToken(refreshToken);
      if (payload.role === "CUSTOMER") redirect("/discovery");
      redirect("/admin/dashboard");
    } catch {
      // Invalid/expired token: continue to login page.
    }
  }

  return (
    <AuthLayout>
      <LoginForm portal="client" fallbackUrl="/discovery" />
    </AuthLayout>
  );
}
