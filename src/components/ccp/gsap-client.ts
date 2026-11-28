/* GSAP for the CCP pages (MOTION-WEB.md). Loaded only in the browser, after hydration,
   through dynamic import(): it never enters the first-load bundle nor blocks rendering.
   If it fails to load, every page stays exactly as the server rendered it. */
import type { gsap as Gsap } from "gsap";
import type { ScrollTrigger as ST } from "gsap/ScrollTrigger";

export type GsapKit = { gsap: typeof Gsap; ScrollTrigger: typeof ST };

let kit: Promise<GsapKit> | null = null;
let ready: GsapKit | null = null;

export function loadGsap(): Promise<GsapKit> {
  kit ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, s]) => {
    g.gsap.registerPlugin(s.ScrollTrigger);
    ready = { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger };
    return ready;
  });
  return kit;
}

/** The kit if it has already loaded, else null (callers then skip the animation). */
export const gsapIfReady = () => ready;

/** Loads GSAP when the browser is idle after the first paint. */
export function loadGsapWhenIdle(): Promise<GsapKit> {
  return new Promise((resolve, reject) => {
    const go = () => loadGsap().then(resolve, reject);
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(go, { timeout: 2000 });
    else setTimeout(go, 200);
  });
}

export const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Curves of the motion videos (motion/src/lib/motion.ts). GSAP has no cubic-bezier string
   without the CustomEase plugin; "power2.out" is the closest built-in to brand (.22,.61,.36,1). */
export const EASE = { brand: "power2.out", expo: "expo.out", count: "power2.out" } as const;
