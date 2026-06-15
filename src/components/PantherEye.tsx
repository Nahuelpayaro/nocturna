"use client";

import { useEffect, useId, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

type PantherEyeProps = {
  /** When true, the pupil subtly tracks the cursor — "the panther watches you". */
  followCursor?: boolean;
  /** Pupil cut color (defaults to night black). */
  pupilColor?: string;
  className?: string;
};

/**
 * The isotype: an almond eye with a vertical feline slit pupil that BLINKS.
 * The eye fills with `currentColor`, so the parent controls its color via text
 * color (hueso on dark). The night-black slit is clipped by the lids so it stays
 * a contained feline slit. The viewBox is cropped tight to the visible almond so
 * it reads at the right size from favicon to hero. Respects prefers-reduced-
 * motion: the eye simply stays open.
 */
export function PantherEye({
  followCursor = false,
  pupilColor = "var(--color-noche)",
  className,
}: PantherEyeProps) {
  const reduceMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const clipId = useId();
  const eyePath = "M2,16 Q20,0 38,16 Q20,32 2,16 Z";

  // Pupil offset (viewBox units), smoothed by a spring for organic tracking.
  const pupilX = useMotionValue(0);
  const pupilY = useMotionValue(0);
  const springX = useSpring(pupilX, { stiffness: 260, damping: 26 });
  const springY = useSpring(pupilY, { stiffness: 260, damping: 26 });

  useEffect(() => {
    if (!followCursor || reduceMotion) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const handleMove = (event: PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const angle = Math.atan2(dy, dx);
      const reach = Math.min(1, Math.hypot(dx, dy) / 420);
      const maxTravel = 2.2; // viewBox units
      pupilX.set(Math.cos(angle) * maxTravel * reach);
      // The slit is vertical, so vertical travel reads less — dampen it.
      pupilY.set(Math.sin(angle) * maxTravel * 0.55 * reach);
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [followCursor, reduceMotion, pupilX, pupilY]);

  const blink = reduceMotion
    ? undefined
    : {
        animate: { scaleY: [1, 1, 0.06, 1, 1] },
        transition: {
          duration: 4.5,
          times: [0, 0.9, 0.935, 0.97, 1],
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  return (
    <svg
      ref={svgRef}
      viewBox="2 7 36 18"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={eyePath} />
        </clipPath>
      </defs>
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        {...blink}
      >
        {/* White almond iris. */}
        <path d={eyePath} fill="currentColor" />
        {/* Night slit, clipped to the almond so the lids cut it into a contained
            feline slit (and it can't escape the eye when tracking the cursor). */}
        <g clipPath={`url(#${clipId})`}>
          <motion.ellipse
            cx="20"
            cy="16"
            rx="4"
            ry="11"
            fill={pupilColor}
            style={{ x: springX, y: springY }}
          />
        </g>
      </motion.g>
    </svg>
  );
}
