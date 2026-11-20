// Aviso a Nahuel y Camila por Telegram cuando alguien se anota (S7; OPERACION-LANZAMIENTO 3.1, paso 3).
// Texto plano: Telegram convierte el link de wa.me en tocable y no hay que escapar nada.
// Solo tipos: node --test lo carga directo.
import type { WaitlistRecord } from "./waitlist-store";

const hora = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Igual que formatMonto de diagnostico.ts (sin importarlo, para que node --test lo cargue). */
function monto(n: number, moneda: "USD" | "ARS"): string {
  return `${moneda === "USD" ? "USD" : "$"} ${Math.round(n).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

export function mensajeInscripto(r: WaitlistRecord, opts: { produccion: boolean; correccion?: boolean }): string {
  const a = r.answers;
  const prefijo = [opts.produccion ? null : "[VISTA PREVIA]", r.interno ? "[INTERNO]" : null].filter(Boolean).join(" ");
  const titulo = opts.correccion ? "Corrección del número de un inscripto" : "Nuevo inscripto en la lista de espera";
  const fecha = hora.format(new Date(r.createdAt)).replace(",", "");
  return [
    prefijo ? `${prefijo} ${titulo}` : titulo,
    `Hora: ${fecha} (Buenos Aires)`,
    "",
    `Nombre: ${r.nombre}`,
    `Inmobiliaria: ${r.inmobiliaria}`,
    `WhatsApp: https://wa.me/${r.whatsapp.replace(/\D/g, "")}`,
    ...(r.mail ? [`Mail: ${r.mail}`] : []),
    "",
    `Consultas por mes: ${a.consultasMes}`,
    `Visitas por mes: ${a.visitasMes}`,
    `Operaciones por mes: ${a.operacionesMes}`,
    `Le queda por operación: ${monto(a.comision, a.moneda)}`,
    `Responde en menos de 5 minutos: ${a.respondeATiempo} de 10`,
    "",
    "Resultado:",
    `- Cada consulta vale ${monto(r.result.valorConsulta, a.moneda)}`,
    `- ${r.result.expuestas} consultas por mes se responden después de 5 minutos`,
    `- Cada 10 % recuperado: ${monto(r.result.escala, a.moneda)} por mes`,
    "",
    `Anuncio (utm_content): ${r.utm_content ?? "sin dato"}`,
  ].join("\n");
}

/** sendMessage con tiempo límite. Nunca tira: devuelve si Telegram confirmó el envío. */
export async function enviarTelegram(o: { token: string; chatId: string; texto: string; fetch?: typeof fetch; timeoutMs?: number }): Promise<boolean> {
  const f = o.fetch ?? fetch;
  try {
    const res = await f(`https://api.telegram.org/bot${o.token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: o.chatId, text: o.texto, link_preview_options: { is_disabled: true } }),
      signal: AbortSignal.timeout(o.timeoutMs ?? 4000),
    });
    if (!res.ok) return false;
    const body = (await res.json().catch(() => null)) as { ok?: unknown } | null;
    return body?.ok === true;
  } catch {
    return false;
  }
}
