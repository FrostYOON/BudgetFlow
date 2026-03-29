"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { WorkspaceSummary } from "@/lib/auth/types";

interface WorkspaceSwitcherProps {
  currentWorkspace: WorkspaceSummary | null;
  workspaces: WorkspaceSummary[];
}

export function WorkspaceSwitcher({
  currentWorkspace,
  workspaces,
}: WorkspaceSwitcherProps) {
  const pathname = usePathname();

  if (workspaces.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-900/12 bg-slate-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Workspace
        </p>
        <h2 className="mt-3 text-base font-semibold text-slate-950">
          No workspace yet
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Start with your own budget or accept an invite to join a shared one.
        </p>
        <Link
          href="/app/onboarding"
          className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Create shared space
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-900/8 bg-slate-50/80 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Workspace
          </p>
          <h2 className="mt-2 text-base font-semibold text-slate-950">
            {currentWorkspace?.name}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {currentWorkspace?.memberRole} · {currentWorkspace?.timezone}
          </p>
        </div>
        <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          {currentWorkspace?.baseCurrency}
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        {workspaces.map((workspace) => {
          const isCurrent = workspace.id === currentWorkspace?.id;

          return (
            <Link
              key={workspace.id}
              href={`/auth/select-workspace?workspaceId=${workspace.id}&redirectTo=${encodeURIComponent(
                pathname,
              )}`}
              className={`rounded-xl px-3 py-3 text-sm transition ${
                isCurrent
                  ? "bg-white text-slate-950 ring-1 ring-slate-900/8"
                  : "text-slate-600 hover:bg-white hover:text-slate-950"
              }`}
            >
              <p className="font-semibold">{workspace.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {workspace.memberRole} · {workspace.type} ·{" "}
                {workspace.baseCurrency}
              </p>
            </Link>
          );
        })}
      </div>
      <Link
        href="/app/onboarding"
        className="mt-4 inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
      >
        Add shared space
      </Link>
    </section>
  );
}
