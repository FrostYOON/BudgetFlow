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
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--surface-border)] bg-[color:var(--surface-soft)] px-3 py-2 backdrop-blur xl:hidden">
        <div
          className="mx-auto grid max-w-2xl gap-2"
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
                className={`relative flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-center ${
                  isActive
                    ? "text-white"
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
                    className="absolute inset-0 rounded-2xl bg-[color:var(--button-primary-bg)] shadow-[var(--button-primary-shadow)]"
                  />
                ) : null}

                <m.span
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 520, damping: 32 }}
                  className="relative z-10 flex flex-col items-center"
                >
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                      isActive
                        ? "bg-white/14"
                        : "bg-[color:var(--surface-muted)] text-[color:var(--text-soft)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                  <span className="mt-1 text-[11px] font-medium">
                    {item.shortLabel}
                  </span>
                </m.span>
              </Link>
            );
          })}
        </div>
      </nav>
    </LazyMotion>
  );
}
