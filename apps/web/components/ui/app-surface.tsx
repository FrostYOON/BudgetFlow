import type { ElementType, ReactNode } from "react";

type SurfaceTone = "default" | "muted" | "success" | "danger";
type SurfacePadding = "md" | "lg";

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getToneClassName(tone: SurfaceTone) {
  switch (tone) {
    case "muted":
      return "border-slate-200 bg-slate-50";
    case "success":
      return "border-emerald-200 bg-emerald-50";
    case "danger":
      return "border-rose-200 bg-rose-50";
    default:
      return "border-slate-900/8 bg-white";
  }
}

function getPaddingClassName(padding: SurfacePadding) {
  return padding === "lg" ? "px-6 py-6" : "px-5 py-5 sm:px-6";
}

export function AppSurface({
  as,
  children,
  className,
  padding = "md",
  tone = "default",
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  padding?: SurfacePadding;
  tone?: SurfaceTone;
}) {
  const Component = as ?? "section";

  return (
    <Component
      className={joinClasses(
        "rounded-[1.75rem] border shadow-[0_18px_60px_rgba(15,23,42,0.06)]",
        getToneClassName(tone),
        getPaddingClassName(padding),
        className,
      )}
    >
      {children}
    </Component>
  );
}

export function AppMetricSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <AppSurface
      as="article"
      padding="md"
      className={joinClasses("rounded-[1.5rem] px-5 py-4", className)}
    >
      {children}
    </AppSurface>
  );
}
