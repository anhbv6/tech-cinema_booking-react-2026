"use client";

import { useEffect } from "react";
import axios from "axios";
import { usePathname } from "next/navigation";

import { useAuthStore } from "@/store/auth-store";

function isProtectedClientPath(pathname: string) {
  return pathname === "/discovery" || pathname.startsWith("/discovery/") || pathname === "/about" || pathname.startsWith("/about/");
}

export function AuthBootstrap() {
  const pathname = usePathname();
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const response = await axios.post(
          "/api/auth/refresh",
          {},
          { withCredentials: true }
        );

        if (!mounted) return;

        setCredentials({
          accessToken: response.data.accessToken,
          user: response.data.user,
        });
      } catch {
        if (!mounted) return;
        clearAuth();
        if (typeof window !== "undefined" && isProtectedClientPath(pathname)) {
          window.location.href = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
        }
      } finally {
        if (mounted) setInitialized(true);
      }
    }

    void init();

    return () => {
      mounted = false;
    };
  }, [clearAuth, pathname, setCredentials, setInitialized]);

  return null;
}
