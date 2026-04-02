"use client";

import { AppErrorState } from "@/components/feedback/app-error-state";

export default function SettlementsError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <AppErrorState
      label="Settlements"
      title="Settlement data is unavailable"
      message="Refresh the view or go back to the dashboard."
      onRetry={reset}
      secondaryHref="/app/dashboard"
      secondaryLabel="Dashboard"
    />
  );
}
