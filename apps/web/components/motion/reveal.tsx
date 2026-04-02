"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

function useHasMounted() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const hasMounted = useHasMounted();
  const reduceMotion = useReducedMotion();

  if (!hasMounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className={className}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{
          delay,
          duration: reduceMotion ? 0.14 : 0.24,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
};

export function StaggerReveal({ children, className }: StaggerProps) {
  const hasMounted = useHasMounted();
  const reduceMotion = useReducedMotion();

  if (!hasMounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className={className}
        initial="hidden"
        animate="visible"
        variants={
          reduceMotion
            ? {
                hidden: { opacity: 0 },
                visible: { opacity: 1 },
              }
            : {
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.04,
                    delayChildren: 0.02,
                  },
                },
              }
        }
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

export function StaggerItem({ children, className }: StaggerProps) {
  const hasMounted = useHasMounted();
  const reduceMotion = useReducedMotion();

  if (!hasMounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      variants={
        reduceMotion
          ? {
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }
          : {
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.24,
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            }
      }
    >
      {children}
    </m.div>
  );
}
