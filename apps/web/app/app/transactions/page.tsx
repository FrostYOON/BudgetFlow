export default function TransactionsPage() {
  return (
    <div className="space-y-8">
      <section className="border-b border-slate-900/8 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Transactions
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Shared and personal transaction surfaces will live here.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          The shell is ready for list, detail, and create flows. The next API
          work for transaction updates can attach directly to this route.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border-t border-slate-900/8 pt-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Planned sections
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Monthly filter and workspace scope</li>
            <li>Recent transaction list and cursor pagination</li>
            <li>Create and update transaction entry points</li>
          </ul>
        </div>
        <div className="border-t border-slate-900/8 pt-6">
          <h2 className="text-lg font-semibold text-slate-950">
            API support ready
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Create transaction</li>
            <li>List transactions</li>
            <li>Get transaction detail</li>
            <li>Soft delete transaction</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
