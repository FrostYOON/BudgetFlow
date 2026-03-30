import { AppLoadingState } from "@/components/feedback/app-loading-state";

export default function SettlementsLoading() {
  return (
    <AppLoadingState
      header
      metricCount={4}
      bodyHeights={["h-72", "h-64", "h-72"]}
    />
  );
}
