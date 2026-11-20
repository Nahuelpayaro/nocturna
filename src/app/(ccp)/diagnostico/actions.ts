"use server";

import { randomUUID } from "node:crypto";
import { calcularDiagnostico, validarDiagnostico, validarInscripcion, type CampoDiagnostico, type CampoInscripcion, type DiagnosticoInput } from "@/lib/ccp/diagnostico";
import { sanearAtribucion } from "@/lib/ccp/medicion";
import { errorParaLog, guardarInscripto } from "@/lib/ccp/servidor";
import { isoBuenosAires, type WaitlistRecord } from "@/lib/ccp/waitlist-store";

export type JoinWaitlistInput = {
  nombre: string;
  inmobiliaria: string;
  whatsapp: string;
  mail: string;
  acepta: boolean;
  respuestas: DiagnosticoInput;
  /** Primer toque guardado en el navegador (UTM, fbclid sí/no, referrer). Se sanea acá. */
  atribucion: unknown;
  /** Navegador del equipo (?interno=1). */
  interno: boolean;
  /** id de la inscripción anterior cuando el dueño corrige su número. */
  corrige: string | null;
};

export type JoinWaitlistResult =
  | { ok: true; id: string }
  | { ok: false; reason: "duplicate" | "invalid" | "error"; fieldErrors?: Partial<Record<CampoInscripcion | CampoDiagnostico, string>> };

const str = (v: unknown): string => (typeof v === "string" ? v : "");

/** Anota al dueño en la lista de espera. Vuelve a validar y a calcular todo: no confía en el cliente. */
export async function joinWaitlist(input: JoinWaitlistInput): Promise<JoinWaitlistResult> {
  try {
    const raw = (input ?? {}) as Partial<JoinWaitlistInput>;
    const r = (raw.respuestas ?? {}) as Partial<DiagnosticoInput>;
    const diagnostico = validarDiagnostico({
      consultas: str(r.consultas),
      periodo: str(r.periodo),
      visitas: str(r.visitas),
      operaciones: str(r.operaciones),
      comision: str(r.comision),
      moneda: str(r.moneda),
      respondeATiempo: str(r.respondeATiempo),
    });
    const inscripcion = validarInscripcion({ nombre: str(raw.nombre), inmobiliaria: str(raw.inmobiliaria), whatsapp: str(raw.whatsapp), mail: str(raw.mail), acepta: raw.acepta === true });
    if (!diagnostico.ok || !inscripcion.ok) {
      return {
        ok: false,
        reason: "invalid",
        fieldErrors: { ...(diagnostico.ok ? {} : diagnostico.errores), ...(inscripcion.ok ? {} : inscripcion.errores) },
      };
    }

    const a = diagnostico.respuestas;
    const result = calcularDiagnostico(a);
    const record: WaitlistRecord = {
      id: randomUUID(),
      createdAt: isoBuenosAires(new Date()),
      ...inscripcion.datos,
      answers: { ...a },
      result: { valorConsulta: Math.round(result.valorConsulta), expuestas: Math.round(result.expuestas), escala: Math.round(result.escala) },
      ...sanearAtribucion(raw.atribucion),
      interno: raw.interno === true,
    };

    // Guarda (Supabase o memoria), avisa por Telegram y marca notificado.
    const saved = await guardarInscripto(record, str(raw.corrige) || null);
    if (saved === "duplicate") return { ok: false, reason: "duplicate" };
    // Producción sin Supabase: se muestra el error de envío, nunca se pierde en silencio.
    if (saved === "sin-config") return { ok: false, reason: "error" };
    return { ok: true, id: record.id };
  } catch (e) {
    console.error(`[ccp] No se guardó la inscripción: ${errorParaLog(e)}`);
    return { ok: false, reason: "error" };
  }
}
