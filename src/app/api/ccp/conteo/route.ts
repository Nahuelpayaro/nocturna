// Conteo diario para Growth (EVENTOS-LANDING, sección 8.2): CSV con day, utm_content, event, count,
// sin las visitas internas. GET /api/ccp/conteo?token=<GROWTH_EXPORT_TOKEN>. Sin el token configurado, 404.
import type { NextRequest } from "next/server";
import { conteoCsv, tokenValido } from "@/lib/ccp/conteo";
import { backend, errorParaLog } from "@/lib/ccp/servidor";

export async function GET(request: NextRequest) {
  const esperado = process.env.GROWTH_EXPORT_TOKEN;
  if (!esperado) return new Response(null, { status: 404 });
  if (!tokenValido(request.nextUrl.searchParams.get("token"), esperado)) return new Response(null, { status: 401 });

  const b = backend();
  if (!b) return new Response(null, { status: 503 });
  try {
    const csv = conteoCsv(await b.eventos.conteo());
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'inline; filename="ccp-conteo-diario.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(`[ccp] No se pudo leer el conteo: ${errorParaLog(e)}`);
    return new Response(null, { status: 502 });
  }
}
