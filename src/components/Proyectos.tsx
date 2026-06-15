"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { projects, type Project } from "@/lib/content";

/**
 * Proyectos — the first "pinned scene". As you scroll, each project panel sticks
 * near the top and the one before it scales down behind it, so the work stacks
 * like a deck (Apple-product-page feel). One scroll listener drives all the
 * cards. Under prefers-reduced-motion it falls back to a plain stacked list.
 */
export function Proyectos() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      id="proyectos"
      className="relative scroll-mt-20 border-t border-gris-sutil px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 max-w-2xl sm:mb-16">
          <p className="mb-4 font-mono text-xs tracking-[0.35em] text-gris">
            proyectos
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-hueso sm:text-5xl">
            Trabajo seleccionado
          </h2>
          <p className="mt-5 text-base leading-relaxed text-gris">
            Exploraciones de marca, web y motion. El próximo podría ser el
            tuyo.
          </p>
        </header>

        {reduce ? (
          <div className="flex flex-col gap-8">
            {projects.map((project, index) => (
              <ProjectPanel key={project.title} project={project} index={index} />
            ))}
          </div>
        ) : (
          <div ref={containerRef} className="relative">
            {projects.map((project, index) => (
              <StackItem
                key={project.title}
                index={index}
                count={projects.length}
                progress={scrollYProgress}
              >
                <ProjectPanel project={project} index={index} />
              </StackItem>
            ))}
          </div>
        )}
      </div>

      {/* Closing CTA */}
      <div className="mx-auto mt-16 max-w-5xl border-t border-gris-sutil pt-10 text-center">
        <p className="font-display text-2xl font-light text-hueso sm:text-3xl">
          ¿Hacemos el tuyo?
        </p>
        <a
          href="#contacto"
          className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-ambar transition-colors duration-300 hover:text-hueso"
        >
          Trabajemos juntos
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </a>
      </div>
    </section>
  );
}

function StackItem({
  index,
  count,
  progress,
  children,
}: {
  index: number;
  count: number;
  progress: MotionValue<number>;
  children: React.ReactNode;
}) {
  // Each card shrinks a little for every card still to come, so the stack reads
  // as depth. The last card never scales.
  const targetScale = 1 - (count - 1 - index) * 0.04;
  const scale = useTransform(progress, [index / count, 1], [1, targetScale]);

  return (
    <div
      className="sticky flex min-h-[78vh] items-start justify-center"
      style={{ top: `calc(14vh + ${index * 16}px)` }}
    >
      <motion.div
        style={{ scale }}
        className="w-full origin-top will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}

function ProjectPanel({ project, index }: { project: Project; index: number }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-gris-sutil bg-noche p-6 ring-1 ring-black/40 sm:p-8 md:p-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-ambar">
              ({String(index + 1).padStart(2, "0")})
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-gris">
              {project.disciplines}
            </span>
          </div>
          <h3 className="mt-3 font-display text-3xl font-bold tracking-tight text-hueso sm:text-4xl">
            {project.title}
          </h3>
        </div>
        <span className="shrink-0 rounded-full border border-hueso/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-hueso/70">
          {project.tag}
        </span>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-end">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-gris-sutil">
          {project.image ? (
            <Image
              src={project.image}
              alt={`Proyecto ${project.title}`}
              fill
              sizes="(min-width: 768px) 60vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0" style={{ background: project.gradient }} />
          )}
        </div>
        <p className="text-base leading-relaxed text-gris">{project.brief}</p>
      </div>
    </article>
  );
}
