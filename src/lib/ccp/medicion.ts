// Medición de la landing de CCP: atribución del primer toque, navegador interno, sesión y la
// validación del evento en el servidor. Fuente: Transfers/nocturna-medicion/EVENTOS-LANDING.md,
// secciones 1, 2, 3, 5 y 6. Nada personal pasa por acá: solo UTM, fbclid (sí/no) y referrer.
// Sin imports a propósito: node --test lo carga directo (sintaxis TypeScript borrable).

export const EVENTOS = ["funnel_visit", "diagnostic_start", "diagnostic_complete", "waitlist_signup"] as const;
export type Evento = (typeof EVENTOS)[number];

/** Primeras páginas del embudo (propiedad entry_page de funnel_visit). */
export const PAGINAS_EMBUDO = ["/", "/diagnostico"] as const;

export type Atribucion = {
  utm_source: string;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  fbclid: boolean;
  referrer: string | null;
};

/** Fila de ccp_events, tal como la valida el servidor. */
export type EventoRow = Atribucion & {
  event: Evento;
  session_id: string;
  entry_page: string | null;
  event_id: string | null;
  interno: boolean;
};

/** Lo mínimo de localStorage / sessionStorage que se usa. */
export type Almacen = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const CLAVES = {
  atribucion: "ccp_atribucion",
  interno: "ccp_interno",
  sesion: "ccp_sesion",
  evento: (e: Evento) => `ccp_evento_${e}`,
} as const;

const VIGENCIA_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_UTM = 100;
const MAX_REFERRER = 300;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const esUuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v);

/** Para cuando el navegador bloquea el storage (o en tests). */
export function memoriaStorage(): Almacen {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
  };
}

function leer(s: Almacen, k: string): string | null {
  try {
    return s.getItem(k);
  } catch {
    return null;
  }
}

function escribir(s: Almacen, k: string, v: string | null) {
  try {
    if (v === null) s.removeItem(k);
    else s.setItem(k, v);
  } catch {
    // Storage lleno o bloqueado: se sigue sin guardar.
  }
}

/** Texto corto o null: sin caracteres de control, recortado. */
function texto(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
  return s || null;
}

/** Solo origen + ruta: la query o el hash de otro sitio pueden traer datos de la persona. */
export function limpiarReferrer(v: unknown): string | null {
  const s = texto(v, 2000);
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return (u.origin + u.pathname).slice(0, MAX_REFERRER);
  } catch {
    return null;
  }
}

function deUrl(search: string, referrer: string): Atribucion {
  const p = new URLSearchParams(search);
  return {
    utm_source: texto(p.get("utm_source"), MAX_UTM) ?? "directo",
    utm_medium: texto(p.get("utm_medium"), MAX_UTM),
    utm_campaign: texto(p.get("utm_campaign"), MAX_UTM),
    utm_content: texto(p.get("utm_content"), MAX_UTM),
    fbclid: Boolean(p.get("fbclid")),
    referrer: limpiarReferrer(referrer),
  };
}

/** Atribución saneada de cualquier valor (lo guardado en el navegador o lo que manda el formulario). */
export function sanearAtribucion(raw: unknown): Atribucion {
  const o = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  return {
    utm_source: texto(o.utm_source, MAX_UTM) ?? "directo",
    utm_medium: texto(o.utm_medium, MAX_UTM),
    utm_campaign: texto(o.utm_campaign, MAX_UTM),
    utm_content: texto(o.utm_content, MAX_UTM),
    fbclid: o.fbclid === true,
    referrer: limpiarReferrer(o.referrer),
  };
}

/**
 * Primer toque, 30 días: si hay una atribución guardada y vigente, gana esa; si no, se guarda
 * la de esta carga (search = location.search, referrer = document.referrer).
 */
export function resolverAtribucion(local: Almacen, search: string, referrer: string, ahora: number): Atribucion {
  const guardada = leer(local, CLAVES.atribucion);
  if (guardada) {
    try {
      const o = JSON.parse(guardada) as Record<string, unknown>;
      const vigente = typeof o.ts === "number" && ahora - o.ts <= VIGENCIA_MS && ahora >= o.ts;
      const valida = (["utm_source", "utm_medium", "utm_campaign", "utm_content", "referrer"] as const).every((k) => o[k] === null || typeof o[k] === "string");
      if (vigente && valida && typeof o.utm_source === "string" && typeof o.fbclid === "boolean") return sanearAtribucion(o);
    } catch {
      // Guardado roto: se reemplaza.
    }
  }
  const nueva = deUrl(search, referrer);
  escribir(local, CLAVES.atribucion, JSON.stringify({ ...nueva, ts: ahora }));
  return nueva;
}

/** ?interno=1 marca el navegador del equipo; ?interno=0 lo desmarca. Devuelve si es interno. */
export function actualizarInterno(local: Almacen, search: string): boolean {
  const v = new URLSearchParams(search).get("interno");
  if (v === "1") escribir(local, CLAVES.interno, "1");
  if (v === "0") escribir(local, CLAVES.interno, null);
  const guardado = leer(local, CLAVES.interno);
  return guardado === "1" || (guardado === null && v === "1");
}

/** Id de la sesión del navegador (sessionStorage); se crea la primera vez. */
export function idDeSesion(sesion: Almacen, nuevoId: () => string): string {
  const actual = leer(sesion, CLAVES.sesion);
  if (esUuid(actual)) return actual;
  const id = nuevoId();
  escribir(sesion, CLAVES.sesion, id);
  return id;
}

/** true solo la primera vez que se pide el evento en esta sesión. */
export function primeraVezEnSesion(sesion: Almacen, evento: Evento): boolean {
  const clave = CLAVES.evento(evento);
  if (leer(sesion, clave)) return false;
  escribir(sesion, clave, "1");
  return true;
}

const CAMPOS_EVENTO = new Set(["event", "session_id", "entry_page", "event_id", "utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid", "referrer", "interno"]);
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

/** Valida el cuerpo que llega a /api/ccp/evento. Rechaza campos de más: nada personal entra por acá. */
export function validarEvento(raw: unknown): { ok: true; evento: EventoRow } | { ok: false } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false };
  const o = raw as Record<string, unknown>;
  if (Object.keys(o).some((k) => !CAMPOS_EVENTO.has(k))) return { ok: false };
  const event = o.event;
  if (typeof event !== "string" || !(EVENTOS as readonly string[]).includes(event)) return { ok: false };
  if (!esUuid(o.session_id)) return { ok: false };
  if (UTM.some((k) => o[k] !== undefined && o[k] !== null && typeof o[k] !== "string")) return { ok: false };
  if (o.referrer !== undefined && o.referrer !== null && typeof o.referrer !== "string") return { ok: false };
  if ((o.fbclid !== undefined && typeof o.fbclid !== "boolean") || (o.interno !== undefined && typeof o.interno !== "boolean")) return { ok: false };

  const conPagina = event === "funnel_visit";
  const entry = o.entry_page ?? null;
  if (conPagina ? !(PAGINAS_EMBUDO as readonly unknown[]).includes(entry) : entry !== null) return { ok: false };
  const conId = event === "waitlist_signup";
  const eventId = o.event_id ?? null;
  if (conId ? !esUuid(eventId) : eventId !== null) return { ok: false };

  return {
    ok: true,
    evento: {
      event: event as Evento,
      session_id: o.session_id.toLowerCase(),
      ...sanearAtribucion(o),
      interno: o.interno === true,
      entry_page: entry as string | null,
      event_id: eventId === null ? null : (eventId as string).toLowerCase(),
    },
  };
}
