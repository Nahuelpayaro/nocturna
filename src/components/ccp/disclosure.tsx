"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/ccp/assets";
import { EASE, gsapIfReady, prefersReducedMotion } from "./gsap-client";

const DEFAULT_FAQ_QUESTION = "¿Tengo que cambiar el sistema que uso hoy?";
const DEFAULT_FAQ_ANSWER =
  "No. Nos conectamos a tus canales y trabajamos con lo que ya tenés. Si usás un sistema que registra las consultas, lo seguimos usando: nosotros respondemos y hacemos el seguimiento.";

/** Open/close state with the height animation of MOTION-WEB.md piece 8. Without GSAP loaded,
   or with reduced motion, it toggles instantly as before. `hidden` is removed before opening
   and set again after closing, so assistive technology sees the same thing. */
function useDisclosure(defaultOpen: boolean) {
  const [open, setOpen] = useState(defaultOpen);
  const [shown, setShown] = useState(defaultOpen);
  const panel = useRef<HTMLDivElement>(null);
  const toggle = () => {
    const kit = gsapIfReady();
    const el = panel.current;
    if (!kit || !el || prefersReducedMotion()) {
      setOpen(!open);
      setShown(!open);
      return;
    }
    const { gsap } = kit;
    gsap.killTweensOf(el);
    if (!open) {
      setOpen(true);
      setShown(true);
      requestAnimationFrame(() => {
        gsap.fromTo(el, { height: 0 }, { height: "auto", duration: 0.26, ease: EASE.brand, clearProps: "height" });
        gsap.fromTo(el.firstElementChild, { opacity: 0 }, { opacity: 1, duration: 0.2, delay: 0.06, ease: EASE.brand, clearProps: "opacity" });
      });
    } else {
      setOpen(false);
      gsap.to(el, { height: 0, duration: 0.2, ease: EASE.brand, onComplete: () => { setShown(false); gsap.set(el, { clearProps: "height" }); } });
    }
  };
  return { open, shown, panel, toggle };
}

export function FaqItem({ question = DEFAULT_FAQ_QUESTION, answer = DEFAULT_FAQ_ANSWER, defaultOpen = false }: { question?: ReactNode; answer?: ReactNode; defaultOpen?: boolean }) {
  const { open, shown, panel, toggle } = useDisclosure(defaultOpen);
  const id = useId();
  return (
    <div className={cx("nc-faq", open && "is-open")}>
      <button type="button" className="nc-faq__q" aria-expanded={open} aria-controls={id} onClick={toggle}>
        <span className="nc-t-body-l-strong">{question}</span>
        <span className="nc-faq__icon" aria-hidden="true">
          <span className="nc-plus" />
        </span>
      </button>
      <div ref={panel} className="nc-acc" hidden={!shown}>
        <p id={id} className="nc-faq__a nc-t-body-l nc-muted">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function DeliverableItem({ number, title, text, defaultOpen = false }: { number: string; title: ReactNode; text: ReactNode; defaultOpen?: boolean }) {
  const { open, shown, panel, toggle } = useDisclosure(defaultOpen);
  const id = useId();
  return (
    <div className={cx("nc-deliv", open && "is-open")}>
      {/* Toda la fila es un solo botón, de 48 px como mínimo (auditoría mobile, L5). */}
      <button type="button" className="nc-deliv__row" aria-expanded={open} aria-controls={id} onClick={toggle}>
        <span className="nc-t-data-l nc-deliv__num">{number}</span>
        <span className="nc-deliv__title nc-t-title">{title}</span>
        <span className="nc-deliv__icon" aria-hidden="true">
          <span className="nc-plus" />
        </span>
      </button>
      <div ref={panel} className="nc-acc" hidden={!shown}>
        <p id={id} className="nc-deliv__text nc-t-body-l nc-muted">
          {text}
        </p>
      </div>
    </div>
  );
}
