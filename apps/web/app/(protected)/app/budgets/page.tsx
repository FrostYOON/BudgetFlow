export default function BudgetsPage() {
  return (
    <div className="space-y-8">
      <section className="border-b border-slate-900/8 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Budgets
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Monthly envelope and category allocation workspace.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Budget routes are protected and ready for monthly budget setup,
          allocation editing, and variance views.
        </p>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="border-t border-slate-900/8 pt-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Expected UI responsibilities
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>monthly total budget input</li>
            <li>category allocation editor</li>
            <li>allocated versus unallocated summary</li>
          </ul>
        </section>
        <section className="border-t border-slate-900/8 pt-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Existing backend support
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>upsert monthly budget</li>
            <li>upsert category budgets</li>
            <li>actual amount and progress calculations</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
