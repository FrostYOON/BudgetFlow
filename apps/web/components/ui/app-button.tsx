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
      return "border border-slate-300 text-slate-700 hover:border-slate-950 hover:text-slate-950";
    case "success":
      return "bg-emerald-400 text-slate-950 hover:bg-emerald-300";
    case "danger":
      return "border border-rose-200 text-rose-700 hover:border-rose-400 hover:text-rose-800";
    default:
      return "bg-slate-950 text-white hover:bg-slate-800";
  }
}

function getSizeClassName(size: ButtonSize) {
  return size === "sm"
    ? "px-4 py-2 text-sm"
    : "px-5 py-3 text-sm";
}

function getBaseClassName(tone: ButtonTone, size: ButtonSize, className?: string) {
  return joinClasses(
    "inline-flex items-center justify-center rounded-full font-semibold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
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
