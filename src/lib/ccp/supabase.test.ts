// Se corre con `node --test src/lib/ccp/`. Ver diagnostico.test.ts por el import().
// Sin red: el fetch es falso y responde como PostgREST.
import { test } from "node:test";
import assert from "node:assert/strict";

const s: typeof import("./supabase") = await import("./supabase" + ".ts");

const URL_BASE = "https://abc.supabase.co";
const A = "5f0c2a9e-8d7b-4c6a-a5b4-3c2d1e0f9a8b";
const B = "6a1d3b0f-9e8c-4d7b-b6c5-4d3e2f1a0b9c";
const SID = "0b7a3c1e-2f4d-4e5a-9b6c-7d8e9f0a1b2c";

function registro(id: string, whatsapp: string) {
  return {
    id,
    createdAt: "2026-11-14T10:00:00.000-03:00",
    nombre: "Laura",
    inmobiliaria: "Sur",
    whatsapp,
    mail: "laura@sur.com" as string | null,
    answers: { consultasMes: 100, visitasMes: 80, operacionesMes: 2, comision: 3000, moneda: "USD" as const, respondeATiempo: 2 },
    result: { valorConsulta: 60, expuestas: 80, escala: 480 },
    utm_source: "meta",
    utm_medium: "paid",
    utm_campaign: "prueba",
    utm_content: "g9",
    fbclid: true,
    referrer: null,
    interno: false,
  };
}

type Llamada = { method: string; url: string; headers: Record<string, string>; body: unknown };

function postgrestFalso(responder: (l: Llamada) => Response) {
  const llamadas: Llamada[] = [];
  const f = async (url: string | URL | Request, init?: RequestInit) => {
    const l: Llamada = {
      method: init?.method ?? "GET",
      url: String(url),
      headers: Object.fromEntries(new Headers(init?.headers).entries()),
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    };
    llamadas.push(l);
    return responder(l);
  };
  return { pg: s.createPostgrest({ url: URL_BASE + "/", key: "sb_secret_x", fetch: f as typeof fetch }), llamadas };
}

const unico = () => Response.json({ code: "23505", message: "duplicate key value violates unique constraint" }, { status: 409 });

test("guarda el inscripto en ccp_waitlist con las columnas del registro", async () => {
  const { pg, llamadas } = postgrestFalso(() => new Response(null, { status: 201 }));
  const store = s.createSupabaseWaitlistStore(pg);
  assert.equal(await store.add(registro(A, "+5491155555555")), "ok");
  assert.equal(llamadas.length, 1);
  const l = llamadas[0];
  assert.equal(l.method, "POST");
  assert.equal(l.url, `${URL_BASE}/rest/v1/ccp_waitlist`);
  assert.equal(l.headers.apikey, "sb_secret_x");
  assert.equal(l.headers.prefer, "return=minimal");
  assert.deepEqual(l.body, {
    id: A,
    created_at: "2026-11-14T10:00:00.000-03:00",
    nombre: "Laura",
    inmobiliaria: "Sur",
    whatsapp: "+5491155555555",
    mail: "laura@sur.com",
    consultas_mes: 100,
    visitas_mes: 80,
    operaciones_mes: 2,
    comision: 3000,
    moneda: "USD",
    responde_a_tiempo: 2,
    valor_consulta: 60,
    expuestas: 80,
    escala: 480,
    utm_source: "meta",
    utm_medium: "paid",
    utm_campaign: "prueba",
    utm_content: "g9",
    fbclid: true,
    referrer: null,
    interno: false,
    notificado: false,
  });
});

test("la clave legacy (JWT) va también en Authorization; la nueva sb_ solo en apikey", async () => {
  const nueva = postgrestFalso(() => new Response(null, { status: 201 }));
  await s.createSupabaseWaitlistStore(nueva.pg).add(registro(A, "+5491155555555"));
  assert.equal(nueva.llamadas[0].headers.authorization, undefined);
  const llamadas: Llamada[] = [];
  const f = (async (url: string, init?: RequestInit) => {
    llamadas.push({ method: "POST", url, headers: Object.fromEntries(new Headers(init?.headers).entries()), body: null });
    return new Response(null, { status: 201 });
  }) as typeof fetch;
  await s.createSupabaseWaitlistStore(s.createPostgrest({ url: URL_BASE, key: "eyJhbGciOi.x.y", fetch: f })).add(registro(A, "+5491155555555"));
  assert.equal(llamadas[0].headers.authorization, "Bearer eyJhbGciOi.x.y");
});

test("el número repetido (409 / 23505) es duplicate; otro error tira", async () => {
  const dup = postgrestFalso(unico);
  assert.equal(await s.createSupabaseWaitlistStore(dup.pg).add(registro(A, "+5491155555555")), "duplicate");
  const caido = postgrestFalso(() => Response.json({ message: "boom" }, { status: 500 }));
  await assert.rejects(s.createSupabaseWaitlistStore(caido.pg).add(registro(A, "+5491155555555")));
});

test("corregir el número actualiza la inscripción anterior (nuevo id, aviso pendiente) sin tocar la hora", async () => {
  const { pg, llamadas } = postgrestFalso(() => Response.json([{ id: B }], { status: 200 }));
  assert.equal(await s.createSupabaseWaitlistStore(pg).add(registro(B, "+5493515555555"), A), "ok");
  assert.equal(llamadas.length, 1);
  const l = llamadas[0];
  assert.equal(l.method, "PATCH");
  assert.equal(l.url, `${URL_BASE}/rest/v1/ccp_waitlist?id=eq.${A}`);
  assert.equal(l.headers.prefer, "return=representation");
  const body = l.body as Record<string, unknown>;
  assert.equal(body.id, B);
  assert.equal(body.whatsapp, "+5493515555555");
  assert.equal(body.notificado, false);
  assert.equal("created_at" in body, false);
});

test("si la corrección choca con otro número anotado es duplicate", async () => {
  const { pg } = postgrestFalso(unico);
  assert.equal(await s.createSupabaseWaitlistStore(pg).add(registro(B, "+5493515555555"), A), "duplicate");
});

test("si la inscripción a corregir no existe (o el id no es uuid) se guarda como nueva", async () => {
  const { pg, llamadas } = postgrestFalso((l) => (l.method === "PATCH" ? Response.json([], { status: 200 }) : new Response(null, { status: 201 })));
  const store = s.createSupabaseWaitlistStore(pg);
  assert.equal(await store.add(registro(B, "+5493515555555"), A), "ok");
  assert.deepEqual(llamadas.map((l) => l.method), ["PATCH", "POST"]);
  assert.equal(await store.add(registro(B, "+5493515555555"), "no-es-uuid"), "ok");
  assert.deepEqual(llamadas.map((l) => l.method), ["PATCH", "POST", "POST"]);
});

test("marcar avisado y contar", async () => {
  const { pg, llamadas } = postgrestFalso((l) =>
    l.method === "HEAD" ? new Response(null, { status: 200, headers: { "content-range": "*/7" } }) : new Response(null, { status: 204 }),
  );
  const store = s.createSupabaseWaitlistStore(pg);
  await store.markNotified(A);
  assert.equal(llamadas[0].method, "PATCH");
  assert.equal(llamadas[0].url, `${URL_BASE}/rest/v1/ccp_waitlist?id=eq.${A}`);
  assert.deepEqual(llamadas[0].body, { notificado: true });
  assert.equal(await store.count(), 7);
  assert.equal(llamadas[1].headers.prefer, "count=exact");
});

test("los eventos van a ccp_events ignorando el repetido de la misma sesión", async () => {
  const { pg, llamadas } = postgrestFalso(() => new Response(null, { status: 201 }));
  const evento = { event: "funnel_visit" as const, session_id: SID, entry_page: "/", event_id: null, utm_source: "meta", utm_medium: "paid", utm_campaign: "prueba", utm_content: "g9", fbclid: true, referrer: null, interno: false };
  await s.createSupabaseEventStore(pg).add(evento);
  assert.equal(llamadas[0].url, `${URL_BASE}/rest/v1/ccp_events?on_conflict=session_id%2Cevent`);
  assert.equal(llamadas[0].headers.prefer, "resolution=ignore-duplicates,return=minimal");
  assert.deepEqual(llamadas[0].body, evento);
  // Un 409 por el mismo evento de la misma sesión no es un error.
  const dup = postgrestFalso(unico);
  await s.createSupabaseEventStore(dup.pg).add(evento);
  const caido = postgrestFalso(() => new Response("x", { status: 500 }));
  await assert.rejects(s.createSupabaseEventStore(caido.pg).add(evento));
});

test("el conteo diario se lee de la vista ccp_daily_counts", async () => {
  const filas = [{ day: "2026-11-14", utm_content: "g9", event: "funnel_visit", count: 3 }];
  const { pg, llamadas } = postgrestFalso(() => Response.json(filas));
  assert.deepEqual(await s.createSupabaseEventStore(pg).conteo(), filas);
  assert.equal(llamadas[0].method, "GET");
  assert.equal(llamadas[0].url, `${URL_BASE}/rest/v1/ccp_daily_counts?select=day%2Cutm_content%2Cevent%2Ccount&order=day.asc%2Cutm_content.asc%2Cevent.asc`);
});
