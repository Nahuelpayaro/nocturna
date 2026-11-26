import type { Metadata } from "next";
import { Footer, NavBar } from "@/components/ccp";
import { DiagnosticoFlow } from "./diagnostico-flow";

export const metadata: Metadata = {
  // PROVISORIO: título de la pestaña.
  title: "Diagnóstico gratuito - Cero Consultas Perdidas",
};

// Página de destino de los anuncios: sin menú ni links a la landing, para que no haya salidas
// antes de completar (auditoría mobile, D5). El logo sigue llevando a /.
export default function DiagnosticoPage() {
  return (
    <div className="nc-landing nc-paper">
      <NavBar showCta={false} showMenu={false} links={[]} />
      <DiagnosticoFlow />
      <Footer showCta={false} compact />
    </div>
  );
}
