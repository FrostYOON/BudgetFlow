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
      return "border border-slate-200 bg-slate-100 text-slate-800 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:border-slate-300 hover:bg-slate-200 hover:text-slate-950";
    case "success":
      return "border border-emerald-700 bg-emerald-600 text-white shadow-[0_12px_28px_rgba(5,150,105,0.28)] hover:bg-emerald-700";
    case "danger":
      return "border border-rose-200 bg-rose-50 text-rose-700 shadow-[0_8px_20px_rgba(244,63,94,0.08)] hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800";
    default:
      return "border border-slate-950 bg-slate-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.22)] hover:bg-slate-800";
  }
}

function getSizeClassName(size: ButtonSize) {
  return size === "sm"
    ? "px-4 py-2 text-sm"
    : "px-5 py-3 text-sm";
}

function getBaseClassName(tone: ButtonTone, size: ButtonSize, className?: string) {
  return joinClasses(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
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
