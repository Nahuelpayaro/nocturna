"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DIAGNOSTICO_HREF, NAV_LINKS } from "@/lib/ccp/assets";
import { CcpLockup, Wordmark } from "./brand";
import { Button, IconButton } from "./buttons";

export type NavBarProps = {
  logo?: "ccp" | "wordmark";
  showCta?: boolean;
  /** Links de la barra. Por defecto, las anclas de la landing. */
  links?: Array<[string, string]>;
  /** Destino del logo. Por defecto /. */
  homeHref?: string;
};

export function NavBar({ logo = "ccp", showCta = true, links = NAV_LINKS, homeHref = "/" }: NavBarProps) {
  const [open, setOpen] = useState(false);
  const logoNode = (
    <Link href={homeHref} className="nc-lockup" aria-label={logo === "wordmark" ? "nocturna" : "Cero Consultas Perdidas"}>
      {logo === "wordmark" ? <Wordmark height={24} /> : <CcpLockup />}
    </Link>
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header className="nc-nav">
        {logoNode}
        {links.length ? (
          <nav className="nc-nav__links" aria-label="Secciones">
            {links.map(([label, href]) => (
              <a key={href} href={href} className="nc-t-label-m">
                {label}
              </a>
            ))}
          </nav>
        ) : null}
        {showCta ? (
          <Button variant="accent" size="s" href={DIAGNOSTICO_HREF} className="nc-nav__cta">
            Pedí tu diagnóstico
          </Button>
        ) : null}
        <IconButton variant="secondary" icon="menu-2" label="Abrir menú" expanded={open} controls="nc-nav-menu" onClick={() => setOpen(true)} className="nc-nav__menu" />
      </header>
      {open ? (
        <div id="nc-nav-menu" className="nc-nav-open nc-paper" role="dialog" aria-modal="true" aria-label="Menú">
          <div className="nc-nav-open__top">
            {logoNode}
            <IconButton variant="secondary" icon="x" label="Cerrar menú" expanded onClick={() => setOpen(false)} />
          </div>
          <nav className="nc-nav-open__links" aria-label="Secciones">
            {links.map(([label, href]) => (
              <a key={href} href={href} className="nc-t-display-l" onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
          </nav>
          {showCta ? (
            <div className="nc-nav-open__actions">
              <Button variant="accent" block href={DIAGNOSTICO_HREF}>
                Pedí tu diagnóstico
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
