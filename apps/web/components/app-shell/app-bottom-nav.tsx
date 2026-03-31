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
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-900/8 bg-white/92 px-3 py-2 backdrop-blur xl:hidden">
        <div
          className="mx-auto grid max-w-2xl gap-2"
          style={{
            gridTemplateColumns: `repeat(${APP_MOBILE_NAVIGATION.length}, minmax(0, 1fr))`,
          }}
        >
          {APP_MOBILE_NAVIGATION.map((item) => {
            const isActive = isNavigationItemActive(pathname, item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-center ${
                  isActive
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-950"
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
                    className="absolute inset-0 rounded-2xl bg-slate-950 shadow-[0_12px_28px_rgba(15,23,42,0.22)]"
                  />
                ) : null}

                <m.span
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 520, damping: 32 }}
                  className="relative z-10 flex flex-col items-center"
                >
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      isActive ? "scale-105" : ""
                    }`}
                  >
                    {item.shortLabel.slice(0, 1)}
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
