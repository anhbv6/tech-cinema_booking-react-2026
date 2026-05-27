"use client";

import { create } from "zustand";

type AuthUser = {
  id: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "STAFF" | "CUSTOMER";
  name?: string | null;
  image?: string | null;
};

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  initialized: boolean;
  setCredentials: (payload: { accessToken: string; user: AuthUser | null }) => void;
  clearAuth: () => void;
  setInitialized: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  initialized: false,
  setCredentials: ({ accessToken, user }) => set({ accessToken, user }),
  clearAuth: () => set({ accessToken: null, user: null }),
  setInitialized: (value) => set({ initialized: value }),
}));
