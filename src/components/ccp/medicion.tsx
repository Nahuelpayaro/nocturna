"use client";

// Va en el layout de (ccp): funnel_visit en la primera página del embudo de la sesión y, solo
// si corresponde (id cargado, producción, navegador no interno), la librería del píxel de Meta.
import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { PIXEL_SRC, pixelPermitido, track } from "@/lib/ccp/track";

const sinCambios = () => () => {};

export function Medicion() {
  const pathname = usePathname();
  const conPixel = useSyncExternalStore(sinCambios, pixelPermitido, () => false);

  useEffect(() => {
    track("funnel_visit", { entry_page: pathname });
  }, [pathname]);

  return conPixel ? <Script id="meta-pixel" src={PIXEL_SRC} strategy="afterInteractive" /> : null;
}
