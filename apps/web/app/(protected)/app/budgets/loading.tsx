import { AppLoadingState } from "@/components/feedback/app-loading-state";

export default function BudgetsLoading() {
  return <AppLoadingState metricCount={4} bodyHeights={["h-40 rounded-[1.75rem]", "h-[34rem] rounded-[1.75rem]"]} />;
}
