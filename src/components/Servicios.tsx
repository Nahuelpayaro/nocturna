"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { services } from "@/lib/content";
import { steppedScroll } from "@/lib/motion";

/**
 * Servicios — a pinned horizontal scene. The section locks to the viewport
 * (framed) and the user scrolls through every service sideways before the page
 * continues: you can't move on until you've seen them all. A progress bar tracks
 * how far through the section you are. Vertical translate of the page drives a
 * horizontal translate of the track (transform only — scroll-cheap). Falls back
 * to a plain vertical list under prefers-reduced-motion.
 */
export function Servicios() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // intro panel + one panel per service. The track dwells on each (so you can
  // read it) then moves quickly to the next.
  const panels = services.length + 1;
  const { input, offsets } = steppedScroll(panels);
  const x = useTransform(scrollYProgress, input, offsets);

  if (reduce) {
    return (
      <section
        id="servicios"
        className="scroll-mt-20 border-t border-gris-sutil px-6 py-24"
      >
        <div className="mx-auto max-w-3xl">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.45em] text-ambar">
            servicios
          </p>
          <h2 className="font-display text-5xl font-bold tracking-tight text-hueso">
            Lo que hacemos
          </h2>
          <ul className="mt-12 border-t border-gris-sutil">
            {services.map((service, index) => (
              <li key={service.title} className="border-b border-gris-sutil py-8">
                <span className="font-mono text-sm text-ambar">
                  ({String(index + 1).padStart(2, "0")})
                </span>
                <h3 className="mt-2 font-display text-3xl font-bold text-hueso">
                  {service.title}
                </h3>
                <p className="mt-3 max-w-xl text-base leading-relaxed text-gris">
                  {service.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section id="servicios" className="scroll-mt-20">
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${panels * 95}vh` }}
      >
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <motion.div style={{ x }} className="flex h-full will-change-transform">
            {/* Intro panel */}
            <div className="flex h-full w-screen shrink-0 flex-col justify-center px-6 sm:px-16 lg:px-28">
              <p className="mb-5 font-mono text-xs uppercase tracking-[0.45em] text-ambar">
                servicios
              </p>
              <h2 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-hueso sm:text-7xl lg:text-8xl">
                Lo que
                <br />
                hacemos
              </h2>
              <p className="mt-8 max-w-md text-lg leading-relaxed text-gris">
                Cinco disciplinas, un mismo criterio: claridad e intención.
              </p>
              <p className="mt-12 font-mono text-xs uppercase tracking-[0.3em] text-gris">
                desplazá para recorrerlas →
              </p>
            </div>

            {/* One panel per service */}
            {services.map((service, index) => (
              <div
                key={service.title}
                className="flex h-full w-screen shrink-0 flex-col justify-center px-6 sm:px-16 lg:px-28"
              >
                <span className="font-mono text-sm tracking-[0.3em] text-ambar">
                  ({String(index + 1).padStart(2, "0")}) — (
                  {String(services.length).padStart(2, "0")})
                </span>
                <h3 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.02] tracking-tight text-hueso sm:text-6xl lg:text-7xl">
                  {service.title}
                </h3>
                <p className="mt-8 max-w-xl text-lg leading-relaxed text-gris sm:text-xl">
                  {service.description}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Section progress bar — how far through Servicios you are. */}
          <div className="absolute inset-x-6 bottom-10 sm:inset-x-16 lg:inset-x-28">
            <div className="h-px w-full bg-gris-sutil">
              <motion.div
                className="h-px origin-left bg-ambar"
                style={{ scaleX: scrollYProgress }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
