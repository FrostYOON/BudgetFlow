import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type SurfaceTone = "default" | "muted" | "success" | "danger";
type SurfacePadding = "md" | "lg";

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getToneClassName(tone: SurfaceTone) {
  switch (tone) {
    case "muted":
      return "border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] text-[color:var(--foreground)]";
    case "success":
      return "border-[color:var(--success-border)] bg-[color:var(--success-surface)] text-[color:var(--foreground)]";
    case "danger":
      return "border-[color:var(--danger-border)] bg-[color:var(--danger-surface)] text-[color:var(--foreground)]";
    default:
      return "border-[color:var(--surface-border)] bg-[color:var(--surface)] text-[color:var(--foreground)]";
  }
}

function getPaddingClassName(padding: SurfacePadding) {
  return padding === "lg" ? "px-6 py-6" : "px-5 py-5 sm:px-6";
}

type AppSurfaceProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  padding?: SurfacePadding;
  tone?: SurfaceTone;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function AppSurface<T extends ElementType = "section">({
  as,
  children,
  className,
  padding = "md",
  tone = "default",
  ...props
}: AppSurfaceProps<T>) {
  const Component = as ?? "section";

  return (
    <Component
      {...props}
      className={joinClasses(
        "rounded-[1.75rem] border shadow-[var(--surface-shadow)]",
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
