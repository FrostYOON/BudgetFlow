"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { WorkspaceSummary } from "@/lib/auth/types";

interface WorkspaceSwitcherProps {
  compact?: boolean;
  currentWorkspace: WorkspaceSummary | null;
  workspaces: WorkspaceSummary[];
}

export function WorkspaceSwitcher({
  compact = false,
  currentWorkspace,
  workspaces,
}: WorkspaceSwitcherProps) {
  const pathname = usePathname();

  if (workspaces.length === 0) {
    return (
      <section
        className={
          compact
            ? "p-0"
            : "rounded-[1.2rem] border border-dashed border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-3.5"
        }
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
          Workspace
        </p>
        <h2 className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">
          No workspace yet
        </h2>
        <p className="mt-1 text-xs leading-5 text-[color:var(--text-soft)]">
          Start with your own budget or accept an invite to join a shared one.
        </p>
        <Link
          href="/app/onboarding"
          className={`mt-3 inline-flex w-full items-center justify-center border px-4 py-2 text-sm font-semibold transition ${
            compact
              ? "rounded-[1.1rem] border-[color:var(--button-primary-border)] bg-[color:var(--button-primary-bg)] text-[color:var(--button-primary-fg)] shadow-none hover:bg-[color:var(--button-primary-hover-bg)]"
              : "rounded-full border-[color:var(--button-primary-border)] bg-[color:var(--button-primary-bg)] text-[color:var(--button-primary-fg)] shadow-[var(--button-primary-shadow)] hover:bg-[color:var(--button-primary-hover-bg)]"
          }`}
        >
          Create shared space
        </Link>
      </section>
    );
  }

  return (
    <section className={compact ? "p-0" : "rounded-[1.2rem] bg-[color:var(--surface-muted)] p-3.5"}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
            Workspace
          </p>
          <h2 className="mt-2 truncate text-sm font-semibold text-[color:var(--foreground)]">
            {currentWorkspace?.name}
          </h2>
          <p className="mt-1 truncate text-xs text-[color:var(--text-muted)]">
            {currentWorkspace?.memberRole} · {currentWorkspace?.timezone}
          </p>
        </div>
        <div className="rounded-full bg-[color:var(--badge-success-bg)] px-3 py-1 text-xs font-semibold text-[color:var(--badge-success-fg)]">
          {currentWorkspace?.baseCurrency}
        </div>
      </div>

      <div className="mt-4 grid max-h-44 gap-2 overflow-y-auto pr-1">
        {workspaces.map((workspace) => {
          const isCurrent = workspace.id === currentWorkspace?.id;

          return (
            <Link
              key={workspace.id}
              href={`/auth/select-workspace?workspaceId=${workspace.id}&redirectTo=${encodeURIComponent(
                pathname,
              )}`}
              className={`px-3 py-2.5 text-sm transition ${
                isCurrent
                  ? `${compact ? "rounded-[1rem]" : "rounded-[0.9rem]"} border border-[color:var(--selection-bg)] bg-[color:var(--selection-muted)] text-[color:var(--foreground)] shadow-[0_12px_26px_rgba(15,23,42,0.08)]`
                  : `${compact ? "rounded-[1rem]" : "rounded-[0.9rem]"} text-[color:var(--text-soft)] hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]`
              }`}
            >
              <p className="truncate font-semibold">{workspace.name}</p>
              <p className="mt-0.5 truncate text-[11px] text-[color:var(--text-muted)]">
                {workspace.memberRole} · {workspace.type} ·{" "}
                {workspace.baseCurrency}
              </p>
            </Link>
          );
        })}
      </div>
      <Link
        href="/app/onboarding"
        className={`mt-3 inline-flex w-full items-center justify-center border px-4 py-2 text-sm font-semibold transition ${
          compact
            ? "rounded-[1rem] border-[color:var(--button-secondary-border)] bg-[color:var(--button-secondary-bg)] text-[color:var(--button-secondary-fg)] shadow-none hover:border-[color:var(--button-secondary-hover-border)] hover:bg-[color:var(--button-secondary-hover-bg)] hover:text-[color:var(--button-secondary-hover-fg)]"
            : "rounded-full border-[color:var(--button-secondary-border)] bg-[color:var(--button-secondary-bg)] text-[color:var(--button-secondary-fg)] shadow-[var(--button-secondary-shadow)] hover:border-[color:var(--button-secondary-hover-border)] hover:bg-[color:var(--button-secondary-hover-bg)] hover:text-[color:var(--button-secondary-hover-fg)]"
        }`}
      >
        Add shared space
      </Link>
    </section>
  );
}
