"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className={className}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.985 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay,
          duration: reduceMotion ? 0.18 : 0.42,
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
  const reduceMotion = useReducedMotion();

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
                    staggerChildren: 0.07,
                    delayChildren: 0.05,
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
  const reduceMotion = useReducedMotion();

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
              hidden: { opacity: 0, y: 18, scale: 0.985 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  duration: 0.42,
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
