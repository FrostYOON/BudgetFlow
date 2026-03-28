export default function BudgetsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-[1.75rem] bg-white" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-[1.5rem] bg-white"
          />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-[1.75rem] bg-white" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-[1.5rem] bg-white"
          />
        ))}
      </div>
    </div>
  );
}
