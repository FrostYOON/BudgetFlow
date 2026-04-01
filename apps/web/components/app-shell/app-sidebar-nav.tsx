"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  APP_SIDEBAR_NAVIGATION,
  isNavigationItemActive,
} from "@/lib/navigation";

export function AppSidebarNav() {
  const pathname = usePathname();

  return (
    <LazyMotion features={domAnimation}>
      <nav className="space-y-2">
        {APP_SIDEBAR_NAVIGATION.map((item) => {
          const isActive = isNavigationItemActive(pathname, item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative block rounded-2xl px-4 py-3 ${
                isActive
                  ? "text-white"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              {isActive ? (
                <m.span
                  layoutId="sidebar-nav-active"
                  transition={{
                    type: "spring",
                    stiffness: 360,
                    damping: 30,
                    mass: 0.85,
                  }}
                  className="absolute inset-0 rounded-2xl bg-slate-950 shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
                />
              ) : null}

              <m.span
                whileHover={!isActive ? { x: 6 } : undefined}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className="relative z-10 flex items-center gap-3"
              >
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    isActive
                      ? "bg-white/12 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <span className="block min-w-0">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p
                    className={`mt-1 text-xs ${
                      isActive ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {item.description}
                  </p>
                </span>
              </m.span>
            </Link>
          );
        })}
      </nav>
    </LazyMotion>
  );
}
