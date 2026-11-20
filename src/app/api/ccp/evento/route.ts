// Conteo propio de los 4 eventos de la landing (EVENTOS-LANDING, secciones 1 y 3).
// Lo llama src/lib/ccp/track.ts con sendBeacon. El mismo evento de la misma sesión se ignora.
import { validarEvento } from "@/lib/ccp/medicion";
import { backend, errorParaLog } from "@/lib/ccp/servidor";

const MAX_BYTES = 2048;

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES) return new Response(null, { status: 413 });
  const texto = await request.text();
  if (texto.length > MAX_BYTES) return new Response(null, { status: 413 });
  let raw: unknown;
  try {
    raw = JSON.parse(texto);
  } catch {
    return new Response(null, { status: 400 });
  }
  const v = validarEvento(raw);
  if (!v.ok) return new Response(null, { status: 400 });

  const b = backend();
  if (!b) return new Response(null, { status: 503 });
  try {
    await b.eventos.add(v.evento);
  } catch (e) {
    console.error(`[ccp] No se guardó el evento ${v.evento.event}: ${errorParaLog(e)}`);
    return new Response(null, { status: 502 });
  }
  return new Response(null, { status: 204 });
}
