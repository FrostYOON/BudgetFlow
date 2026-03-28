import Link from "next/link";
import type { PreviewSession } from "@/lib/auth/preview-session";
import { AppSidebarNav } from "@/components/app-shell/app-sidebar-nav";
import { WorkspaceSwitcher } from "@/components/app-shell/workspace-switcher";

interface AppShellFrameProps {
  children: React.ReactNode;
  session: PreviewSession;
}

export function AppShellFrame({ children, session }: AppShellFrameProps) {
  return (
    <div className="min-h-screen bg-[#eef2ef] text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-0 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-slate-900/8 bg-white/70 px-6 py-8 backdrop-blur xl:border-r xl:border-b-0 xl:px-8">
          <div className="flex items-end justify-between gap-4 border-b border-slate-900/8 pb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                BudgetFlow
              </p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                MVP shell
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
              {session.userName}
            </p>
            <p className="text-sm text-slate-500">{session.email}</p>
          </div>

          <div className="mt-8">
            <AppSidebarNav />
          </div>

          <div className="mt-8">
            <WorkspaceSwitcher currentWorkspace={session.workspace} />
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-900/8 bg-[#eef2ef]/90 px-6 py-5 backdrop-blur xl:px-10">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {session.workspace.name}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Protected workspace routes are active. Use this shell as the
                  base for the next web issues.
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <Link
                  href="/app/dashboard"
                  className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                >
                  View dashboard
                </Link>
                <Link
                  href="/"
                  className="rounded-full bg-slate-950 px-4 py-2 font-medium text-white transition hover:bg-slate-800"
                >
                  Landing page
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 py-8 xl:px-10 xl:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
