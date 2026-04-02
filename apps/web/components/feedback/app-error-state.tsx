"use client";

import { Reveal } from "@/components/motion/reveal";
import { AppButton, AppButtonLink } from "@/components/ui/app-button";

type AppErrorStateProps = {
  title: string;
  label: string;
  message: string;
  onRetry?: () => void;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function AppErrorState({
  label,
  message,
  onRetry,
  secondaryHref,
  secondaryLabel,
  title,
}: AppErrorStateProps) {
  return (
    <Reveal delay={0.04}>
      <section className="rounded-[1.75rem] border border-rose-200 bg-[linear-gradient(180deg,#fff7f7_0%,#fff1f2_100%)] px-6 py-6 shadow-[0_18px_60px_rgba(244,63,94,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">
          {label}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {onRetry ? (
            <AppButton
              type="button"
              onClick={onRetry}
            >
              Retry
            </AppButton>
          ) : null}
          {secondaryHref && secondaryLabel ? (
            <AppButtonLink
              href={secondaryHref}
              tone="secondary"
            >
              {secondaryLabel}
            </AppButtonLink>
          ) : null}
        </div>
      </section>
    </Reveal>
  );
}
