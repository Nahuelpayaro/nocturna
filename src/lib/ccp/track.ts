// Medición de la landing de CCP en el navegador (EVENTOS-LANDING, secciones 1, 2, 3, 5 y 6).
// Cada evento sale una vez por sesión al conteo propio (/api/ccp/evento) y, si corresponde, al píxel.
// Nunca datos personales: los props aceptan solo entry_page y event_id (id del registro).
import { actualizarInterno, idDeSesion, memoriaStorage, PAGINAS_EMBUDO, primeraVezEnSesion, resolverAtribucion, type Almacen, type Atribucion, type Evento } from "./medicion";

export type TrackEvent = Evento;

export type TrackProps = { entry_page?: string; event_id?: string };

type Contexto = { atribucion: Atribucion; interno: boolean; sesion: Almacen; sessionId: string };

let contexto: Contexto | null = null;

const CLAVE_PRUEBA = "ccp_prueba";

function almacen(tipo: "localStorage" | "sessionStorage"): Almacen {
  try {
    const s = window[tipo];
    s.getItem(CLAVE_PRUEBA);
    return s;
  } catch {
    return memoriaStorage();
  }
}

function uuid(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** Se arma en la primera carga: marca de interno, primer toque y sesión. */
function ctx(): Contexto | null {
  if (typeof window === "undefined") return null;
  if (!contexto) {
    const local = almacen("localStorage");
    const sesion = almacen("sessionStorage");
    const { search } = window.location;
    contexto = {
      interno: actualizarInterno(local, search),
      atribucion: resolverAtribucion(local, search, document.referrer, Date.now()),
      sesion,
      sessionId: idDeSesion(sesion, uuid),
    };
  }
  return contexto;
}

/** Lo que el formulario manda con la inscripción para guardarlo en el registro. */
export function atribucionParaFormulario(): { atribucion: Atribucion | null; interno: boolean } {
  const c = ctx();
  return { atribucion: c?.atribucion ?? null, interno: c?.interno ?? false };
}

export function esPaginaEmbudo(path: string): boolean {
  return (PAGINAS_EMBUDO as readonly string[]).includes(path);
}

/* ---------- Píxel de Meta ---------- */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
// Las vistas previas de Vercel no disparan el píxel de producción.
const PRODUCCION = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

export const PIXEL_SRC = "https://connect.facebook.net/en_US/fbevents.js";

/** Solo con id, en producción y fuera de los navegadores del equipo. */
export function pixelPermitido(): boolean {
  if (!PIXEL_ID || !PRODUCCION) return false;
  const c = ctx();
  return Boolean(c && !c.interno);
}

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue: unknown[][]; push: Fbq; loaded: boolean; version: string; disablePushState?: boolean };
type ConFbq = Window & { fbq?: Fbq; _fbq?: Fbq };

let pixelIniciado = false;

/** La cola del snippet estándar de Meta; fbevents.js (next/script en Medicion) la procesa al cargar. */
function fbq(...args: unknown[]) {
  if (!pixelPermitido()) return;
  const w = window as ConFbq;
  if (!w.fbq) {
    const n = function (...a: unknown[]) {
      if (n.callMethod) n.callMethod(...a);
      else n.queue.push(a);
    } as Fbq;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    // PageView sale solo con funnel_visit, no en cada navegación del cliente.
    n.disablePushState = true;
    w.fbq = n;
    w._fbq ??= n;
  }
  if (!pixelIniciado) {
    pixelIniciado = true;
    // Sin coincidencia avanzada automática (EVENTOS-LANDING, sección 5).
    w.fbq("set", "autoConfig", false, PIXEL_ID);
    w.fbq("init", PIXEL_ID);
  }
  w.fbq(...args);
}

function alPixel(event: Evento, a: Atribucion, props: TrackProps) {
  const utm = { utm_source: a.utm_source, utm_medium: a.utm_medium, utm_campaign: a.utm_campaign, utm_content: a.utm_content };
  if (event === "funnel_visit") fbq("track", "PageView");
  else if (event === "diagnostic_start") fbq("trackCustom", "DiagnosticStart", utm);
  else if (event === "diagnostic_complete") fbq("trackCustom", "DiagnosticComplete", utm);
  else if (event === "waitlist_signup" && props.event_id) fbq("track", "Lead", utm, { eventID: props.event_id });
}

/* ---------- Eventos ---------- */

function enviar(cuerpo: string) {
  const url = "/api/ccp/evento";
  try {
    if (navigator.sendBeacon?.(url, new Blob([cuerpo], { type: "application/json" }))) return;
  } catch {
    // Sigue con fetch.
  }
  void fetch(url, { method: "POST", body: cuerpo, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
}

/** Una vez por sesión del navegador; los repetidos se ignoran acá y en el servidor. */
export function track(event: TrackEvent, props: TrackProps = {}): void {
  const c = ctx();
  if (!c) return;
  if (event === "funnel_visit" && !esPaginaEmbudo(props.entry_page ?? "")) return;
  if (event === "waitlist_signup" && !props.event_id) return;
  if (!primeraVezEnSesion(c.sesion, event)) return;
  enviar(
    JSON.stringify({
      event,
      session_id: c.sessionId,
      ...c.atribucion,
      interno: c.interno,
      ...(event === "funnel_visit" ? { entry_page: props.entry_page } : {}),
      ...(event === "waitlist_signup" ? { event_id: props.event_id } : {}),
    }),
  );
  alPixel(event, c.atribucion, props);
}
