import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonTone = "primary" | "secondary" | "success" | "danger";
type ButtonSize = "sm" | "md";

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getToneClassName(tone: ButtonTone) {
  switch (tone) {
    case "secondary":
      return "border border-[color:var(--button-secondary-border)] bg-[color:var(--button-secondary-bg)] text-[color:var(--button-secondary-fg)] shadow-[var(--button-secondary-shadow)] hover:border-[color:var(--button-secondary-hover-border)] hover:bg-[color:var(--button-secondary-hover-bg)] hover:text-[color:var(--button-secondary-hover-fg)]";
    case "success":
      return "border border-[color:var(--button-success-border)] bg-[color:var(--button-success-bg)] text-[color:var(--button-success-fg)] shadow-[var(--button-success-shadow)] hover:bg-[color:var(--button-success-hover-bg)]";
    case "danger":
      return "border border-[color:var(--button-danger-border)] bg-[color:var(--button-danger-bg)] text-[color:var(--button-danger-fg)] shadow-[var(--button-danger-shadow)] hover:border-[color:var(--button-danger-hover-border)] hover:bg-[color:var(--button-danger-hover-bg)] hover:text-[color:var(--button-danger-hover-fg)]";
    default:
      return "border border-[color:var(--button-primary-border)] bg-[color:var(--button-primary-bg)] text-[color:var(--button-primary-fg)] shadow-[var(--button-primary-shadow)] hover:bg-[color:var(--button-primary-hover-bg)]";
  }
}

function getSizeClassName(size: ButtonSize) {
  return size === "sm"
    ? "px-4 py-2 text-sm"
    : "px-5 py-3 text-sm";
}

function getBaseClassName(tone: ButtonTone, size: ButtonSize, className?: string) {
  return joinClasses(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]",
    getToneClassName(tone),
    getSizeClassName(size),
    className,
  );
}

export function AppButton({
  children,
  className,
  size = "md",
  tone = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
  size?: ButtonSize;
  tone?: ButtonTone;
}) {
  return (
    <button {...props} className={getBaseClassName(tone, size, className)}>
      {children}
    </button>
  );
}

export function AppButtonLink({
  children,
  className,
  href,
  size = "md",
  tone = "secondary",
}: {
  children: ReactNode;
  className?: string;
  href: string;
  size?: ButtonSize;
  tone?: ButtonTone;
}) {
  return (
    <Link href={href} className={getBaseClassName(tone, size, className)}>
      {children}
    </Link>
  );
}
