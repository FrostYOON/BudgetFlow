import type { ReactNode } from "react";

type BadgeTone = "default" | "subtle" | "success" | "danger" | "warning";

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getToneClassName(tone: BadgeTone) {
  switch (tone) {
    case "subtle":
      return "bg-[color:var(--badge-subtle-bg)] text-[color:var(--badge-subtle-fg)]";
    case "success":
      return "bg-[color:var(--badge-success-bg)] text-[color:var(--badge-success-fg)]";
    case "danger":
      return "bg-[color:var(--badge-danger-bg)] text-[color:var(--badge-danger-fg)]";
    case "warning":
      return "bg-[color:var(--badge-warning-bg)] text-[color:var(--badge-warning-fg)]";
    default:
      return "bg-[color:var(--badge-default-bg)] text-[color:var(--badge-default-fg)]";
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
