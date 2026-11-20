import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SvgDefs } from "@/components/ccp/brand";
import { Medicion } from "@/components/ccp/medicion";
import "./ccp.css";

// Tipografías del design system de nocturna (licencia solo para nocturna).
const clash = localFont({
  src: "./fonts/ClashDisplay-Semibold.woff2",
  weight: "600",
  variable: "--nc-font-clash",
  display: "swap",
});

const magnetik = localFont({
  src: [
    { path: "./fonts/Magnetik-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Magnetik-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--nc-font-magnetik",
  display: "swap",
});

const comico = localFont({
  src: "./fonts/Comico-Regular.woff2",
  weight: "400",
  variable: "--nc-font-comico",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Cero Consultas Perdidas - nocturna",
  description:
    "Respondemos cada consulta de tu inmobiliaria en minutos y la seguimos hasta la visita, sin que tengas que estar encima. Lo opera nocturna.",
  // Fase 1: vista previa para Nahuel. Se indexa recién con el OK para producción.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f7f6f3",
};

export default function CcpLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`nc-root ${clash.variable} ${magnetik.variable} ${comico.variable}`}>
      <body>
        <SvgDefs />
        {children}
        <Medicion />
      </body>
    </html>
  );
}
