"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  APP_MOBILE_NAVIGATION,
  isNavigationItemActive,
} from "@/lib/navigation";

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <LazyMotion features={domAnimation}>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom)+0.85rem)] xl:hidden">
      <nav className="pointer-events-auto mx-auto max-w-md rounded-[2rem] border border-[color:var(--app-dock-border)] bg-[color:var(--app-dock-bg)] p-2 shadow-[0_12px_30px_rgba(15,23,42,0.14)]">
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${APP_MOBILE_NAVIGATION.length}, minmax(0, 1fr))`,
          }}
        >
          {APP_MOBILE_NAVIGATION.map((item) => {
            const isActive = isNavigationItemActive(pathname, item);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center rounded-[1.4rem] px-2 py-2.5 text-center ${
                  isActive
                    ? "text-[color:var(--selection-fg)]"
                    : "text-[color:var(--text-muted)] hover:text-[color:var(--foreground)]"
                }`}
              >
                {isActive ? (
                  <m.span
                    layoutId="mobile-nav-active"
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 34,
                      mass: 0.8,
                    }}
                    className="absolute inset-0 rounded-[1.4rem] bg-[color:var(--selection-bg)] shadow-[var(--selection-shadow)]"
                  />
                ) : null}

                <m.span
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 520, damping: 32 }}
                  className="relative z-10 flex flex-col items-center"
                >
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
                      isActive
                        ? "border border-[color:var(--surface-border)] bg-[color:var(--surface-soft)] text-[color:var(--foreground)] shadow-sm"
                        : "bg-[color:var(--surface-muted)] text-[color:var(--text-soft)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                  <span className={`mt-1 text-[11px] ${isActive ? "font-semibold" : "font-medium"}`}>
                    {item.shortLabel}
                  </span>
                  <span
                    className={`mt-1 h-1 w-1 rounded-full ${
                      isActive ? "bg-[color:var(--selection-fg)]" : "bg-transparent"
                    }`}
                  />
                </m.span>
              </Link>
            );
          })}
        </div>
      </nav>
      </div>
    </LazyMotion>
  );
}
