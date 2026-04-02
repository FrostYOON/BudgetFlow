"use client";

import { AppButton } from "@/components/ui/app-button";

export function PrintReportButton({ href }: { href: string }) {
  return (
    <AppButton
      type="button"
      tone="success"
      size="sm"
      onClick={() => {
        const nextWindow = window.open(href, "_blank", "noopener,noreferrer");

        if (!nextWindow) {
          window.location.assign(href);
          return;
        }

        nextWindow.focus();
      }}
    >
      Print / PDF
    </AppButton>
  );
}
