"use client";

import { IrisReveal } from "./IrisReveal";

type SectionProps = {
  id: string;
  children: React.ReactNode;
  className?: string;
  /** Background utility for the section surface (e.g. "bg-hueso"). The iris
   * reveals this surface, so a light section opens like a pupil in the dark. */
  bgClassName?: string;
};

/**
 * The shared section shell. Every content section uses it so the boundary
 * between sections is one consistent gesture: the section opens like a pupil
 * (iris clip-path) as it scrolls into view — the studio's section transition.
 * Also handles the scroll-margin so the fixed header never covers a heading.
 */
export function Section({ id, children, className, bgClassName }: SectionProps) {
  return (
    <section id={id} className="relative scroll-mt-20">
      <IrisReveal
        className={`px-6 py-24 sm:py-32 ${bgClassName ?? ""} ${className ?? ""}`}
      >
        {children}
      </IrisReveal>
    </section>
  );
}
