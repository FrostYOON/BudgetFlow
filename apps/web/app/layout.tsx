import { Suspense } from "react";
import type { Metadata } from "next";
import { AppToaster } from "@/components/feedback/app-toaster";
import { UrlToastBridge } from "@/components/feedback/url-toast-bridge";
import "./globals.css";

export const metadata: Metadata = {
  title: "BudgetFlow",
  description: "Shared household budgeting for couples and families.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppToaster />
        <Suspense fallback={null}>
          <UrlToastBridge />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
