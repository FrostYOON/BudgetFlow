"use client";

import { AppErrorState } from "@/components/feedback/app-error-state";

export default function BudgetsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AppErrorState
      label="Budgets"
      title="Failed to load budget"
      message={error.message || "Unknown budget error."}
      onRetry={reset}
    />
  );
}
