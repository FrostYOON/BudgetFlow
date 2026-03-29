"use client";

import { AppErrorState } from "@/components/feedback/app-error-state";

export default function RecurringError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AppErrorState
      label="Recurring"
      title="Failed to load automation ops"
      message={error.message || "Unknown recurring ops error."}
      onRetry={reset}
      secondaryHref="/app/dashboard"
      secondaryLabel="Dashboard"
    />
  );
}
