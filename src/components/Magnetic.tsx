"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

type MagneticProps = {
  children: React.ReactNode;
  className?: string;
  /** How strongly the element follows the cursor (0–1). */
  strength?: number;
};

/**
 * Magnetic wrapper — the element drifts toward the cursor while it hovers, then
 * springs back on leave. A small, high-craft micro-interaction for primary CTAs.
 * Disabled on touch devices and under prefers-reduced-motion (the element just
 * sits still).
 */
export function Magnetic({ children, className, strength = 0.35 }: MagneticProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 18 });
  const springY = useSpring(y, { stiffness: 200, damping: 18 });

  useEffect(() => {
    setEnabled(!reduce && window.matchMedia("(pointer: fine)").matches);
  }, [reduce]);

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
}
