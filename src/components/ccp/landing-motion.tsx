"use client";

import { useEffect } from "react";
import { EASE, loadGsapWhenIdle } from "./gsap-client";

/* Landing motion (MOTION-WEB.md pieces 6, 7 and 9). Renders nothing: after hydration it loads
   GSAP when the browser is idle and only animates what is still below the fold at that moment,
   so the first screen never waits and stays visible without JavaScript. Every entrance runs
   once (ScrollTrigger once, start "top 85%"); no scrub, no parallax, no loops. */

const visible = (el: Element) => el.getClientRects().length > 0;
const belowFold = (el: Element) => el.getBoundingClientRect().top > window.innerHeight;

export function LandingMotion() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let dead = false;
    loadGsapWhenIdle()
      .then(({ gsap, ScrollTrigger }) => {
        if (dead) return;
        const root = document.querySelector<HTMLElement>(".nc-landing");
        if (!root) return;
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const once = (trigger: Element) => ({ trigger, start: "top 85%", once: true });

          /** Piece 6: the orange highlight is painted from the left, then its text appears. */
          const paint = (hls: Element[], tl: gsap.core.Timeline, at: number) =>
            hls.forEach((hl, i) => {
              const bg = hl.querySelector(".nc-hl__bg");
              const text = hl.querySelector(".nc-hl__text");
              if (bg) tl.fromTo(bg, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.5, ease: EASE.expo }, at + i * 0.12);
              if (text) tl.fromTo(text, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: EASE.expo }, at + i * 0.12 + 0.15);
            });

          // Hero: the only thing on the first screen that moves; the text is already readable.
          const heroHl = Array.from(root.querySelectorAll(".nc-hero .nc-hl")).filter(visible);
          if (heroHl.length) paint(heroHl, gsap.timeline({ delay: 0.2 }), 0);

          // Piece 7: headlines line by line, then the body and the section's buttons.
          root.querySelectorAll("main .nc-headline, .nc-footer__cta .nc-headline").forEach((h) => {
            if (h.closest(".nc-hero") || !visible(h) || !belowFold(h)) return;
            const lines = Array.from(h.querySelectorAll(".nc-headline__line, .nc-headline__plain")).filter(visible);
            if (!lines.length) return;
            const tl = gsap.timeline({ scrollTrigger: once(h) });
            tl.from(lines, { y: 24, opacity: 0, duration: 0.45, stagger: 0.08, ease: EASE.expo });
            const end = 0.45 + (lines.length - 1) * 0.08;
            paint(Array.from(h.querySelectorAll(".nc-hl")).filter(visible), tl, 0.15);
            const scope = h.closest(".nc-sh, .nc-band, .nc-footer__cta, .nc-section") ?? h.parentElement;
            const rest = scope
              ? Array.from(scope.querySelectorAll(".nc-sh__body, .nc-band__actions > .nc-btn, .nc-actions > .nc-btn, .nc-footer__cta > p")).filter((el) => visible(el) && belowFold(el))
              : [];
            if (rest.length) tl.from(rest, { y: 12, opacity: 0, duration: 0.4, ease: EASE.expo }, end + 0.15);
          });

          // Cards (problems, guarantees): staggered.
          root.querySelectorAll(".nc-grid--3, .nc-grid--2").forEach((grid) => {
            const cards = Array.from(grid.children).filter((c) => visible(c) && belowFold(c));
            if (cards.length) gsap.from(cards, { y: 16, opacity: 0, duration: 0.45, stagger: 0.08, ease: EASE.expo, scrollTrigger: once(grid) });
          });

          // Illustrations: fade in and settle 2° into their final angle. Never looped.
          root.querySelectorAll("main .nc-agent").forEach((img) => {
            if (img.closest(".nc-hero") || !visible(img) || !belowFold(img)) return;
            gsap.from(img, { opacity: 0, rotation: "-=2", duration: 0.4, ease: EASE.expo, scrollTrigger: once(img) });
          });

          // Piece 9: the four steps in order; the step-02 underline is drawn after it lands.
          const steps = root.querySelector(".nc-grid--4");
          if (steps && belowFold(steps)) {
            const tl = gsap.timeline({ scrollTrigger: once(steps) });
            const path = root.querySelector(".nc-how__path .nc-path");
            if (path && visible(path)) tl.fromTo(path, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: EASE.expo }, 0);
            tl.from(steps.children, { y: 16, opacity: 0, duration: 0.45, stagger: 0.15, ease: EASE.expo }, path && visible(path) ? 0.1 : 0);
            const mark = steps.querySelector(".nc-mark__line");
            if (mark) tl.fromTo(mark, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.45, ease: EASE.expo }, 0.15 + 0.45);
          }

          ScrollTrigger.refresh();
        });
        // Reduced motion: no branch needed; everything is already in its final state.
        cleanup = () => mm.revert();
      })
      .catch(() => {
        /* GSAP failed to load: the page stays as rendered. */
      });
    return () => {
      dead = true;
      cleanup?.();
    };
  }, []);
  return null;
}
