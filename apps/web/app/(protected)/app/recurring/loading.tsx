import { AppLoadingState } from "@/components/feedback/app-loading-state";

export default function RecurringLoading() {
  return (
    <AppLoadingState
      metricCount={4}
      bodyHeights={[
        "h-72 rounded-[1.75rem]",
        "h-[38rem] rounded-[1.75rem]",
        "h-72 rounded-[1.75rem]",
      ]}
    />
  );
}
