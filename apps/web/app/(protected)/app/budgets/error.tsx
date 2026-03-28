"use client";

export default function BudgetsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-rose-200 bg-rose-50 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">
          Budgets
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          Failed to load budget
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {error.message || "Unknown budget error."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Retry
        </button>
      </section>
    </div>
  );
}
