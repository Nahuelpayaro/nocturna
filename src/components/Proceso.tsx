"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { processSteps } from "@/lib/content";
import { steppedScroll } from "@/lib/motion";

/**
 * Proceso — a pinned vertical stepper. The section locks and a vertical track
 * moves the steps through a single-slot window: it dwells on each step (so it
 * can be read) then moves quickly to the next. Because each step lives in its
 * own clipped slot, steps can never overlap. A timeline draws down the side —
 * this section's signature. Transform only. Reduced-motion falls back to a list.
 */
export function Proceso() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const total = processSteps.length;
  const { input, offsets } = steppedScroll(total);
  const y = useTransform(scrollYProgress, input, offsets);

  if (reduce) {
    return (
      <section
        id="proceso"
        className="scroll-mt-20 border-t border-gris-sutil px-6 py-24"
      >
        <div className="mx-auto max-w-3xl">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.45em] text-ambar">
            proceso
          </p>
          <h2 className="font-display text-5xl font-bold tracking-tight text-hueso">
            Cómo trabajamos
          </h2>
          <ol className="mt-12 border-t border-gris-sutil">
            {processSteps.map((step, index) => (
              <li key={step.title} className="border-b border-gris-sutil py-8">
                <span className="font-mono text-sm text-ambar">
                  ({String(index + 1).padStart(2, "0")})
                </span>
                <h3 className="mt-2 font-display text-3xl font-bold text-hueso">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xl text-base leading-relaxed text-gris">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section id="proceso" className="scroll-mt-20">
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${total * 95}vh` }}
      >
        <div className="sticky top-0 flex h-screen items-center overflow-hidden px-6 sm:px-16 lg:px-28">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-10 md:gap-16">
            {/* Drawing timeline */}
            <div className="relative hidden h-[44vh] w-px shrink-0 bg-gris-sutil md:block">
              <motion.div
                className="absolute inset-x-0 top-0 h-full origin-top bg-ambar"
                style={{ scaleY: scrollYProgress }}
              />
            </div>

            {/* Label + single-slot vertical step window */}
            <div className="min-w-0 flex-1">
              <p className="mb-8 font-mono text-xs uppercase tracking-[0.45em] text-ambar">
                proceso · cómo trabajamos
              </p>
              <div className="relative h-[44vh] overflow-hidden">
                <motion.div style={{ y }} className="will-change-transform">
                  {processSteps.map((step, index) => (
                    <div
                      key={step.title}
                      className="flex h-[44vh] flex-col justify-center"
                    >
                      <span className="font-display text-7xl font-bold leading-none text-gris-sutil sm:text-8xl">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-4 font-display text-4xl font-bold tracking-tight text-hueso sm:text-5xl">
                        {step.title}
                      </h3>
                      <p className="mt-5 max-w-md text-lg leading-relaxed text-gris">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
