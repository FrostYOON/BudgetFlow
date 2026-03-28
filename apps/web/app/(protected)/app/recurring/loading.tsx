export default function RecurringLoading() {
  return (
    <div className="space-y-8">
      <section className="border-b border-slate-900/8 pb-8">
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-10 w-96 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-4 w-[32rem] animate-pulse rounded-full bg-slate-200" />
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-[1.75rem] border border-slate-900/8 bg-white"
          />
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-8">
          <div className="h-72 animate-pulse rounded-[1.75rem] border border-slate-900/8 bg-white" />
          <div className="h-72 animate-pulse rounded-[1.75rem] border border-slate-900/8 bg-white" />
        </div>
        <div className="h-[38rem] animate-pulse rounded-[1.75rem] border border-slate-900/8 bg-white" />
      </section>
    </div>
  );
}
