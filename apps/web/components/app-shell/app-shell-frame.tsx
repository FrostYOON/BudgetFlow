import { AppButton, AppButtonLink } from "@/components/ui/app-button";
import type { AppSession } from "@/lib/auth/session";
import { AppBottomNav } from "@/components/app-shell/app-bottom-nav";
import { PageTransitionShell } from "@/components/app-shell/page-transition-shell";
import { AppSidebarNav } from "@/components/app-shell/app-sidebar-nav";
import { AppSwipeNavigator } from "@/components/app-shell/app-swipe-navigator";
import { WorkspaceSwitcher } from "@/components/app-shell/workspace-switcher";

interface AppShellFrameProps {
  children: React.ReactNode;
  session: AppSession;
}

export function AppShellFrame({ children, session }: AppShellFrameProps) {
  return (
    <div
      className="min-h-screen bg-[color:var(--shell-bg)] text-[color:var(--foreground)]"
      style={{ backgroundImage: "var(--app-shell-bg)" }}
    >
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-0 xl:grid-cols-[296px_minmax(0,1fr)] xl:gap-4 xl:px-6 xl:py-6">
        <aside className="hidden border-b border-[color:var(--surface-border)] bg-[color:var(--surface-soft)] px-6 py-8 backdrop-blur xl:flex xl:h-[calc(100svh-3rem)] xl:flex-col xl:rounded-[2rem] xl:border xl:border-b xl:bg-[color:var(--app-panel)] xl:px-8 xl:py-8 xl:shadow-[var(--surface-shadow)] xl:backdrop-blur-xl">
          <div className="flex items-end justify-between gap-4 border-b border-[color:var(--surface-border)] pb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                BudgetFlow
              </p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight text-[color:var(--foreground)]">
                Personal-first budgeting
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <form action="/auth/sign-out" method="post">
                <input type="hidden" name="redirectTo" value="/sign-in" />
                <AppButton type="submit" tone="secondary" size="sm">
                  Sign out
                </AppButton>
              </form>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-[color:var(--text-muted)]">Signed in as</p>
            <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">
              {session.user.name}
            </p>
            <p className="text-sm text-[color:var(--text-muted)]">{session.user.email}</p>
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

        <div className="flex min-h-screen flex-col pb-28 xl:min-h-[calc(100svh-3rem)] xl:overflow-hidden xl:rounded-[2rem] xl:border xl:border-[color:var(--surface-border)] xl:bg-[color:var(--app-panel)] xl:shadow-[var(--surface-shadow)] xl:backdrop-blur-xl">
          <header className="sticky top-0 z-30 border-b border-[color:var(--surface-border)] bg-[color:var(--shell-header-bg)] px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8 xl:py-5">
            <div className="flex items-start justify-between gap-4 xl:hidden">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  BudgetFlow
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-[color:var(--foreground)]">
                  {session.currentWorkspace?.name ?? "No workspace yet"}
                </p>
                <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                  {session.currentWorkspace
                    ? `${session.currentWorkspace.baseCurrency} · ${session.currentWorkspace.memberRole}`
                    : "Create a shared space when you need one"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <form action="/auth/sign-out" method="post">
                  <input type="hidden" name="redirectTo" value="/sign-in" />
                  <AppButton type="submit" tone="secondary" size="sm">
                    Sign out
                  </AppButton>
                </form>
              </div>
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
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                    Active workspace
                  </p>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-[color:var(--foreground)]">
                    {session.currentWorkspace?.name ?? "No workspace selected"}
                  </p>
                  {session.currentWorkspace ? (
                    <p className="mt-1 text-sm text-[color:var(--text-soft)]">
                      {session.currentWorkspace.baseCurrency} · {session.currentWorkspace.memberRole}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 text-sm">
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

          <main className="mx-auto flex w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-6 xl:px-8 xl:py-8">
            <AppSwipeNavigator>
              <PageTransitionShell>{children}</PageTransitionShell>
            </AppSwipeNavigator>
          </main>
        </div>
      </div>
      <AppBottomNav />
    </div>
  );
}
