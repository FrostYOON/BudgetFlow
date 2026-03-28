export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <section className="border-b border-slate-900/8 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Household overview
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          This shell is ready to host the real dashboard API integration. The
          layout, protected navigation, and workspace context are now in place.
        </p>
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">Budget status</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">61%</p>
              <p className="mt-1 text-sm text-slate-500">
                of monthly plan used
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Shared spend</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                CAD 1,960
              </p>
              <p className="mt-1 text-sm text-slate-500">
                synced to recurring execution
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Open insights</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">3</p>
              <p className="mt-1 text-sm text-slate-500">waiting for action</p>
            </div>
          </div>

          <div className="grid gap-6 border-t border-slate-900/8 pt-8 sm:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                This route is already useful
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The protected area now provides a stable place for dashboard
                data, workspace switching, and the next web task sequence.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Next integration target
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Issue #2 can plug directly into this route using the existing
                dashboard and insights APIs.
              </p>
            </div>
          </div>
        </div>

        <aside className="space-y-6 border-t border-slate-900/8 pt-8 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Recent activity
            </p>
            <ul className="mt-4 space-y-4 text-sm text-slate-600">
              <li>
                Recurring execution ran successfully for two subscriptions.
              </li>
              <li>Food budget is approaching the alert threshold.</li>
              <li>One workspace invite is still pending acceptance.</li>
            </ul>
          </div>
          <div className="border-t border-slate-900/8 pt-6">
            <p className="text-sm font-medium text-slate-500">Ready modules</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>Auth and refresh session flow</li>
              <li>Workspace, invites, and members</li>
              <li>Transactions, budgets, reports, and insights</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
