"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { Nocturna } from "./Nocturna";
import { WhatsAppButton } from "./WhatsAppButton";
import { Magnetic } from "./Magnetic";
import LightRays from "./LightRays/LightRays";

export function Hero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Scene: as the hero scrolls out, its content recedes — shrinks and fades, as
  // if stepping back into the night. Driven by the section's own scroll
  // progress (transform/opacity only — no animated blur, which janks scroll).
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  // The hero gently recedes as it leaves — visible most of the way, fading only
  // as it exits the top, so no dead black space opens up.
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const sceneOpacity = useTransform(scrollYProgress, [0.45, 1], [1, 0]);
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  // Soft easeOut curve — nothing linear, nothing abrupt.
  const ease = [0.16, 1, 0.3, 1] as const;

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12, delayChildren: 0.15 },
    },
  };

  // When the user opts out of motion, items render in place with no movement.
  const item: Variants = reduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 26 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
      };

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      {/* Faint radial glow — the dim light of the night behind the name. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 42%, rgba(217,164,65,0.08) 0%, rgba(245,245,243,0.04) 28%, transparent 70%)",
        }}
      />

      {/* Volumetric light rays from above — moonlight over the night. WebGL, so
          it only mounts when motion is allowed; reduced-motion gets the calm
          radial glow above on its own. */}
      {!reduceMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
        >
          <LightRays
            raysOrigin="top-center"
            raysColor="#e8d0a3"
            raysSpeed={1}
            lightSpread={1}
            rayLength={2}
            pulsating={false}
            fadeDistance={1}
            saturation={1}
            followMouse
            mouseInfluence={0.1}
            noiseAmount={0}
            distortion={0}
            className="opacity-60"
          />
        </div>
      )}

      <motion.div
        style={
          reduceMotion
            ? undefined
            : { scale: sceneScale, opacity: sceneOpacity, y: sceneY }
        }
        className="relative z-10 w-full will-change-transform"
      >
       <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="flex w-full max-w-4xl flex-col items-center mx-auto"
      >
        {/* Mono eyebrow label */}
        <motion.p
          variants={item}
          className="mb-8 font-mono text-xs tracking-[0.35em] text-gris"
        >
          estudio creativo
        </motion.p>

        {/* The hero mark — the blinking eye is the first thing to catch the eye. */}
        <motion.h1
          variants={item}
          className="mb-7 text-hueso text-[clamp(2.75rem,13vw,8.5rem)]"
        >
          <Nocturna className="text-[1em]" />
        </motion.h1>

        {/* Tagline */}
        <motion.p
          variants={item}
          className="max-w-2xl font-display text-xl font-light text-hueso sm:text-2xl"
        >
          Vemos lo que otros no ven.
        </motion.p>

        {/* One-line subtext: what we do */}
        <motion.p
          variants={item}
          className="mt-5 max-w-xl text-base leading-relaxed text-gris"
        >
          Identidad, web y comunicación para marcas que quieren durar.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={item}
          className="mt-11 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Magnetic className="inline-block">
            <WhatsAppButton className="group inline-flex items-center justify-center rounded-full bg-ambar px-8 py-4 text-sm font-medium tracking-wide text-noche transition-[filter] duration-300 ease-out hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
              Trabajemos juntos
            </WhatsAppButton>
          </Magnetic>

          <a
            href="#proyectos"
            className="group inline-flex items-center gap-2 px-4 py-2 text-sm text-hueso/75 transition-colors duration-300 hover:text-hueso"
          >
            Ver el trabajo
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-y-0.5"
            >
              ↓
            </span>
          </a>
        </motion.div>
       </motion.div>
      </motion.div>

      {/* Scroll indicator — a soft pulsing line at the bottom. */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <motion.div
          aria-hidden="true"
          className="h-12 w-px origin-top bg-gradient-to-b from-gris to-transparent"
          animate={
            reduceMotion ? undefined : { scaleY: [0.4, 1, 0.4], opacity: [0.3, 1, 0.3] }
          }
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </section>
  );
}
