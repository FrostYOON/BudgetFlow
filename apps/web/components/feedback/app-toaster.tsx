"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={12}
      toastOptions={{
        duration: 2800,
        style: {
          background: "#ffffff",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          borderRadius: "20px",
          boxShadow: "0 18px 60px rgba(15, 23, 42, 0.12)",
          color: "#0f172a",
          padding: "12px 14px",
        },
        success: {
          iconTheme: {
            primary: "#10b981",
            secondary: "#f8fafc",
          },
        },
        error: {
          iconTheme: {
            primary: "#f43f5e",
            secondary: "#fff1f2",
          },
        },
      }}
    />
  );
}
