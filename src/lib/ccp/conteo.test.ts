// Se corre con `node --test src/lib/ccp/`. Ver diagnostico.test.ts por el import().
import { test } from "node:test";
import assert from "node:assert/strict";

const c: typeof import("./conteo") = await import("./conteo" + ".ts");

test("el CSV del conteo diario lleva encabezado y una fila por día, gancho y evento", () => {
  const csv = c.conteoCsv([
    { day: "2026-11-14", utm_content: "g1", event: "funnel_visit", count: 12 },
    { day: "2026-11-14", utm_content: null, event: "waitlist_signup", count: 1 },
  ]);
  assert.equal(csv, "day,utm_content,event,count\r\n2026-11-14,g1,funnel_visit,12\r\n2026-11-14,,waitlist_signup,1\r\n");
});

test("sin filas, solo el encabezado", () => {
  assert.equal(c.conteoCsv([]), "day,utm_content,event,count\r\n");
});

test("comas, comillas y fórmulas en utm_content no rompen ni ejecutan nada en la planilla", () => {
  const csv = c.conteoCsv([
    { day: "2026-11-14", utm_content: 'g1,"b"', event: "funnel_visit", count: 1 },
    { day: "2026-11-14", utm_content: "=HYPERLINK(1)", event: "funnel_visit", count: 2 },
  ]);
  assert.equal(csv.split("\r\n")[1], '2026-11-14,"g1,""b""",funnel_visit,1');
  assert.equal(csv.split("\r\n")[2], "2026-11-14,'=HYPERLINK(1),funnel_visit,2");
});

test("los eventos en memoria se agrupan por día de Buenos Aires y excluyen los internos", () => {
  const filas = c.contarEventos([
    { created_at: "2026-11-14T02:30:00.000Z", utm_content: "g1", event: "funnel_visit", interno: false }, // 13/11 23:30 en BA
    { created_at: "2026-11-14T03:30:00.000Z", utm_content: "g1", event: "funnel_visit", interno: false },
    { created_at: "2026-11-14T15:00:00.000Z", utm_content: "g1", event: "funnel_visit", interno: false },
    { created_at: "2026-11-14T15:00:00.000Z", utm_content: "g1", event: "funnel_visit", interno: true },
  ]);
  assert.deepEqual(filas, [
    { day: "2026-11-13", utm_content: "g1", event: "funnel_visit", count: 1 },
    { day: "2026-11-14", utm_content: "g1", event: "funnel_visit", count: 2 },
  ]);
});

test("el token se compara completo; vacío o distinto no pasa", () => {
  assert.equal(c.tokenValido("abc123", "abc123"), true);
  assert.equal(c.tokenValido("abc124", "abc123"), false);
  assert.equal(c.tokenValido("abc", "abc123"), false);
  assert.equal(c.tokenValido(null, "abc123"), false);
  assert.equal(c.tokenValido("", ""), false);
});

test("los eventos en memoria ignoran el repetido de la misma sesión", async () => {
  const ev = c.createMemoryEventStore();
  const evento = { event: "funnel_visit" as const, session_id: "s1", entry_page: "/", event_id: null, utm_source: "meta", utm_medium: null, utm_campaign: null, utm_content: "g9", fbclid: false, referrer: null, interno: false };
  await ev.add(evento);
  await ev.add(evento);
  await ev.add({ ...evento, session_id: "s2", interno: true });
  const filas = await ev.conteo();
  assert.equal(filas.length, 1);
  assert.equal(filas[0].count, 1);
  assert.equal(filas[0].utm_content, "g9");
});
