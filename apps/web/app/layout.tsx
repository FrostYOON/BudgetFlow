import { Suspense } from "react";
import type { Metadata } from "next";
import { AppToaster } from "@/components/feedback/app-toaster";
import { UrlToastBridge } from "@/components/feedback/url-toast-bridge";
import "./globals.css";

const themeInitScript = `
  (() => {
    try {
      const storageKey = "budgetflow-theme";
      const root = document.documentElement;
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const stored = localStorage.getItem(storageKey);
      const theme =
        stored === "light" || stored === "dark" || stored === "system"
          ? stored
          : "system";
      const colorMode =
        theme === "system" ? (media.matches ? "dark" : "light") : theme;

      root.dataset.theme = theme;
      root.dataset.colorMode = colorMode;
    } catch (_error) {
      document.documentElement.dataset.theme = "system";
      document.documentElement.dataset.colorMode = "light";
    }
  })();
`;

export const metadata: Metadata = {
  title: "BudgetFlow",
  description: "Personal-first budgeting with optional shared spaces.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <AppToaster />
        <Suspense fallback={null}>
          <UrlToastBridge />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
