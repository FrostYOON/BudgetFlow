"use client";

import { useEffect, useRef } from "react";
import { AppButton, AppButtonLink } from "@/components/ui/app-button";

export function PrintReportControls({ backHref }: { backHref: string }) {
  const didPrintRef = useRef(false);

  useEffect(() => {
    if (didPrintRef.current) {
      return;
    }

    didPrintRef.current = true;

    const timer = window.setTimeout(() => {
      window.print();
    }, 75);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      <AppButtonLink href={backHref} size="sm" tone="secondary">
        Back to report
      </AppButtonLink>
      <AppButton
        type="button"
        size="sm"
        tone="success"
        onClick={() => window.print()}
      >
        Print / PDF
      </AppButton>
    </div>
  );
}
