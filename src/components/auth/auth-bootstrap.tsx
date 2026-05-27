"use client";

import { useEffect } from "react";
import axios from "axios";

import { useAuthStore } from "@/store/auth-store";

export function AuthBootstrap() {
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
      } finally {
        if (mounted) setInitialized(true);
      }
    }

    void init();

    return () => {
      mounted = false;
    };
  }, [clearAuth, setCredentials, setInitialized]);

  return null;
}
