// Conteo propio de los 4 eventos (EVENTOS-LANDING, secciones 3 y 8.2): guardado de eventos,
// conteo por día de Buenos Aires y por utm_content, y el CSV para Growth.
// Solo node:crypto y tipos: node --test lo carga directo.
import { createHash, timingSafeEqual } from "node:crypto";
import type { Evento, EventoRow } from "./medicion";

export type FilaConteo = { day: string; utm_content: string | null; event: string; count: number };

export interface EventStore {
  /** Ignora el mismo evento repetido en la misma sesión. */
  add(evento: EventoRow): Promise<void>;
  /** Conteo por día y utm_content, sin las visitas internas (vista ccp_daily_counts). */
  conteo(): Promise<FilaConteo[]>;
}

type EventoGuardado = { created_at: string; utm_content: string | null; event: Evento | string; interno: boolean };

const diaBuenosAires = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit" });

/** Lo mismo que la vista ccp_daily_counts, para el guardado en memoria. */
export function contarEventos(eventos: EventoGuardado[]): FilaConteo[] {
  const filas = new Map<string, FilaConteo>();
  for (const e of eventos) {
    if (e.interno) continue;
    const day = diaBuenosAires.format(new Date(e.created_at));
    const clave = JSON.stringify([day, e.utm_content, e.event]);
    const f = filas.get(clave) ?? { day, utm_content: e.utm_content, event: e.event, count: 0 };
    f.count++;
    filas.set(clave, f);
  }
  const orden = (f: FilaConteo) => `${f.day}\u0000${f.utm_content ?? ""}\u0000${f.event}`;
  return [...filas.values()].sort((a, b) => (orden(a) < orden(b) ? -1 : orden(a) > orden(b) ? 1 : 0));
}

export function createMemoryEventStore(): EventStore {
  const eventos = new Map<string, EventoRow & { created_at: string }>();
  return {
    async add(evento) {
      const clave = `${evento.session_id}:${evento.event}`;
      if (!eventos.has(clave)) eventos.set(clave, { ...evento, created_at: new Date().toISOString() });
    },
    async conteo() {
      return contarEventos([...eventos.values()]);
    },
  };
}

function celda(v: string | number | null): string {
  let s = v === null ? "" : String(v);
  // Una celda que empieza con = + - @ la planilla la toma como fórmula.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function conteoCsv(filas: FilaConteo[]): string {
  const lineas = [["day", "utm_content", "event", "count"], ...filas.map((f) => [f.day, f.utm_content, f.event, f.count])];
  return lineas.map((l) => l.map(celda).join(",") + "\r\n").join("");
}

/** Compara en tiempo constante (hash de los dos lados, así el largo tampoco se filtra). */
export function tokenValido(recibido: string | null, esperado: string | undefined): boolean {
  if (!recibido || !esperado) return false;
  const h = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(h(recibido), h(esperado));
}
