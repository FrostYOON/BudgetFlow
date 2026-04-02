"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  APP_SIDEBAR_NAVIGATION,
  type AppNavigationItem,
  isNavigationItemActive,
} from "@/lib/navigation";

export function AppSidebarNav() {
  const pathname = usePathname();

  return (
    <LazyMotion features={domAnimation}>
      <nav className="space-y-1.5">
        {APP_SIDEBAR_NAVIGATION.map((item) => (
          <SidebarNavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>
    </LazyMotion>
  );
}

function SidebarNavLink({
  item,
  pathname,
}: {
  item: AppNavigationItem;
  pathname: string;
}) {
  const isActive = isNavigationItemActive(pathname, item);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`relative flex min-w-0 items-center gap-3 rounded-[1.1rem] px-3.5 py-3 ${
        isActive
          ? "text-[color:var(--selection-fg)]"
          : "text-[color:var(--text-soft)] hover:text-[color:var(--foreground)]"
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
          className="absolute inset-0 rounded-[1.1rem] bg-[color:var(--selection-bg)] shadow-[var(--selection-shadow)]"
        />
      ) : null}

      <m.span
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        className="relative z-10 flex min-w-0 items-center gap-3"
      >
        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            isActive
              ? "border border-[color:var(--surface-border)] bg-[color:var(--surface-soft)] text-[color:var(--foreground)] shadow-sm"
              : "bg-[color:var(--surface-muted)] text-[color:var(--text-soft)]"
          }`}
        >
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </span>
        <span className="truncate text-sm font-semibold">{item.label}</span>
      </m.span>
    </Link>
  );
}
