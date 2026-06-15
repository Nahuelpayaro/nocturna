import type { Variants } from "motion/react";

/**
 * The studio's motion language — one source of truth so every animation across
 * the site shares the same curves and rhythm. Import these instead of
 * hand-writing eases and durations per component.
 */

/** Primary easing: a soft, confident easeOut. Nothing linear, nothing abrupt. */
export const EASE = [0.16, 1, 0.3, 1] as const;

/** Durations, in seconds. */
export const DURATION = {
  fast: 0.3,
  base: 0.6,
  slow: 0.9,
} as const;

/** Standard viewport config for scroll-triggered reveals — fire once, a bit
 * before the element is fully in view. */
export const VIEWPORT = { once: true, amount: 0.3 } as const;

/**
 * Fade up + in. Pass the result of `useReducedMotion()` to collapse it to a
 * static state when the user opts out of motion.
 */
export function fadeUp(reduce?: boolean | null, distance = 28): Variants {
  if (reduce) {
    return { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } };
  }
  return {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATION.base, ease: EASE },
    },
  };
}

/** Container that staggers its children's reveal. */
export function staggerContainer(stagger = 0.1, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
  };
}

/**
 * Build a stepped scroll map for pinned scenes: the track DWELLS on each panel
 * (so it can be read) and then moves quickly to the next. Returns an `input`
 * range (normalized scroll progress, monotonic in [0,1]) and `offsets` (each
 * panel's position as a percentage string of the track's own size), ready to
 * pass to `useTransform(progress, input, offsets)` for x (horizontal) or y
 * (vertical) tracks.
 *
 * @param count  number of panels in the track
 * @param dwell  relative weight of the read-pause on each panel
 * @param move   relative weight of the transition between panels
 */
export function steppedScroll(count: number, dwell = 2.6, move = 2.2) {
  const input: number[] = [];
  const offsets: string[] = [];
  let t = 0;
  for (let k = 0; k < count; k++) {
    const pos = `-${(k / count) * 100}%`;
    input.push(t);
    offsets.push(pos); // dwell start
    t += dwell;
    input.push(t);
    offsets.push(pos); // dwell end
    if (k < count - 1) t += move; // gap = the move to the next panel
  }
  return { input: input.map((s) => s / t), offsets };
}
