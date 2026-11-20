"use client";

import { useId, useState, type ReactNode } from "react";
import { cx } from "@/lib/ccp/assets";
import { Icon } from "./brand";

const DEFAULT_FAQ_QUESTION = "¿Tengo que cambiar el sistema que uso hoy?";
const DEFAULT_FAQ_ANSWER =
  "No. Nos conectamos a tus canales y trabajamos con lo que ya tenés. Si usás un sistema que registra las consultas, lo seguimos usando: nosotros respondemos y hacemos el seguimiento.";

export function FaqItem({ question = DEFAULT_FAQ_QUESTION, answer = DEFAULT_FAQ_ANSWER, defaultOpen = false }: { question?: ReactNode; answer?: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={cx("nc-faq", open && "is-open")}>
      <button type="button" className="nc-faq__q" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <span className="nc-t-body-l-strong">{question}</span>
        <Icon name={open ? "minus" : "plus"} />
      </button>
      <p id={id} className="nc-faq__a nc-t-body-l nc-muted" hidden={!open}>
        {answer}
      </p>
    </div>
  );
}

export function DeliverableItem({ number, title, text, defaultOpen = false }: { number: string; title: ReactNode; text: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={cx("nc-deliv", open && "is-open")}>
      <span className="nc-t-data-l nc-deliv__num">{number}</span>
      <div className="nc-deliv__content">
        <button type="button" className="nc-deliv__title nc-t-title" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
          {title}
        </button>
        <p id={id} className="nc-t-body-l nc-muted" hidden={!open}>
          {text}
        </p>
      </div>
      <button type="button" className="nc-deliv__icon" aria-label={open ? "Cerrar" : "Abrir"} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <Icon name={open ? "minus" : "plus"} />
      </button>
    </div>
  );
}
