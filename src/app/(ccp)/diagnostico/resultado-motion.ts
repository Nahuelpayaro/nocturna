import { formatMonto, type Moneda } from "@/lib/ccp/diagnostico";
import { EASE, gsapIfReady, prefersReducedMotion } from "@/components/ccp/gsap-client";

/* MOTION-WEB.md piece 1: the result enters in sequence once the scroll has left its title at
   the top. Called from a layout effect right after the result renders, so the start states are
   set before the first paint. If GSAP has not loaded yet, nothing moves and nothing hides. */

let current: { kill: () => void } | null = null;

/** Waits for the smooth scroll of the result title to end (scrollend, or 450 ms as fallback). */
function afterScroll(go: () => void): () => void {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    window.removeEventListener("scrollend", run);
    go();
  };
  window.addEventListener("scrollend", run, { once: true });
  const t = setTimeout(run, 450);
  return () => {
    done = true;
    clearTimeout(t);
    window.removeEventListener("scrollend", run);
  };
}

export function animarResultado(section: HTMLElement | null, moneda: Moneda) {
  current?.kill();
  current = null;
  const kit = gsapIfReady();
  if (!section || !kit) return;
  const { gsap } = kit;

  if (prefersReducedMotion()) {
    const tw = gsap.fromTo(section, { opacity: 0 }, { opacity: 1, duration: 0.15, clearProps: "opacity" });
    current = { kill: () => tw.kill() };
    return;
  }

  const q = <T extends Element>(sel: string) => Array.from(section.querySelectorAll<T>(sel));
  const title = section.querySelector("#resultado-titulo");
  const plain = title ? Array.from(title.querySelectorAll(".nc-headline__plain")) : [];
  const hlBg = title?.querySelector(".nc-hl__bg");
  const hlText = title?.querySelector(".nc-hl__text");
  const cards = q<HTMLElement>(".nc-stat");
  const lead = q<HTMLElement>(".nc-diag__stats > .nc-t-lead");
  const cta = section.querySelector<HTMLElement>(".nc-diag__stats a.nc-btn");
  const ctaNote = cta?.parentElement?.querySelector(":scope > p");

  // Start states, before paint.
  gsap.set(plain, { y: 16, opacity: 0 });
  if (hlBg) gsap.set(hlBg, { scaleX: 0, transformOrigin: "left center" });
  if (hlText) gsap.set(hlText, { opacity: 0 });
  gsap.set([...cards, ...lead], { y: 12, opacity: 0 });
  cards.forEach((c) => {
    const line = c.querySelector(".nc-graphic");
    if (line) gsap.set(line, { clipPath: "inset(0 100% 0 0)" });
  });
  if (cta) gsap.set([cta, ctaNote].filter(Boolean), { y: 8, opacity: 0 });

  const tl = gsap.timeline({ paused: true });
  tl.to(plain, { y: 0, opacity: 1, duration: 0.35, ease: EASE.expo }, 0);
  if (hlBg) tl.to(hlBg, { scaleX: 1, duration: 0.5, ease: EASE.expo }, 0.1);
  if (hlText) tl.to(hlText, { opacity: 1, duration: 0.3, ease: EASE.expo }, 0.25);

  cards.forEach((card, i) => {
    const at = 0.45 + i * 0.35;
    tl.to(card, { y: 0, opacity: 1, duration: 0.45, ease: EASE.expo }, at);
    const num = card.querySelector<HTMLElement>("[data-count]");
    if (num) {
      const to = Number(num.dataset.count);
      const fmt = num.dataset.fmt === "int" ? (v: number) => String(Math.round(v)) : (v: number) => formatMonto(Math.round(v), moneda);
      const o = { v: 0 };
      num.textContent = fmt(0);
      tl.to(o, { v: to, duration: 0.9, ease: EASE.count, onUpdate: () => { num.textContent = fmt(o.v); }, onComplete: () => { num.textContent = fmt(to); } }, at);
    }
    const line = card.querySelector(".nc-graphic");
    if (line) tl.to(line, { clipPath: "inset(0 0% 0 0)", duration: 0.45, ease: EASE.expo }, at + 0.5);
    if (card.classList.contains("nc-stat--accent")) {
      tl.to(card, { scale: 1.02, duration: 0.15, ease: EASE.brand }, at + 0.9).to(card, { scale: 1, duration: 0.15, ease: EASE.brand });
    }
  });
  lead.forEach((p) => tl.to(p, { y: 0, opacity: 1, duration: 0.45, ease: EASE.expo }, 0.45));
  if (cta) {
    tl.to([cta, ctaNote].filter(Boolean), { y: 0, opacity: 1, duration: 0.3, ease: EASE.brand }, 1.45);
    tl.call(() => { cta.classList.remove("nc-nudge"); void cta.offsetWidth; cta.classList.add("nc-nudge"); }, [], 1.6);
  }
  tl.set([...plain, ...cards, ...lead, cta, ctaNote, hlBg, hlText].filter(Boolean), { clearProps: "transform,opacity" });

  const stop = afterScroll(() => tl.play());
  current = {
    kill: () => {
      stop();
      tl.progress(1).kill();
    },
  };
}
