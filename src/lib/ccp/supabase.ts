// Supabase por PostgREST con fetch (sin dependencias). Solo en el servidor: usa la clave
// service_role, que saltea RLS; las tablas no tienen políticas, así que nadie más lee ni escribe.
// Tablas y vista: supabase/migrations/20261114000000_ccp.sql. Solo tipos: node --test lo carga directo.
import type { EventStore, FilaConteo } from "./conteo";
import type { WaitlistRecord, WaitlistStore } from "./waitlist-store";

export type Postgrest = (method: string, path: string, opts?: { body?: unknown; prefer?: string }) => Promise<Response>;

export function createPostgrest(o: { url: string; key: string; fetch?: typeof fetch }): Postgrest {
  const base = o.url.replace(/\/+$/, "") + "/rest/v1/";
  const f = o.fetch ?? fetch;
  // Las claves nuevas (sb_secret_…) van solo en apikey; las legacy (JWT) también como Bearer.
  const auth: Record<string, string> = o.key.startsWith("sb_") ? { apikey: o.key } : { apikey: o.key, Authorization: `Bearer ${o.key}` };
  return (method, path, opts = {}) =>
    f(base + path, {
      method,
      headers: { ...auth, "Content-Type": "application/json", ...(opts.prefer ? { Prefer: opts.prefer } : {}) },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
}

/** Error de Supabase sin el cuerpo de la fila: en los logs no van datos personales. */
export class SupabaseError extends Error {
  readonly status: number;
  readonly code: string | null;
  constructor(status: number, code: string | null) {
    super(`Supabase respondió ${status}${code ? ` (${code})` : ""}`);
    this.status = status;
    this.code = code;
  }
}

async function codigo(res: Response): Promise<string | null> {
  const body = (await res.json().catch(() => null)) as { code?: unknown } | null;
  return typeof body?.code === "string" ? body.code : null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fila(r: WaitlistRecord) {
  return {
    id: r.id,
    created_at: r.createdAt,
    nombre: r.nombre,
    inmobiliaria: r.inmobiliaria,
    whatsapp: r.whatsapp,
    mail: r.mail,
    consultas_mes: r.answers.consultasMes,
    visitas_mes: r.answers.visitasMes,
    operaciones_mes: r.answers.operacionesMes,
    comision: r.answers.comision,
    moneda: r.answers.moneda,
    responde_a_tiempo: r.answers.respondeATiempo,
    valor_consulta: r.result.valorConsulta,
    expuestas: r.result.expuestas,
    escala: r.result.escala,
    utm_source: r.utm_source,
    utm_medium: r.utm_medium,
    utm_campaign: r.utm_campaign,
    utm_content: r.utm_content,
    fbclid: r.fbclid,
    referrer: r.referrer,
    interno: r.interno,
    notificado: false,
  };
}

export function createSupabaseWaitlistStore(pg: Postgrest): WaitlistStore {
  const tabla = "ccp_waitlist";
  /** 409 con 23505: el WhatsApp ya está anotado. */
  const repetido = async (res: Response) => {
    if (res.status !== 409) throw new SupabaseError(res.status, await codigo(res));
    const c = await codigo(res);
    if (c !== "23505") throw new SupabaseError(res.status, c);
    return "duplicate" as const;
  };
  return {
    async add(record, replaces) {
      if (replaces && UUID.test(replaces)) {
        // Corrección del número: la misma fila pasa a tener los datos y el id nuevos (la hora de
        // inscripción queda); si el número nuevo ya es de otro, falla por el único y no se toca nada.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { created_at, ...cambios } = fila(record);
        const res = await pg("PATCH", `${tabla}?id=eq.${replaces}`, { body: cambios, prefer: "return=representation" });
        if (!res.ok) return repetido(res);
        const filas = (await res.json().catch(() => [])) as unknown[];
        if (Array.isArray(filas) && filas.length > 0) return "ok";
      }
      const res = await pg("POST", tabla, { body: fila(record), prefer: "return=minimal" });
      if (!res.ok) return repetido(res);
      return "ok";
    },
    async count() {
      const res = await pg("HEAD", `${tabla}?select=id`, { prefer: "count=exact" });
      if (!res.ok) throw new SupabaseError(res.status, null);
      return Number(res.headers.get("content-range")?.split("/")[1] ?? 0);
    },
    async markNotified(id) {
      const res = await pg("PATCH", `${tabla}?id=eq.${id}`, { body: { notificado: true }, prefer: "return=minimal" });
      if (!res.ok) throw new SupabaseError(res.status, await codigo(res));
    },
  };
}

export function createSupabaseEventStore(pg: Postgrest): EventStore {
  return {
    async add(evento) {
      const q = new URLSearchParams({ on_conflict: "session_id,event" });
      const res = await pg("POST", `ccp_events?${q}`, { body: evento, prefer: "resolution=ignore-duplicates,return=minimal" });
      // 409: el mismo evento de la misma sesión ya estaba contado.
      if (!res.ok && res.status !== 409) throw new SupabaseError(res.status, await codigo(res));
    },
    async conteo() {
      const q = new URLSearchParams({ select: "day,utm_content,event,count", order: "day.asc,utm_content.asc,event.asc" });
      const res = await pg("GET", `ccp_daily_counts?${q}`);
      if (!res.ok) throw new SupabaseError(res.status, await codigo(res));
      return (await res.json()) as FilaConteo[];
    },
  };
}
