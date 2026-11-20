import { ProgressRail } from "@/components/ProgressRail";
import { Hero } from "@/components/Hero";
import { Servicios } from "@/components/Servicios";
import { Proyectos } from "@/components/Proyectos";
import { Proceso } from "@/components/Proceso";
import { FAQ } from "@/components/FAQ";
import { Contacto } from "@/components/Contacto";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <ProgressRail />
      <main className="flex-1">
        <Hero />
        <Servicios />
        <Proyectos />
        <Proceso />
        <FAQ />
        <Contacto />
      </main>
      <Footer />
    </>
  );
}
