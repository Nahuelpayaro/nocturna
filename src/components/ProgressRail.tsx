"use client";

import { useEffect, useState } from "react";
import { motion, useScroll } from "motion/react";

type RailSection = { id: string; label: string };

const sections: RailSection[] = [
  { id: "inicio", label: "inicio" },
  { id: "servicios", label: "servicios" },
  { id: "proyectos", label: "proyectos" },
  { id: "proceso", label: "proceso" },
  { id: "faq", label: "preguntas" },
  { id: "contacto", label: "contacto" },
];

/**
 * The studio's navigation: a vertical progress line on the right that fills as
 * you scroll, with a mark per section. Replaces the conventional header. The
 * active section (scrollspy) lights amber and reveals its label; clicking a mark
 * scrolls there. Hidden on small screens, where a minimal variant is enough.
 */
export function ProgressRail() {
  const { scrollYProgress } = useScroll();
  const [activeId, setActiveId] = useState<string>("inicio");

  // Scrollspy — mark a section active when it crosses the viewport middle.
  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside
      aria-label="Progreso y navegación"
      className="fixed right-7 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
    >
      <div className="relative h-[46vh] w-px bg-gris-sutil">
        {/* Fill — grows downward with scroll progress. */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-full origin-top bg-ambar"
          style={{ scaleY: scrollYProgress }}
        />

        {sections.map((section, index) => {
          const active = activeId === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => go(section.id)}
              aria-label={`Ir a ${section.label}`}
              aria-current={active ? "true" : undefined}
              style={{ top: `${(index / (sections.length - 1)) * 100}%` }}
              className="group absolute left-1/2 -translate-x-1/2 -translate-y-1/2 py-2"
            >
              <span className="relative flex items-center">
                <span
                  className={`absolute right-full mr-4 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.25em] transition-opacity duration-300 ${
                    active
                      ? "text-hueso opacity-100"
                      : "text-gris opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {section.label}
                </span>
                <span
                  className={`block h-2 w-2 rounded-full border transition-all duration-300 ${
                    active
                      ? "scale-125 border-ambar bg-ambar"
                      : "border-gris bg-noche group-hover:border-hueso"
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
