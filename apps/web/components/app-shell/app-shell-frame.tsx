import { AppButton } from "@/components/ui/app-button";
import { AppBadge } from "@/components/ui/app-badge";
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
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-0 xl:grid-cols-[304px_minmax(0,1fr)] xl:gap-5 xl:px-5 xl:py-5">
        <aside className="hidden px-2 py-2 xl:flex xl:h-[calc(100svh-2.5rem)] xl:flex-col">
          <div className="border-b border-[color:var(--surface-border)] px-2 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                BudgetFlow
              </p>
              <h1 className="mt-2 text-lg font-semibold tracking-tight text-[color:var(--foreground)]">
                Budget workspace
              </h1>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--selection-bg)] text-sm font-semibold text-[color:var(--selection-fg)] shadow-[var(--selection-shadow)]">
                {session.user.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase() ?? "")
                  .join("")}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[color:var(--foreground)]">
                  {session.user.name}
                </p>
                <p className="truncate text-[11px] text-[color:var(--text-muted)]">
                  {session.user.email}
                </p>
              </div>
            </div>

            {session.currentWorkspace ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <AppBadge tone="subtle">{session.currentWorkspace.baseCurrency}</AppBadge>
                <AppBadge tone="subtle">{session.currentWorkspace.memberRole}</AppBadge>
                <AppBadge tone="subtle" className="truncate">
                  {session.currentWorkspace.name}
                </AppBadge>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-1 flex-col rounded-[1.65rem] border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-3">
            <div className="flex-1">
              <AppSidebarNav />
            </div>

            <div className="mt-4 border-t border-[color:var(--surface-border)] px-2 pt-4">
              <WorkspaceSwitcher
                compact
                currentWorkspace={session.currentWorkspace}
                workspaces={session.workspaces}
              />

              <form action="/auth/sign-out" method="post" className="mt-3">
                <input type="hidden" name="redirectTo" value="/sign-in" />
                <AppButton
                  type="submit"
                  tone="secondary"
                  className="w-full rounded-[1rem] px-3.5 py-2.5 shadow-none"
                >
                  Sign out
                </AppButton>
              </form>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col pb-28 xl:min-h-[calc(100svh-2.5rem)] xl:overflow-hidden xl:rounded-[2rem] xl:border xl:border-[color:var(--surface-border)] xl:bg-[color:var(--app-panel)] xl:shadow-[var(--surface-shadow)]">
          <header className="sticky top-0 z-30 border-b border-[color:var(--surface-border)] bg-[color:var(--shell-header-bg)] px-4 py-4 sm:px-6 xl:px-8 xl:py-4">
            <div className="xl:hidden">
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
            </div>

            <div className="mt-4 xl:hidden">
              <WorkspaceSwitcher
                compact
                collapsible
                currentWorkspace={session.currentWorkspace}
                workspaces={session.workspaces}
              />
            </div>

            <div className="hidden xl:flex xl:items-center xl:justify-between xl:gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                  Current workspace
                </p>
                <p className="mt-2 truncate text-lg font-semibold tracking-tight text-[color:var(--foreground)]">
                  {session.currentWorkspace?.name ?? "No workspace selected"}
                </p>
              </div>
              {session.currentWorkspace ? (
                <div className="flex shrink-0 items-center gap-2">
                  <AppBadge tone="subtle">{session.currentWorkspace.baseCurrency}</AppBadge>
                  <AppBadge tone="subtle">{session.currentWorkspace.memberRole}</AppBadge>
                </div>
              ) : null}
            </div>
          </header>

          <main className="mx-auto flex w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 xl:px-8 xl:py-8">
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
