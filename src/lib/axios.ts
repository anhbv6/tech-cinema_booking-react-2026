import axios from "axios";

import { useAuthStore } from "@/store/auth-store";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

let isRefreshing = false;
let queue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

function flushQueue(error: unknown, token: string | null) {
  queue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  queue = [];
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token && config.headers && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as {
      _retry?: boolean;
      headers?: Record<string, string>;
      url?: string;
    };

    if (!error.response || error.response.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    if (
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/login")
    ) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            if (!token || !originalRequest.headers) {
              reject(error);
              return;
            }

            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await axios.post(
        "/api/auth/refresh",
        {},
        { withCredentials: true }
      );

      const { accessToken, user } = refreshResponse.data;

      useAuthStore.getState().setCredentials({ accessToken, user });

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      flushQueue(null, accessToken);
      return api(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      useAuthStore.getState().clearAuth();

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
