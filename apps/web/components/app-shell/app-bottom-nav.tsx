"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAVIGATION } from "@/lib/navigation";

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-900/8 bg-white/92 px-3 py-2 backdrop-blur xl:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-2">
        {APP_NAVIGATION.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-center transition ${
                isActive
                  ? "bg-slate-950 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                {item.shortLabel.slice(0, 1)}
              </span>
              <span className="mt-1 text-[11px] font-medium">
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
