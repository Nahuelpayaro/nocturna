"use client";

import { useEffect, useRef, useState } from "react";
import { CTA_DIAGNOSTICO, DIAGNOSTICO_HREF } from "@/lib/ccp/assets";
import { Button } from "./buttons";

/* Barra fija abajo, solo en mobile, con el botón al diagnóstico (auditoría mobile, L1).
   Aparece cuando el botón del hero ya pasó y no hay otro botón al diagnóstico a la vista. */
export function StickyCta() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const propios = ref.current;
    const botones = Array.from(document.querySelectorAll<HTMLElement>(`a[href="${DIAGNOSTICO_HREF}"]`))// Sin los ocultos en esta pantalla (el botón de la barra de desktop) ni el propio.
      .filter((b) => !propios?.contains(b) && b.getClientRects().length > 0);
    if (!botones.length || typeof IntersectionObserver === "undefined") return;
    const primero = botones[0];
    const aLaVista = new Set<Element>();
    let primeroPaso = false;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) aLaVista.add(e.target);
        else aLaVista.delete(e.target);
        if (e.target === primero) primeroPaso = !e.isIntersecting && e.boundingClientRect.top < 0;
      }
      setVisible(primeroPaso && aLaVista.size === 0);
    });
    botones.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={visible ? "nc-sticky-cta nc-only-mobile is-visible" : "nc-sticky-cta nc-only-mobile"} aria-hidden={!visible} inert={!visible}>
      <Button variant="accent" block href={DIAGNOSTICO_HREF}>
        {CTA_DIAGNOSTICO}
      </Button>
    </div>
  );
}
