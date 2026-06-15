"use client";

import { useEffect, useState } from "react";
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
 * dark, then the site is revealed. "Vemos lo que otros no ven." Skipped under
 * prefers-reduced-motion.
 */
export function Preloader() {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);

  const reveal = useMotionValue(0);
  const scale = useTransform(reveal, [0, 0.7], [0.8, 1]);
  const opacity = useTransform(reveal, [0, 0.45], [0, 1]);

  useEffect(() => {
    if (reduce) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const controls = animate(reveal, 1, { duration: 2, ease: [0.22, 1, 0.36, 1] });
    controls.then(() => {
      // Restore scrolling the moment the intro finishes (the cleanup alone
      // never fires while this component stays mounted).
      document.body.style.overflow = previous;
      setDone(true);
    });

    return () => {
      controls.stop();
      document.body.style.overflow = previous;
    };
  }, [reduce, reveal]);

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
          <motion.img
            src="/pantera-agazapada.svg"
            alt=""
            aria-hidden="true"
            style={{ scale, opacity }}
            className="w-[64vw] max-w-[440px] will-change-transform"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
