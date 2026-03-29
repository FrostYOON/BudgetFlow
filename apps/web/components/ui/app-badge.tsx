import type { ReactNode } from "react";

type BadgeTone = "default" | "subtle" | "success" | "danger" | "warning";

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getToneClassName(tone: BadgeTone) {
  switch (tone) {
    case "subtle":
      return "bg-slate-100 text-slate-600";
    case "success":
      return "bg-emerald-100 text-emerald-800";
    case "danger":
      return "bg-rose-100 text-rose-800";
    case "warning":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-950 text-white";
  }
}

export function AppBadge({
  children,
  className,
  tone = "subtle",
}: {
  children: ReactNode;
  className?: string;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={joinClasses(
        "rounded-full px-3 py-1 text-xs font-semibold",
        getToneClassName(tone),
        className,
      )}
    >
      {children}
    </span>
  );
}
