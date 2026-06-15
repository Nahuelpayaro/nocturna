"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { PantherEye } from "./PantherEye";
import { WhatsAppButton } from "./WhatsAppButton";
import { navLinks } from "@/lib/content";

/**
 * Header — "el ojo vigía". No wordmark (the hero already says the name); instead
 * the panther's eye fades into the corner once you scroll past the hero and
 * watches you, blinking and tracking the cursor. The nav uses a sliding amber
 * scrollspy indicator that follows the section in view. Transparent over the
 * hero, solid on scroll. Respects prefers-reduced-motion.
 */
export function Header() {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const ease = [0.16, 1, 0.3, 1] as const;

  useMotionValueEvent(scrollY, "change", (value) => {
    // The header lives transparent over the hero (on top of the light rays) and
    // only turns solid night — with the eye — once you cross into the next
    // section. Both happen together at the hero's lower edge.
    setPastHero(value > window.innerHeight * 0.85);
  });

  // Scrollspy: mark a nav link active when its section crosses the viewport
  // middle. Sections that don't exist yet are simply skipped.
  useEffect(() => {
    const sections = navLinks
      .map((link) => document.getElementById(link.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ease-out ${
        pastHero || menuOpen
          ? "border-b border-gris-sutil bg-noche/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 py-4">
        {/* Left: the watching eye — appears past the hero, links back to top. */}
        <div className="flex h-9 items-center justify-self-start">
          <AnimatePresence>
            {pastHero && (
              <motion.a
                key="watching-eye"
                href="#inicio"
                aria-label="nocturna — volver arriba"
                onClick={() => setMenuOpen(false)}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.4, ease }}
                className="block text-hueso"
              >
                <PantherEye followCursor className="w-9" />
              </motion.a>
            )}
          </AnimatePresence>
        </div>

        {/* Center: desktop nav, perfectly centered by the grid. */}
        <ul className="hidden items-center gap-8 justify-self-center md:flex">
            {navLinks.map((link) => {
              const active = activeId === link.href.slice(1);
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`relative py-1 text-sm transition-colors duration-300 ${
                      active ? "text-hueso" : "text-hueso/65 hover:text-hueso"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        aria-hidden="true"
                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-ambar"
                        transition={{ duration: reduceMotion ? 0 : 0.4, ease }}
                      />
                    )}
                  </a>
                </li>
              );
            })}
        </ul>

        {/* Right: CTA + mobile hamburger. */}
        <div className="flex items-center gap-6 justify-self-end">
          <div className="hidden md:block">
            <WhatsAppButton className="inline-flex items-center justify-center rounded-full border border-hueso/20 px-5 py-2 text-sm font-medium text-hueso transition-[transform,background-color,border-color] duration-300 ease-out hover:scale-[1.03] hover:border-ambar hover:bg-ambar/10 active:scale-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100">
              Hablemos
            </WhatsAppButton>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <motion.span
              className="block h-px w-6 bg-hueso"
              animate={
                reduceMotion
                  ? undefined
                  : menuOpen
                    ? { rotate: 45, y: 6 }
                    : { rotate: 0, y: 0 }
              }
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
            <motion.span
              className="block h-px w-6 bg-hueso"
              animate={
                reduceMotion ? undefined : menuOpen ? { opacity: 0 } : { opacity: 1 }
              }
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
            <motion.span
              className="block h-px w-6 bg-hueso"
              animate={
                reduceMotion
                  ? undefined
                  : menuOpen
                    ? { rotate: -45, y: -6 }
                    : { rotate: 0, y: 0 }
              }
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={reduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            className="overflow-hidden md:hidden"
          >
            <ul className="flex flex-col gap-1 px-6 pb-6 pt-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 text-lg text-hueso/80 transition-colors duration-200 hover:text-hueso"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-3">
                <WhatsAppButton className="inline-flex w-full items-center justify-center rounded-full bg-ambar px-6 py-3 text-sm font-medium text-noche transition-transform duration-300 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
                  Hablemos
                </WhatsAppButton>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
