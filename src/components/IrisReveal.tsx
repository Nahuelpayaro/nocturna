"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";

type IrisRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Kept for API compatibility; no longer used. */
  origin?: string;
};

/**
 * Section reveal. Previously a radial mask ("iris"), now a cheap fade + rise —
 * masks force expensive compositing layers that re-composite on every scroll
 * frame, which was hurting scroll fluidity. This is transform/opacity only (GPU
 * cheap). Content is always rendered (fail-open). Bespoke per-section scene
 * transitions replace this in the experience redesign.
 */
export function IrisReveal({ children, className }: IrisRevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
