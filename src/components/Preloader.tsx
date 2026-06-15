"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { EASE } from "@/lib/motion";

/**
 * Intro preloader — a black panther crouching in the gloom emerges from the
 * dark, its fur rustling (an animated displacement filter ripples the edges),
 * then the site is revealed. The fur animation lives only here, so it never
 * touches the scroll performance of the page. Skipped under
 * prefers-reduced-motion.
 */
export function Preloader() {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);

  const reveal = useMotionValue(0);
  const scale = useTransform(reveal, [0, 0.7], [0.8, 1]);
  const opacity = useTransform(reveal, [0, 0.45], [0, 1]);

  useEffect(() => {
    if (reduce) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const controls = animate(reveal, 1, { duration: 2, ease: [0.22, 1, 0.36, 1] });
    controls.then(() => {
      document.body.style.overflow = previous;
      setDone(true);
    });

    return () => {
      controls.stop();
      document.body.style.overflow = previous;
    };
  }, [reduce, reveal]);

  // Drift the displacement noise so the fur rustles. Throttled to ~30fps — the
  // movement is slow, so it's invisible but halves the cost.
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    let start = 0;
    let last = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!start) start = t;
      if (t - last < 33) return;
      last = t;
      const e = (t - start) / 1000;
      const bx = (0.016 + 0.005 * Math.sin(e * 1.1)).toFixed(4);
      const by = (0.021 + 0.005 * Math.sin(e * 0.8 + 1)).toFixed(4);
      turbulenceRef.current?.setAttribute("baseFrequency", `${bx} ${by}`);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  if (reduce) return null;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 50% 56%, #242424 0%, #0a0a0a 68%)",
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {/* Inline displacement filter that ripples the panther's fur. */}
          <svg aria-hidden="true" className="absolute h-0 w-0">
            <defs>
              <filter
                id="panther-fur"
                x="-6%"
                y="-6%"
                width="112%"
                height="112%"
              >
                <feTurbulence
                  ref={turbulenceRef}
                  type="fractalNoise"
                  baseFrequency="0.016 0.021"
                  numOctaves={2}
                  seed={4}
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale={6}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
          </svg>

          <motion.img
            src="/pantera-agazapada.svg"
            alt=""
            aria-hidden="true"
            style={{ scale, opacity, filter: "url(#panther-fur)" }}
            className="w-[64vw] max-w-[440px] will-change-transform"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
