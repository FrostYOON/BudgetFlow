import { AppButton, AppButtonLink } from "@/components/ui/app-button";
import type { AppSession } from "@/lib/auth/session";
import { AppBottomNav } from "@/components/app-shell/app-bottom-nav";
import { PageTransitionShell } from "@/components/app-shell/page-transition-shell";
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
                Personal-first budgeting
              </h1>
            </div>
            <form action="/auth/sign-out" method="post">
              <input type="hidden" name="redirectTo" value="/sign-in" />
              <AppButton type="submit" tone="secondary" size="sm">
                Sign out
              </AppButton>
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
                  {session.currentWorkspace?.name ?? "No workspace yet"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {session.currentWorkspace
                    ? `${session.currentWorkspace.baseCurrency} · ${session.currentWorkspace.memberRole}`
                    : "Create a shared space when you need one"}
                </p>
              </div>

              <form action="/auth/sign-out" method="post">
                <input type="hidden" name="redirectTo" value="/sign-in" />
                <AppButton type="submit" tone="secondary" size="sm">
                  Sign out
                </AppButton>
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
                  {session.currentWorkspace ? (
                    <p className="mt-1 text-sm text-slate-600">
                      {session.currentWorkspace.baseCurrency} · {session.currentWorkspace.memberRole}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-3 text-sm">
                  <AppButtonLink
                    href="/app/dashboard"
                    tone="secondary"
                    size="sm"
                  >
                    Dashboard
                  </AppButtonLink>
                  <AppButtonLink
                    href="/app/settings"
                    tone="primary"
                    size="sm"
                  >
                    Settings
                  </AppButtonLink>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 xl:px-10 xl:py-10">
            <PageTransitionShell>{children}</PageTransitionShell>
          </main>
        </div>
      </div>
      <AppBottomNav />
    </div>
  );
}
