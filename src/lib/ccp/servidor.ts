// Conexión de la lista de espera y del conteo con las variables de entorno. Solo en el servidor
// (Server Action y Route Handlers): las claves no tienen NEXT_PUBLIC_ y nunca llegan al navegador.
// Los logs nunca llevan datos de la persona: solo el tipo de falla.
import { createMemoryEventStore, type EventStore } from "./conteo";
import { createPostgrest, createSupabaseEventStore, createSupabaseWaitlistStore, SupabaseError } from "./supabase";
import { enviarTelegram, mensajeInscripto } from "./telegram";
import { createMemoryStore, elegirBackend, inscribir, type WaitlistRecord, type WaitlistStore } from "./waitlist-store";

type Backend = { waitlist: WaitlistStore; eventos: EventStore };

// En globalThis: la Server Action y los Route Handlers pueden cargar este módulo por separado.
const g = globalThis as typeof globalThis & { __ccpMemoria?: Backend; __ccpAvisos?: Set<string> };

function avisarUnaVez(clave: string, mensaje: string) {
  g.__ccpAvisos ??= new Set();
  if (g.__ccpAvisos.has(clave)) return;
  g.__ccpAvisos.add(clave);
  console.warn(`[ccp] ${mensaje}`);
}

export const esProduccion = () => process.env.VERCEL_ENV === "production";

/** null en producción sin Supabase configurado: no se guarda nada en memoria. */
export function backend(): Backend | null {
  const env = process.env;
  switch (elegirBackend({ SUPABASE_URL: env.SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY, VERCEL_ENV: env.VERCEL_ENV })) {
    case "supabase": {
      const pg = createPostgrest({ url: env.SUPABASE_URL!, key: env.SUPABASE_SERVICE_ROLE_KEY! });
      return { waitlist: createSupabaseWaitlistStore(pg), eventos: createSupabaseEventStore(pg) };
    }
    case "sin-config":
      avisarUnaVez("sin-config", "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en producción: no se guarda nada.");
      return null;
    default:
      avisarUnaVez("memoria", "Sin SUPABASE_URL ni SUPABASE_SERVICE_ROLE_KEY: inscriptos y eventos se guardan en memoria y se pierden al reiniciar.");
      g.__ccpMemoria ??= { waitlist: createMemoryStore(), eventos: createMemoryEventStore() };
      return g.__ccpMemoria;
  }
}

/** Aviso por Telegram al grupo de Nahuel y Camila. true si salió. */
export async function avisarInscripto(record: WaitlistRecord, correccion: boolean): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    avisarUnaVez("telegram", "Sin TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID: no se avisa por Telegram.");
    return false;
  }
  const ok = await enviarTelegram({ token, chatId, texto: mensajeInscripto(record, { produccion: esProduccion(), correccion }) });
  if (!ok) console.error("[ccp] No salió el aviso por Telegram; la inscripción queda con notificado = false.");
  return ok;
}

/** Guarda, avisa y marca notificado. "sin-config" si no hay dónde guardar (producción sin Supabase). */
export async function guardarInscripto(record: WaitlistRecord, replaces: string | null): Promise<"ok" | "duplicate" | "sin-config"> {
  const b = backend();
  if (!b) return "sin-config";
  return inscribir(record, replaces, { store: b.waitlist, avisar: avisarInscripto });
}

/** Descripción de un error apta para logs (sin datos de la fila). */
export function errorParaLog(e: unknown): string {
  if (e instanceof SupabaseError) return e.message;
  return e instanceof Error ? e.name : "error";
}
