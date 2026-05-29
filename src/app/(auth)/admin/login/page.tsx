import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/features/admin/auth";
import { verifyRefreshToken } from "@/lib/security/token";

const adminRoles = ["ADMIN", "MANAGER", "STAFF"] as const;

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    try {
      const payload = await verifyRefreshToken(refreshToken);
      if (adminRoles.includes(payload.role as (typeof adminRoles)[number])) {
        redirect("/admin/dashboard");
      }
      redirect("/discovery");
    } catch {
      // Invalid/expired token: continue to login page.
    }
  }

  return (
    <main className="min-h-screen bg-zinc-200 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-4xl items-center justify-center">
        <section className="w-full max-w-[640px] rounded-lg bg-white p-8 shadow-[0_15px_35px_rgba(0,0,0,0.18)]">
          <AdminLoginForm />
        </section>
      </div>
    </main>
  );
}
