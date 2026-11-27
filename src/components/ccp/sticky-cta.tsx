"use client";

import { useEffect, useRef, useState } from "react";
import { CTA_DIAGNOSTICO, DIAGNOSTICO_HREF } from "@/lib/ccp/assets";
import { Button } from "./buttons";

/* Barra fija abajo, solo en mobile, con el botón al diagnóstico (auditoría mobile, L1).
   Aparece cuando el botón del hero ya pasó y no hay otro botón al diagnóstico a la vista. */
export function StickyCta() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  // MOTION-WEB.md piece 5: the arrow nudges once, 300 ms after the first entrance of the session.
  const [nudge, setNudge] = useState(false);
  const nudged = useRef(false);

  useEffect(() => {
    const propios = ref.current;
    const botones = Array.from(document.querySelectorAll<HTMLElement>(`a[href="${DIAGNOSTICO_HREF}"]`))// Sin los ocultos en esta pantalla (el botón de la barra de desktop) ni el propio.
      .filter((b) => !propios?.contains(b) && b.getClientRects().length > 0);
    if (!botones.length || typeof IntersectionObserver === "undefined") return;
    const primero = botones[0];
    const aLaVista = new Set<Element>();
    let primeroPaso = false;
    // Hide a little earlier, before another diagnostic button ends up under the bar (piece 5).
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) aLaVista.add(e.target);
        else aLaVista.delete(e.target);
        if (e.target === primero) primeroPaso = !e.isIntersecting && e.boundingClientRect.top < 0;
      }
      setVisible(primeroPaso && aLaVista.size === 0);
    }, { rootMargin: "0px 0px -80px 0px" });
    botones.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || nudged.current) return;
    nudged.current = true;
    const t = setTimeout(() => setNudge(true), 300);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div ref={ref} className={visible ? "nc-sticky-cta nc-only-mobile is-visible" : "nc-sticky-cta nc-only-mobile"} aria-hidden={!visible} inert={!visible}>
      <Button variant="accent" block href={DIAGNOSTICO_HREF} className={nudge ? "nc-nudge" : undefined}>
        {CTA_DIAGNOSTICO}
      </Button>
    </div>
  );
}
