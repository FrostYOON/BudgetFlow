"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAVIGATION } from "@/lib/navigation";

export function AppSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {APP_NAVIGATION.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-2xl px-4 py-3 transition-all duration-300 ease-out ${
              isActive
                ? "bg-slate-950 text-white shadow-[0_14px_30px_rgba(15,23,42,0.14)]"
                : "text-slate-600 hover:translate-x-1 hover:bg-slate-900/4 hover:text-slate-950"
            }`}
          >
            <p className="text-sm font-semibold">{item.label}</p>
            <p
              className={`mt-1 text-xs ${
                isActive ? "text-slate-300" : "text-slate-500"
              }`}
            >
              {item.description}
            </p>
          </Link>
        );
      })}
    </nav>
  );
}
