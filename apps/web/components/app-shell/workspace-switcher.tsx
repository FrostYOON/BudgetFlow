"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PREVIEW_WORKSPACES,
  type PreviewWorkspace,
} from "@/lib/preview-workspaces";

interface WorkspaceSwitcherProps {
  currentWorkspace: PreviewWorkspace;
}

export function WorkspaceSwitcher({
  currentWorkspace,
}: WorkspaceSwitcherProps) {
  const pathname = usePathname();

  return (
    <section className="rounded-2xl border border-slate-900/8 bg-slate-50/80 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Workspace
          </p>
          <h2 className="mt-2 text-base font-semibold text-slate-950">
            {currentWorkspace.name}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {currentWorkspace.roleLabel} · {currentWorkspace.memberLabel}
          </p>
        </div>
        <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          {currentWorkspace.budgetLabel}
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        {PREVIEW_WORKSPACES.map((workspace) => {
          const isCurrent = workspace.id === currentWorkspace.id;

          return (
            <Link
              key={workspace.id}
              href={`/auth/preview-session?workspaceId=${workspace.id}&redirectTo=${encodeURIComponent(
                pathname,
              )}`}
              className={`rounded-xl px-3 py-3 text-sm transition ${
                isCurrent
                  ? "bg-white text-slate-950 ring-1 ring-slate-900/8"
                  : "text-slate-600 hover:bg-white hover:text-slate-950"
              }`}
            >
              <p className="font-semibold">{workspace.name}</p>
              <p className="mt-1 text-xs text-slate-500">{workspace.summary}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
