// Se corre con `node --test src/lib/ccp/`. Ver diagnostico.test.ts por el import().
import { test } from "node:test";
import assert from "node:assert/strict";

const t: typeof import("./telegram") = await import("./telegram" + ".ts");

const registro = {
  id: "5f0c2a9e-8d7b-4c6a-a5b4-3c2d1e0f9a8b",
  createdAt: "2026-11-14T10:05:09.123-03:00",
  nombre: "Laura <b>",
  inmobiliaria: "Sur & Cía",
  whatsapp: "+5491155555555",
  mail: null as string | null,
  answers: { consultasMes: 100, visitasMes: 80, operacionesMes: 2, comision: 3000, moneda: "USD" as const, respondeATiempo: 2 },
  result: { valorConsulta: 60, expuestas: 80, escala: 480 },
  utm_source: "meta",
  utm_medium: "paid",
  utm_campaign: "ccp-pauta-01",
  utm_content: "g1",
  fbclid: true,
  referrer: null,
  interno: false,
};

test("el aviso lleva hora de Buenos Aires, datos, link de WhatsApp, respuestas, resultado y gancho", () => {
  const texto = t.mensajeInscripto(registro, { produccion: true });
  assert.equal(
    texto,
    [
      "Nuevo inscripto en la lista de espera",
      "Hora: 14/11/2026 10:05 (Buenos Aires)",
      "",
      "Nombre: Laura <b>",
      "Inmobiliaria: Sur & Cía",
      "WhatsApp: https://wa.me/5491155555555",
      "",
      "Consultas por mes: 100",
      "Visitas por mes: 80",
      "Operaciones por mes: 2",
      "Le queda por operación: USD 3.000",
      "Responde en menos de 5 minutos: 2 de 10",
      "",
      "Resultado:",
      "- Cada consulta vale USD 60",
      "- 80 consultas por mes se responden después de 5 minutos",
      "- Cada 10 % recuperado: USD 480 por mes",
      "",
      "Anuncio (utm_content): g1",
    ].join("\n"),
  );
});

test("fuera de producción va con [VISTA PREVIA]; interno y corrección se marcan; pesos con $", () => {
  const texto = t.mensajeInscripto(
    { ...registro, interno: true, utm_content: null, answers: { ...registro.answers, moneda: "ARS" as const, comision: 1500000 } },
    { produccion: false, correccion: true },
  );
  const lineas = texto.split("\n");
  assert.equal(lineas[0], "[VISTA PREVIA] [INTERNO] Corrección del número de un inscripto");
  assert.ok(lineas.includes("Le queda por operación: $ 1.500.000"));
  assert.ok(lineas.includes("Anuncio (utm_content): sin dato"));
});

function fetchFalso(respuesta: () => Promise<Response>) {
  const llamadas: Array<{ url: string; init: RequestInit }> = [];
  const f = async (url: string | URL | Request, init?: RequestInit) => {
    llamadas.push({ url: String(url), init: init ?? {} });
    return respuesta();
  };
  return { f: f as typeof fetch, llamadas };
}

test("manda sendMessage al chat, en texto plano y sin vista previa del link", async () => {
  const { f, llamadas } = fetchFalso(async () => Response.json({ ok: true, result: {} }));
  const ok = await t.enviarTelegram({ token: "123:abc", chatId: "-100200", texto: "hola", fetch: f });
  assert.equal(ok, true);
  assert.equal(llamadas.length, 1);
  assert.equal(llamadas[0].url, "https://api.telegram.org/bot123:abc/sendMessage");
  assert.equal(llamadas[0].init.method, "POST");
  assert.deepEqual(JSON.parse(String(llamadas[0].init.body)), { chat_id: "-100200", text: "hola", link_preview_options: { is_disabled: true } });
  assert.ok(llamadas[0].init.signal instanceof AbortSignal);
});

test("si Telegram contesta error, tira o se pasa del tiempo, devuelve false sin tirar", async () => {
  const error = fetchFalso(async () => Response.json({ ok: false, description: "chat not found" }, { status: 400 }));
  assert.equal(await t.enviarTelegram({ token: "t", chatId: "c", texto: "x", fetch: error.f }), false);
  const red = fetchFalso(async () => {
    throw new TypeError("fetch failed");
  });
  assert.equal(await t.enviarTelegram({ token: "t", chatId: "c", texto: "x", fetch: red.f }), false);
  const lento = (async (_u: unknown, init?: RequestInit) =>
    new Promise<Response>((_, reject) => init?.signal?.addEventListener("abort", () => reject(init.signal?.reason)))) as typeof fetch;
  const inicio = Date.now();
  assert.equal(await t.enviarTelegram({ token: "t", chatId: "c", texto: "x", fetch: lento, timeoutMs: 50 }), false);
  assert.ok(Date.now() - inicio < 1000);
});

test("el mail va en el aviso solo si el inscripto lo dejó", () => {
  assert.equal(t.mensajeInscripto(registro, { produccion: true }).includes("Mail:"), false);
  const texto = t.mensajeInscripto({ ...registro, mail: "laura@sur.com" }, { produccion: true });
  assert.match(texto, /\nMail: laura@sur\.com\n/);
});
