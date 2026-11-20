// Se corre con `node --test src/lib/ccp/`. Ver diagnostico.test.ts por el import().
import { test } from "node:test";
import assert from "node:assert/strict";

const w: typeof import("./waitlist-store") = await import("./waitlist-store" + ".ts");

function registro(id: string, whatsapp: string) {
  return {
    id,
    createdAt: "2026-11-14T10:00:00.000-03:00",
    nombre: "Laura",
    inmobiliaria: "Sur",
    whatsapp,
    answers: { consultasMes: 100, visitasMes: 80, operacionesMes: 2, comision: 3000, moneda: "USD" as const, respondeATiempo: 2 },
    result: { valorConsulta: 60, expuestas: 80, escala: 480 },
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    fbclid: false,
    referrer: null,
    interno: false,
  };
}

test("la fecha va en ISO con la zona de Buenos Aires", () => {
  assert.equal(w.isoBuenosAires(new Date("2026-11-14T13:05:09.123Z")), "2026-11-14T10:05:09.123-03:00");
  assert.equal(w.isoBuenosAires(new Date("2026-11-14T01:00:00.000Z")), "2026-11-13T22:00:00.000-03:00");
});

test("el guardado en memoria detecta el número repetido", async () => {
  const store = w.createMemoryStore();
  assert.equal(await store.add(registro("a", "+5491155555555")), "ok");
  assert.equal(await store.add(registro("b", "+5491155555555")), "duplicate");
  assert.equal(await store.add(registro("c", "+5493515555555")), "ok");
  assert.equal(await store.count(), 2);
});

test("corregir el número reemplaza la inscripción anterior", async () => {
  const store = w.createMemoryStore();
  await store.add(registro("a", "+5491155555555"));
  assert.equal(await store.add(registro("b", "+5493515555555"), "a"), "ok");
  assert.equal(await store.count(), 1);
  // Corregir dejando el mismo número no es un repetido.
  assert.equal(await store.add(registro("c", "+5493515555555"), "b"), "ok");
  assert.equal(await store.count(), 1);
});

test("si la corrección choca con otro número anotado, la inscripción anterior queda", async () => {
  const store = w.createMemoryStore();
  await store.add(registro("a", "+5491155555555"));
  await store.add(registro("b", "+5493515555555"));
  assert.equal(await store.add(registro("c", "+5493515555555"), "a"), "duplicate");
  assert.equal(await store.count(), 2);
  assert.equal(await store.add(registro("d", "+5491155555555")), "duplicate");
});

test("el guardado en memoria marca el aviso enviado", async () => {
  const store = w.createMemoryStore();
  await store.add(registro("a", "+5491155555555"));
  await store.markNotified("a");
  assert.equal(await store.count(), 1);
});

test("con SUPABASE_URL y la clave se usa Supabase; sin ellas, memoria salvo en producción", () => {
  const conf = { SUPABASE_URL: "https://abc.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "k" };
  assert.equal(w.elegirBackend(conf), "supabase");
  assert.equal(w.elegirBackend({ ...conf, VERCEL_ENV: "production" }), "supabase");
  assert.equal(w.elegirBackend({}), "memoria");
  assert.equal(w.elegirBackend({ SUPABASE_URL: "https://abc.supabase.co" }), "memoria");
  assert.equal(w.elegirBackend({ VERCEL_ENV: "preview" }), "memoria");
  assert.equal(w.elegirBackend({ VERCEL_ENV: "production" }), "sin-config");
  assert.equal(w.elegirBackend({ SUPABASE_SERVICE_ROLE_KEY: "k", VERCEL_ENV: "production" }), "sin-config");
});

function storeEspia(resultado: "ok" | "duplicate" = "ok") {
  const marcados: string[] = [];
  const store = {
    add: async () => resultado,
    count: async () => 0,
    markNotified: async (id: string) => {
      marcados.push(id);
    },
  };
  return { store, marcados };
}

test("inscribir avisa después de guardar y marca notificado si el aviso salió", async () => {
  const { store, marcados } = storeEspia();
  const avisos: Array<[string, boolean]> = [];
  const r = await w.inscribir(registro("a", "+5491155555555"), null, {
    store,
    avisar: async (rec, correccion) => {
      avisos.push([rec.id, correccion]);
      return true;
    },
  });
  assert.equal(r, "ok");
  assert.deepEqual(avisos, [["a", false]]);
  assert.deepEqual(marcados, ["a"]);
});

test("si el aviso falla o tira, la inscripción igual queda y notificado sigue en false", async () => {
  for (const avisar of [async () => false, async () => { throw new Error("telegram caído"); }]) {
    const { store, marcados } = storeEspia();
    assert.equal(await w.inscribir(registro("a", "+5491155555555"), "z", { store, avisar }), "ok");
    assert.deepEqual(marcados, []);
  }
});

test("si marcar notificado falla, la inscripción igual queda", async () => {
  const store = { add: async () => "ok" as const, count: async () => 0, markNotified: async () => { throw new Error("db"); } };
  assert.equal(await w.inscribir(registro("a", "+5491155555555"), null, { store, avisar: async () => true }), "ok");
});

test("un número repetido no se avisa", async () => {
  const { store } = storeEspia("duplicate");
  let avisado = false;
  const r = await w.inscribir(registro("a", "+5491155555555"), null, { store, avisar: async () => (avisado = true) });
  assert.equal(r, "duplicate");
  assert.equal(avisado, false);
});
