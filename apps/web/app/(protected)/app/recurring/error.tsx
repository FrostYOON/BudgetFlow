"use client";

import Link from "next/link";

export default function RecurringError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-8">
      <section className="border-b border-slate-900/8 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">
          Recurring
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Failed to load automation ops
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          The recurring operations summary could not be loaded. Check the API
          connection and try again.
        </p>
      </section>

      <section className="rounded-[1.75rem] border border-rose-200 bg-rose-50 px-6 py-6">
        <p className="text-sm font-medium text-rose-900">
          {error.message || "Unknown recurring ops error."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Retry
          </button>
          <Link
            href="/app/dashboard"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
          >
            Go to dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
