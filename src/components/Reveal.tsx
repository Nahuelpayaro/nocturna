"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { DURATION, EASE, VIEWPORT } from "@/lib/motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger this element after others in the same group. */
  delay?: number;
  /** Vertical travel distance. */
  y?: number;
};

/**
 * Standard scroll-reveal: fade + slide up once the element enters the viewport.
 * Collapses to a static render under prefers-reduced-motion. Use this everywhere
 * so section entrances share one rhythm.
 */
export function Reveal({ children, className, delay = 0, y = 28 }: RevealProps) {
  const reduce = useReducedMotion();

  const variants: Variants = reduce
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: DURATION.base, ease: EASE, delay },
        },
      };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      {children}
    </motion.div>
  );
}
