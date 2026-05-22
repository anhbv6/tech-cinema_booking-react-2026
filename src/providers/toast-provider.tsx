"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "14px",
          background: "#ffffff",
          color: "#18181b",
          border: "1px solid #e4e4e7",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        },
        success: {
          iconTheme: {
            primary: "#1DE782",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}