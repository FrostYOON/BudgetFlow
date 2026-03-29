"use client";

import { usePathname, useSearchParams } from "next/navigation";

export function PageTransitionShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const transitionKey = `${pathname}?${searchParams.toString()}`;

  return (
    <div key={transitionKey} className="motion-safe:animate-page-enter">
      {children}
    </div>
  );
}
