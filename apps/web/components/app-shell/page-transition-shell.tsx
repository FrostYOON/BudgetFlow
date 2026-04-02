"use client";

import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
} from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransitionShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={pathname}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{
            duration: reduceMotion ? 0.16 : 0.22,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );
}
