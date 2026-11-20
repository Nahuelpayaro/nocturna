// Se corre con `node --test src/lib/ccp/` (Node quita los tipos de TypeScript).
// Node necesita la extensión .ts y el tsconfig no la permite en un import estático:
// por eso el módulo se carga con import() y se tipa con typeof import().
import { test } from "node:test";
import assert from "node:assert/strict";

const d: typeof import("./diagnostico") = await import("./diagnostico" + ".ts");

const base = { consultas: "100", periodo: "mes", visitas: "80", operaciones: "2", comision: "3000", moneda: "USD", respondeATiempo: "2" } as const;

test("ejemplo de 02-canales: 100 consultas, 2 operaciones, USD 3.000", () => {
  const r = d.validarDiagnostico({ ...base });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.deepEqual(r.respuestas, { consultasMes: 100, visitasMes: 80, operacionesMes: 2, comision: 3000, moneda: "USD", respondeATiempo: 2 });
  assert.deepEqual(d.calcularDiagnostico(r.respuestas), { valorConsulta: 60, expuestas: 80, escala: 480 });
});

test("la escala con 75 consultas expuestas es USD 450 (02-canales)", () => {
  assert.equal(d.proporcionExpuesta(2), 0.8);
  assert.equal(d.escala(75, 60), 450);
});

test("consultas por semana se pasan a mes: round(semana × 52 / 12)", () => {
  assert.equal(d.semanaAMes(10), 43);
  const r = d.validarDiagnostico({ ...base, consultas: "10", periodo: "semana", visitas: "40", operaciones: "1" });
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.respuestas.consultasMes, 43);
});

test("si responde a tiempo 10 de 10, no hay consultas expuestas", () => {
  const r = d.validarDiagnostico({ ...base, respondeATiempo: "10" });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.deepEqual(d.calcularDiagnostico(r.respuestas), { valorConsulta: 60, expuestas: 0, escala: 0 });
});

test("visitas > consultas pide revisar y no calcula", () => {
  const r = d.validarDiagnostico({ ...base, visitas: "120" });
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.equal(r.control, d.MENSAJE_CONTROL);
  assert.deepEqual(r.errores, {});
  assert.deepEqual(r.camposControl, ["visitas"]);
});

test("operaciones > visitas pide revisar", () => {
  const r = d.validarDiagnostico({ ...base, operaciones: "90" });
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.equal(r.control, d.MENSAJE_CONTROL);
  assert.deepEqual(r.camposControl, ["operaciones"]);
});

test("el control compara con las consultas ya pasadas a mes", () => {
  // 10 por semana son 43 por mes: 40 visitas está bien, 50 no.
  assert.equal(d.validarDiagnostico({ ...base, consultas: "10", periodo: "semana", visitas: "40" }).ok, true);
  assert.equal(d.validarDiagnostico({ ...base, consultas: "10", periodo: "semana", visitas: "50" }).ok, false);
});

test("consultas = 0 es un error del campo", () => {
  const r = d.validarDiagnostico({ ...base, consultas: "0", visitas: "0", operaciones: "0" });
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.equal(r.errores.consultas, d.ERRORES_DIAGNOSTICO.consultasCero);
  assert.equal(r.control, null);
});

test("campos vacíos: un error por campo, en el orden de la página", () => {
  const r = d.validarDiagnostico({ consultas: "", periodo: "mes", visitas: " ", operaciones: "", comision: "", moneda: "", respondeATiempo: "" });
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.deepEqual(Object.keys(r.errores), ["consultas", "visitas", "operaciones", "comision", "moneda", "respondeATiempo"]);
  assert.equal(r.errores.consultas, d.ERRORES_DIAGNOSTICO.consultas);
  assert.equal(r.errores.moneda, d.ERRORES_DIAGNOSTICO.moneda);
  assert.equal(r.control, null);
});

test("números: enteros ≥ 0, se aceptan puntos de miles; comisión > 0", () => {
  assert.equal(d.parseEntero("3.000"), 3000);
  assert.equal(d.parseEntero(" 1 500 "), 1500);
  assert.equal(d.parseEntero("2,5"), null);
  assert.equal(d.parseEntero("-3"), null);
  assert.equal(d.parseEntero("abc"), null);
  const r = d.validarDiagnostico({ ...base, comision: "0", respondeATiempo: "11" });
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.equal(r.errores.comision, d.ERRORES_DIAGNOSTICO.comisionCero);
  assert.equal(r.errores.respondeATiempo, d.ERRORES_DIAGNOSTICO.respondeATiempo);
});

test("montos con formato es-AR y la moneda elegida", () => {
  assert.equal(d.formatMonto(60, "USD"), "USD 60");
  assert.equal(d.formatMonto(3000.4, "USD"), "USD 3.000");
  assert.equal(d.formatMonto(1500000, "ARS"), "$ 1.500.000");
});

test("WhatsApp: acepta números argentinos con código de área y los pasa a E.164", () => {
  const casos: Array<[string, string]> = [
    ["11 5555 5555", "+5491155555555"],
    ["1155555555", "+5491155555555"],
    ["+54 9 11 5555-5555", "+5491155555555"],
    ["54 11 5555 5555", "+5491155555555"],
    ["011 15 5555 5555", "+5491155555555"],
    ["11 15 5555 5555", "+5491155555555"],
    ["(0351) 15 555-5555", "+5493515555555"],
    ["351 555 5555", "+5493515555555"],
    ["2966 15 55 5555", "+5492966555555"],
    ["0054 9 11 5555 5555", "+5491155555555"],
  ];
  for (const [raw, e164] of casos) assert.equal(d.normalizarWhatsapp(raw), e164, raw);
});

test("WhatsApp: rechaza números sin código de área o incompletos", () => {
  for (const raw of ["", "5555 5555", "15 5555 5555", "11 5555 555", "11 5555 55555 5", "abc", "+1 415 555 0000"]) {
    assert.equal(d.normalizarWhatsapp(raw), null, raw);
  }
});

test("WhatsApp: formato legible para la confirmación", () => {
  assert.equal(d.formatWhatsapp("+5491155555555"), "11 5555 5555");
  assert.equal(d.formatWhatsapp("+5493515555555"), "351 555 5555");
});

test("inscripción: errores con el texto de la lista de espera", () => {
  const r = d.validarInscripcion({ nombre: " ", inmobiliaria: "", whatsapp: "5555", acepta: false });
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.deepEqual(r.errores, {
    nombre: "Escribí tu nombre.",
    inmobiliaria: "Escribí el nombre de tu inmobiliaria.",
    whatsapp: "Escribí tu WhatsApp con el código de área, por ejemplo 11 5555 5555.",
    acepta: "Marcá la casilla para que podamos escribirte.",
  });
});

test("inscripción válida: recorta espacios y normaliza el WhatsApp", () => {
  const r = d.validarInscripcion({ nombre: "  Laura ", inmobiliaria: " Propiedades Sur ", whatsapp: "11 5555 5555", acepta: true });
  assert.deepEqual(r, { ok: true, datos: { nombre: "Laura", inmobiliaria: "Propiedades Sur", whatsapp: "+5491155555555" } });
});

test("inscripción: rechaza textos más largos que el máximo del campo", () => {
  const r = d.validarInscripcion({ nombre: "a".repeat(d.MAX_TEXTO + 1), inmobiliaria: "Sur", whatsapp: "1155555555", acepta: true });
  assert.equal(r.ok, false);
});
