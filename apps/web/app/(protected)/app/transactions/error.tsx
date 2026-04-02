"use client";

import { AppErrorState } from "@/components/feedback/app-error-state";

export default function TransactionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AppErrorState
      label="Transactions"
      title="Failed to load transactions"
      message={error.message || "Unknown transactions error."}
      onRetry={reset}
    />
  );
}
