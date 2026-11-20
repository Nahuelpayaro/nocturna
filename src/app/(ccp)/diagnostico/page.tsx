import type { Metadata } from "next";
import { Footer, NavBar } from "@/components/ccp";
import { NAV_LINKS } from "@/lib/ccp/assets";
import { DiagnosticoFlow } from "./diagnostico-flow";

export const metadata: Metadata = {
  // PROVISORIO: título de la pestaña.
  title: "Diagnóstico gratuito - Cero Consultas Perdidas",
};

// Las anclas de la barra y del pie apuntan a la landing.
const LINKS = NAV_LINKS.map(([label, href]): [string, string] => [label, `/${href}`]);

export default function DiagnosticoPage() {
  return (
    <div className="nc-landing nc-paper">
      <NavBar showCta={false} links={LINKS} />
      <DiagnosticoFlow />
      <Footer showCta={false} links={LINKS} />
    </div>
  );
}
