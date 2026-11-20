// Se corre con `node --test src/lib/ccp/`. Ver diagnostico.test.ts por el import().
import { test } from "node:test";
import assert from "node:assert/strict";

const m: typeof import("./medicion") = await import("./medicion" + ".ts");

const DIA = 24 * 60 * 60 * 1000;
const T0 = Date.parse("2026-11-14T13:00:00.000Z");
const SID = "0b7a3c1e-2f4d-4e5a-9b6c-7d8e9f0a1b2c";
const RID = "5f0c2a9e-8d7b-4c6a-a5b4-3c2d1e0f9a8b";

const ANUNCIO = "?utm_source=meta&utm_medium=paid&utm_campaign=ccp-pauta-01&utm_content=g1&fbclid=abc123";

test("primera carga: guarda los UTM, si vino fbclid y el referrer sin query", () => {
  const local = m.memoriaStorage();
  const a = m.resolverAtribucion(local, ANUNCIO, "https://l.instagram.com/path?u=secreto#x", T0);
  assert.deepEqual(a, {
    utm_source: "meta",
    utm_medium: "paid",
    utm_campaign: "ccp-pauta-01",
    utm_content: "g1",
    fbclid: true,
    referrer: "https://l.instagram.com/path",
  });
  assert.ok(local.getItem(m.CLAVES.atribucion));
});

test("sin parámetros: utm_source=directo y el resto vacío", () => {
  const a = m.resolverAtribucion(m.memoriaStorage(), "", "", T0);
  assert.deepEqual(a, { utm_source: "directo", utm_medium: null, utm_campaign: null, utm_content: null, fbclid: false, referrer: null });
});

test("gana el primero: una visita posterior dentro de los 30 días no pisa los UTM", () => {
  const local = m.memoriaStorage();
  m.resolverAtribucion(local, ANUNCIO, "", T0);
  const otra = m.resolverAtribucion(local, "?utm_source=google&utm_content=g2", "https://google.com/", T0 + 29 * DIA);
  assert.equal(otra.utm_source, "meta");
  assert.equal(otra.utm_content, "g1");
  assert.equal(otra.referrer, null);
  // Una visita directa tampoco los borra.
  assert.equal(m.resolverAtribucion(local, "", "", T0 + DIA).utm_content, "g1");
});

test("a los 30 días vence y la visita siguiente pasa a ser el primer toque", () => {
  const local = m.memoriaStorage();
  m.resolverAtribucion(local, ANUNCIO, "", T0);
  const nueva = m.resolverAtribucion(local, "?utm_source=meta&utm_content=g3", "", T0 + 30 * DIA + 1);
  assert.equal(nueva.utm_content, "g3");
  assert.equal(nueva.fbclid, false);
  assert.equal(m.resolverAtribucion(local, "", "", T0 + 31 * DIA).utm_content, "g3");
});

test("lo guardado roto o de otra forma se descarta", () => {
  const local = m.memoriaStorage();
  local.setItem(m.CLAVES.atribucion, "{no es json");
  assert.equal(m.resolverAtribucion(local, "?utm_content=g2", "", T0).utm_content, "g2");
  local.setItem(m.CLAVES.atribucion, JSON.stringify({ ts: T0, utm_source: 5 }));
  assert.equal(m.resolverAtribucion(local, "?utm_content=g3", "", T0).utm_content, "g3");
});

test("los UTM se recortan a 100 caracteres y los vacíos quedan en null", () => {
  const largo = "x".repeat(300);
  const a = m.resolverAtribucion(m.memoriaStorage(), `?utm_source=%20&utm_campaign=${largo}`, "no es una url", T0);
  assert.equal(a.utm_source, "directo");
  assert.equal(a.utm_campaign?.length, 100);
  assert.equal(a.referrer, null);
});

test("si el storage falla, igual devuelve la atribución de esta carga", () => {
  const roto = { getItem: () => { throw new Error("bloqueado"); }, setItem: () => { throw new Error("bloqueado"); }, removeItem: () => {} };
  assert.equal(m.resolverAtribucion(roto, ANUNCIO, "", T0).utm_content, "g1");
});

test("?interno=1 marca el navegador como interno y queda guardado; ?interno=0 lo desmarca", () => {
  const local = m.memoriaStorage();
  assert.equal(m.actualizarInterno(local, ""), false);
  assert.equal(m.actualizarInterno(local, "?interno=1"), true);
  assert.equal(m.actualizarInterno(local, "?utm_content=g1"), true);
  assert.equal(m.actualizarInterno(local, "?interno=0"), false);
  assert.equal(m.actualizarInterno(local, ""), false);
});

test("la sesión tiene un id que se reutiliza y cada evento sale una sola vez", () => {
  const sesion = m.memoriaStorage();
  let n = 0;
  const nuevo = () => (n++ === 0 ? SID : RID);
  assert.equal(m.idDeSesion(sesion, nuevo), SID);
  assert.equal(m.idDeSesion(sesion, nuevo), SID);
  assert.equal(m.primeraVezEnSesion(sesion, "funnel_visit"), true);
  assert.equal(m.primeraVezEnSesion(sesion, "funnel_visit"), false);
  assert.equal(m.primeraVezEnSesion(sesion, "diagnostic_start"), true);
});

test("un id de sesión guardado que no es uuid se reemplaza", () => {
  const sesion = m.memoriaStorage();
  sesion.setItem(m.CLAVES.sesion, "cualquier-cosa");
  assert.equal(m.idDeSesion(sesion, () => SID), SID);
});

const base = { event: "diagnostic_start", session_id: SID, utm_source: "meta", utm_medium: "paid", utm_campaign: "prueba", utm_content: "g9", fbclid: true, referrer: null, interno: false };

test("el servidor acepta un evento válido y lo normaliza", () => {
  const r = m.validarEvento(base);
  assert.deepEqual(r, { ok: true, evento: { ...base, entry_page: null, event_id: null } });
  const visita = m.validarEvento({ ...base, event: "funnel_visit", entry_page: "/diagnostico" });
  assert.equal(visita.ok && visita.evento.entry_page, "/diagnostico");
  const alta = m.validarEvento({ ...base, event: "waitlist_signup", event_id: RID });
  assert.equal(alta.ok && alta.evento.event_id, RID);
});

test("el servidor rechaza eventos inválidos", () => {
  const malos: unknown[] = [
    null,
    "texto",
    [],
    { ...base, event: "otro" },
    { ...base, session_id: "123" },
    { ...base, nombre: "Laura" }, // campo de más: nada personal entra por acá
    { ...base, whatsapp: "+5491155555555" },
    { ...base, utm_content: 7 },
    { ...base, fbclid: "si" },
    { ...base, interno: "true" },
    { ...base, event: "funnel_visit" }, // sin entry_page
    { ...base, event: "funnel_visit", entry_page: "/estudio" },
    { ...base, entry_page: "/" }, // entry_page solo en funnel_visit
    { ...base, event: "waitlist_signup" }, // sin event_id
    { ...base, event: "waitlist_signup", event_id: "abc" },
    { ...base, event_id: RID }, // event_id solo en waitlist_signup
  ];
  for (const raw of malos) assert.equal(m.validarEvento(raw).ok, false, JSON.stringify(raw));
});

test("el servidor recorta los textos, completa directo y limpia el referrer", () => {
  const r = m.validarEvento({ ...base, utm_source: null, utm_campaign: "y".repeat(500), referrer: "https://www.google.com/search?q=mi+nombre" });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.evento.utm_source, "directo");
  assert.equal(r.evento.utm_campaign?.length, 100);
  assert.equal(r.evento.referrer, "https://www.google.com/search");
});

test("la atribución que manda el formulario se sanea sin rechazar la inscripción", () => {
  assert.deepEqual(m.sanearAtribucion({ utm_source: "meta", utm_content: "g9", fbclid: true, referrer: "https://x.com/a?b=c", extra: "x" }), {
    utm_source: "meta",
    utm_medium: null,
    utm_campaign: null,
    utm_content: "g9",
    fbclid: true,
    referrer: "https://x.com/a",
  });
  assert.deepEqual(m.sanearAtribucion("basura"), { utm_source: "directo", utm_medium: null, utm_campaign: null, utm_content: null, fbclid: false, referrer: null });
  assert.equal(m.sanearAtribucion({ fbclid: "true" }).fbclid, false);
});
