// Guardado de la lista de espera: la interfaz, el guardado en memoria (se pierde al reiniciar el
// servidor), la elección entre Supabase y memoria, y el aviso después de guardar.
// Supabase está en supabase.ts y la conexión con las variables de entorno en servidor.ts.
import type { Moneda, Resultado } from "./diagnostico";

export type WaitlistRecord = {
  id: string;
  /** ISO 8601 con la zona de Buenos Aires (-03:00). */
  createdAt: string;
  nombre: string;
  inmobiliaria: string;
  /** E.164, +549 y 10 dígitos. Clave para detectar el número repetido. */
  whatsapp: string;
  answers: { consultasMes: number; visitasMes: number; operacionesMes: number; comision: number; moneda: Moneda; respondeATiempo: number };
  result: Resultado;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  fbclid: boolean;
  referrer: string | null;
  /** Navegador del equipo (?interno=1, EVENTOS-LANDING sección 6). */
  interno: boolean;
};

export interface WaitlistStore {
  /**
   * "duplicate" si el número ya estaba anotado; no lo pisa. Con replaces (id de la inscripción
   * anterior, cuando el dueño corrige su número) la reemplaza solo si el número nuevo está libre.
   */
  add(record: WaitlistRecord, replaces?: string | null): Promise<"ok" | "duplicate">;
  count(): Promise<number>;
  /** El aviso por Telegram salió (columna notificado). */
  markNotified(id: string): Promise<void>;
}

/** Argentina no tiene horario de verano: siempre -03:00. */
export function isoBuenosAires(date: Date): string {
  return new Date(date.getTime() - 3 * 60 * 60 * 1000).toISOString().replace("Z", "-03:00");
}

export function createMemoryStore(): WaitlistStore {
  const byWhatsapp = new Map<string, WaitlistRecord>();
  const notificados = new Set<string>();
  return {
    async add(record, replaces) {
      const existing = byWhatsapp.get(record.whatsapp);
      if (existing && (!replaces || existing.id !== replaces)) return "duplicate";
      if (replaces) {
        for (const [key, r] of byWhatsapp) if (r.id === replaces) byWhatsapp.delete(key);
      }
      byWhatsapp.set(record.whatsapp, record);
      return "ok";
    },
    async count() {
      return byWhatsapp.size;
    },
    async markNotified(id) {
      notificados.add(id);
    },
  };
}

type EnvGuardado = { SUPABASE_URL?: string; SUPABASE_SERVICE_ROLE_KEY?: string; VERCEL_ENV?: string };

/**
 * Supabase si están la URL y la clave. Si faltan: memoria en local y en vistas previas, pero en
 * producción "sin-config", para que la inscripción falle a la vista y no se pierda en memoria.
 */
export function elegirBackend(env: EnvGuardado): "supabase" | "memoria" | "sin-config" {
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) return "supabase";
  return env.VERCEL_ENV === "production" ? "sin-config" : "memoria";
}

/**
 * Guarda y, si quedó guardado, avisa (Telegram) y marca notificado. El aviso nunca hace fallar
 * la inscripción: si no sale, notificado queda en false para verlo en la tabla.
 */
export async function inscribir(
  record: WaitlistRecord,
  replaces: string | null,
  deps: { store: WaitlistStore; avisar: (record: WaitlistRecord, correccion: boolean) => Promise<boolean> },
): Promise<"ok" | "duplicate"> {
  const saved = await deps.store.add(record, replaces);
  if (saved !== "ok") return saved;
  let avisado = false;
  try {
    avisado = await deps.avisar(record, Boolean(replaces));
  } catch {
    avisado = false;
  }
  if (avisado) {
    try {
      await deps.store.markNotified(record.id);
    } catch {
      // Queda notificado = false aunque el aviso salió; no cambia la inscripción.
    }
  }
  return "ok";
}
