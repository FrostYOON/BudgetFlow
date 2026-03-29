"use client";

import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";

export function PageTransitionShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const transitionKey = `${pathname}?${searchParams.toString()}`;

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={transitionKey}
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
          transition={{
            duration: 0.34,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );
}
