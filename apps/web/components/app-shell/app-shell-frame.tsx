import Link from "next/link";
import type { AppSession } from "@/lib/auth/session";
import { AppBottomNav } from "@/components/app-shell/app-bottom-nav";
import { AppSidebarNav } from "@/components/app-shell/app-sidebar-nav";
import { WorkspaceSwitcher } from "@/components/app-shell/workspace-switcher";

interface AppShellFrameProps {
  children: React.ReactNode;
  session: AppSession;
}

export function AppShellFrame({ children, session }: AppShellFrameProps) {
  return (
    <div className="min-h-screen bg-[#eef2ef] text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-0 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden border-b border-slate-900/8 bg-white/70 px-6 py-8 backdrop-blur xl:block xl:border-r xl:border-b-0 xl:px-8">
          <div className="flex items-end justify-between gap-4 border-b border-slate-900/8 pb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                BudgetFlow
              </p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Shared household budget
              </h1>
            </div>
            <form action="/auth/sign-out" method="post">
              <input type="hidden" name="redirectTo" value="/sign-in" />
              <button
                type="submit"
                className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-950 hover:text-slate-950"
              >
                Sign out
              </button>
            </form>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-slate-500">Signed in as</p>
            <p className="mt-2 text-base font-semibold text-slate-950">
              {session.user.name}
            </p>
            <p className="text-sm text-slate-500">{session.user.email}</p>
          </div>

          <div className="mt-8">
            <AppSidebarNav />
          </div>

          <div className="mt-8">
            <WorkspaceSwitcher
              currentWorkspace={session.currentWorkspace}
              workspaces={session.workspaces}
            />
          </div>
        </aside>

        <div className="flex min-h-screen flex-col pb-20 xl:pb-0">
          <header className="border-b border-slate-900/8 bg-[#eef2ef]/90 px-4 py-4 backdrop-blur sm:px-6 xl:px-10 xl:py-5">
            <div className="flex items-start justify-between gap-4 xl:hidden">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  BudgetFlow
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                  {session.currentWorkspace?.name ?? "No household yet"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {session.currentWorkspace
                    ? `${session.currentWorkspace.baseCurrency} · ${session.currentWorkspace.memberRole}`
                    : "Create or join a household"}
                </p>
              </div>

              <form action="/auth/sign-out" method="post">
                <input type="hidden" name="redirectTo" value="/sign-in" />
                <button
                  type="submit"
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-950 hover:text-slate-950"
                >
                  Sign out
                </button>
              </form>
            </div>

            <div className="mt-4 xl:hidden">
              <WorkspaceSwitcher
                currentWorkspace={session.currentWorkspace}
                workspaces={session.workspaces}
              />
            </div>

            <div className="hidden xl:flex xl:flex-col xl:gap-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {session.currentWorkspace?.name ?? "No workspace selected"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {session.currentWorkspace
                      ? "Track spending, budgets, and recurring costs in one place."
                      : "Create or join a household workspace to start budgeting."}
                  </p>
                </div>
                <div className="flex gap-3 text-sm">
                  <Link
                    href="/app/dashboard"
                    className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/app/settings"
                    className="rounded-full bg-slate-950 px-4 py-2 font-medium text-white transition hover:bg-slate-800"
                  >
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 xl:px-10 xl:py-10">
            {children}
          </main>
        </div>
      </div>
      <AppBottomNav />
    </div>
  );
}
