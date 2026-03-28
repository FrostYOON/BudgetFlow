export default function RecurringPage() {
  return (
    <div className="space-y-8">
      <section className="border-b border-slate-900/8 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Recurring
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Automation control room for fixed household spending.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          This route is intended for recurring transaction setup, execution
          history, and operational status.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="border-t border-slate-900/8 pt-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Planned interactions
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>recurring transaction CRUD</li>
            <li>manual monthly execution reruns</li>
            <li>recent run diagnostics and failure review</li>
          </ul>
        </section>

        <aside className="border-t border-slate-900/8 pt-6 lg:border-l lg:pl-8 lg:pt-0">
          <p className="text-sm font-medium text-slate-500">
            Already available
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>scheduler-backed recurring execution</li>
            <li>execution run observability</li>
            <li>ops summary API for admin UI</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
