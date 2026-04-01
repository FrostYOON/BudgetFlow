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
      <section className="rounded-2xl border border-dashed border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
          Workspace
        </p>
        <h2 className="mt-3 text-base font-semibold text-[color:var(--foreground)]">
          No workspace yet
        </h2>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
          Start with your own budget or accept an invite to join a shared one.
        </p>
        <Link
          href="/app/onboarding"
          className="mt-4 inline-flex rounded-full border border-[color:var(--button-primary-border)] bg-[color:var(--button-primary-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--button-primary-fg)] shadow-[var(--button-primary-shadow)] transition hover:bg-[color:var(--button-primary-hover-bg)]"
        >
          Create shared space
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
            Workspace
          </p>
          <h2 className="mt-2 text-base font-semibold text-[color:var(--foreground)]">
            {currentWorkspace?.name}
          </h2>
          <p className="mt-1 text-sm text-[color:var(--text-muted)]">
            {currentWorkspace?.memberRole} · {currentWorkspace?.timezone}
          </p>
        </div>
        <div className="rounded-full bg-[color:var(--badge-success-bg)] px-3 py-1 text-xs font-semibold text-[color:var(--badge-success-fg)]">
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
                  ? "bg-[color:var(--surface)] text-[color:var(--foreground)] ring-1 ring-[color:var(--surface-border)]"
                  : "text-[color:var(--text-soft)] hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]"
              }`}
            >
              <p className="font-semibold">{workspace.name}</p>
              <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                {workspace.memberRole} · {workspace.type} ·{" "}
                {workspace.baseCurrency}
              </p>
            </Link>
          );
        })}
      </div>
      <Link
        href="/app/onboarding"
        className="mt-4 inline-flex rounded-full border border-[color:var(--button-secondary-border)] bg-[color:var(--button-secondary-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--button-secondary-fg)] shadow-[var(--button-secondary-shadow)] transition hover:border-[color:var(--button-secondary-hover-border)] hover:bg-[color:var(--button-secondary-hover-bg)] hover:text-[color:var(--button-secondary-hover-fg)]"
      >
        Add shared space
      </Link>
    </section>
  );
}
