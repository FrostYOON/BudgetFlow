import { Reveal, StaggerItem, StaggerReveal } from "@/components/motion/reveal";

function SkeletonBlock({
  className,
}: {
  className: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-[1.5rem] border border-slate-900/8 bg-white/90 ${className}`}
    />
  );
}

export function AppLoadingState({
  header = true,
  metricCount = 0,
  bodyHeights = [],
}: {
  bodyHeights?: string[];
  header?: boolean;
  metricCount?: number;
}) {
  return (
    <div className="space-y-6">
      {header ? (
        <Reveal delay={0.02}>
          <SkeletonBlock className="h-24 rounded-[1.75rem]" />
        </Reveal>
      ) : null}

      {metricCount > 0 ? (
        <StaggerReveal className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: metricCount }).map((_, index) => (
            <StaggerItem key={index}>
              <SkeletonBlock className="h-24" />
            </StaggerItem>
          ))}
        </StaggerReveal>
      ) : null}

      <div className="space-y-4">
        {bodyHeights.map((height, index) => (
          <Reveal key={`${height}-${index}`} delay={0.08 + index * 0.04}>
            <SkeletonBlock className={height} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
