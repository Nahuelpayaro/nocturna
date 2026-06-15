"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { isConfigured, siteConfig } from "@/lib/site-config";
import { services } from "@/lib/content";
import { EASE } from "@/lib/motion";
import { WhatsAppButton } from "./WhatsAppButton";
import { Magnetic } from "./Magnetic";

type Status = "idle" | "sending" | "sent" | "error" | "unconfigured";

/**
 * Contacto — the closing scene. Framed like the rest of the experience (amber
 * eyebrow, a big title that announces itself, staggered entrance) rather than a
 * flat panel with a glow. Two paths: WhatsApp (primary) and a form fully wired
 * to `siteConfig.formEndpoint` — while that is a TODO it stays usable and points
 * to WhatsApp on submit. No contact data is hardcoded; it all comes from
 * siteConfig. Amber stays an accent (button, focus), never a background wash.
 */
export function Contacto() {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<Status>("idle");

  const headerContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.14 } },
  };
  const headerItem: Variants = reduce
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 48 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
      };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    if (!isConfigured(siteConfig.formEndpoint)) {
      console.warn(
        "[nocturna] formEndpoint not set — complete `formEndpoint` in siteConfig to activate the form.",
      );
      setStatus("unconfigured");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch(siteConfig.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      form.reset();
      setStatus("sent");
    } catch (error) {
      console.error("[nocturna] form submit failed", error);
      setStatus("error");
    }
  }

  const inputClass =
    "w-full border-b border-gris-sutil bg-transparent py-3 text-hueso placeholder:text-gris/60 transition-colors duration-300 focus:border-ambar focus:outline-none";

  return (
    <section
      id="contacto"
      className="scroll-mt-20 border-t border-gris-sutil px-6 py-28 sm:py-36"
    >
      <div className="mx-auto max-w-6xl">
        {/* Framed close — announces itself like the other scenes. */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerContainer}
          className="mb-16 max-w-3xl sm:mb-20"
        >
          <motion.p
            variants={headerItem}
            className="mb-5 font-mono text-xs uppercase tracking-[0.45em] text-ambar"
          >
            contacto
          </motion.p>
          <motion.h2
            variants={headerItem}
            className="font-display text-5xl font-bold leading-[0.92] tracking-tight text-hueso sm:text-7xl lg:text-8xl"
          >
            Trabajemos juntos
          </motion.h2>
          <motion.p
            variants={headerItem}
            className="mt-6 max-w-xl text-lg leading-relaxed text-gris"
          >
            Contanos qué tenés en mente. Respondemos en menos de 24 horas.
          </motion.p>
        </motion.div>

        {/* Body: WhatsApp + form */}
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-16"
        >
          {/* Primary path: WhatsApp */}
          <div className="flex flex-col gap-6">
            <p className="font-display text-2xl font-light leading-snug text-hueso">
              La forma más directa es un mensaje.
            </p>
            <div>
              <Magnetic className="inline-block">
                <WhatsAppButton className="inline-flex items-center justify-center rounded-full bg-ambar px-8 py-4 text-sm font-medium tracking-wide text-noche transition-[filter] duration-300 ease-out hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                  Escribinos por WhatsApp
                </WhatsAppButton>
              </Magnetic>
            </div>
            {isConfigured(siteConfig.email) && (
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-sm text-gris transition-colors duration-200 hover:text-hueso"
              >
                {siteConfig.email}
              </a>
            )}
          </div>

          {/* Secondary path: form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-gris">
                Nombre
                <input
                  name="nombre"
                  type="text"
                  required
                  autoComplete="name"
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-gris">
                Negocio o empresa
                <input
                  name="negocio"
                  type="text"
                  autoComplete="organization"
                  className={inputClass}
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm text-gris">
              Email o teléfono
              <input
                name="contacto"
                type="text"
                required
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-gris">
              ¿Qué servicio te interesa?
              <select
                name="servicio"
                defaultValue=""
                className={`${inputClass} cursor-pointer`}
              >
                <option value="" disabled>
                  Elegí una opción
                </option>
                {services.map((service) => (
                  <option
                    key={service.title}
                    value={service.title}
                    className="bg-noche text-hueso"
                  >
                    {service.title}
                  </option>
                ))}
                <option value="Otro" className="bg-noche text-hueso">
                  Otro
                </option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm text-gris">
              Mensaje
              <textarea
                name="mensaje"
                rows={4}
                required
                className={`${inputClass} resize-none`}
              />
            </label>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex items-center justify-center rounded-full border border-hueso/20 px-8 py-4 text-sm font-medium tracking-wide text-hueso transition-[transform,background-color,border-color] duration-300 ease-out hover:scale-[1.03] hover:border-ambar hover:bg-ambar/10 active:scale-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? "Enviando…" : "Enviar mensaje"}
              </button>

              {/* Submit feedback — live region for screen readers. */}
              <p aria-live="polite" className="text-sm">
                {status === "sent" && (
                  <span className="text-ambar">¡Gracias! Te respondemos pronto.</span>
                )}
                {status === "error" && (
                  <span className="text-gris">
                    No se pudo enviar. Probá por WhatsApp.
                  </span>
                )}
                {status === "unconfigured" && (
                  <span className="text-gris">
                    El formulario estará activo pronto — mientras tanto,
                    escribinos por WhatsApp.
                  </span>
                )}
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
