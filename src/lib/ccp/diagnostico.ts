// Diagnóstico gratuito de CCP y lista de espera: validación y cálculo puros.
// Fuente: ventas/02-canales.md ("Cálculo" y "Las preguntas de /diagnostico") y
// Transfers/nocturna-landing/TEXTOS-LISTA-DE-ESPERA.md. Lo usan la página y la Server Action:
// el servidor vuelve a validar y a calcular con estas mismas funciones.
// Sin imports a propósito: node --test lo carga directo (sintaxis TypeScript borrable).

export type Moneda = "USD" | "ARS";
export type Periodo = "mes" | "semana";

/** Lo que carga el dueño, tal como viene de los campos. */
export type DiagnosticoInput = {
  consultas: string;
  periodo: Periodo | string;
  visitas: string;
  operaciones: string;
  comision: string;
  moneda: Moneda | string;
  respondeATiempo: string;
};

export type CampoDiagnostico = "consultas" | "visitas" | "operaciones" | "comision" | "moneda" | "respondeATiempo";

/** Respuestas validadas, con las consultas ya pasadas a mes. */
export type Respuestas = {
  consultasMes: number;
  visitasMes: number;
  operacionesMes: number;
  comision: number;
  moneda: Moneda;
  respondeATiempo: number;
};

export type Resultado = { valorConsulta: number; expuestas: number; escala: number };

// PROVISORIO: textos de error del diagnóstico, pendientes del PM.
export const ERRORES_DIAGNOSTICO = {
  consultas: "Escribí cuántas consultas te llegan.",
  consultasCero: "Las consultas tienen que ser más de 0.",
  visitas: "Escribí cuántas visitas hacen por mes.",
  operaciones: "Escribí cuántas operaciones cierran por mes.",
  comision: "Escribí cuánto te queda en promedio por operación.",
  comisionCero: "El monto tiene que ser más de 0.",
  moneda: "Elegí pesos o dólares.",
  respondeATiempo: "Elegí cuántas respondés en menos de 5 minutos.",
  numero: "Escribí solo números enteros.",
} as const;

// PROVISORIO: texto del control (la regla es de 02-canales, el texto todavía no).
export const MENSAJE_CONTROL = "Revisá los números: las visitas no pueden ser más que las consultas, ni las operaciones más que las visitas.";

export type ValidacionDiagnostico =
  | { ok: true; respuestas: Respuestas }
  | {
      ok: false;
      /** Errores por campo, en el orden de la página. */
      errores: Partial<Record<CampoDiagnostico, string>>;
      /** Mensaje del control visitas ≤ consultas y operaciones ≤ visitas, o null. */
      control: string | null;
      /** Campos que no cumplen el control. */
      camposControl: CampoDiagnostico[];
    };

/** Entero ≥ 0. Acepta espacios y puntos de miles ("3.000"); rechaza decimales y signos. */
export function parseEntero(raw: string): number | null {
  const s = String(raw ?? "").replace(/[\s.]/g, "");
  if (!/^\d{1,12}$/.test(s)) return null;
  return Number(s);
}

/** Consultas por semana a consultas por mes: round(semana × 52 / 12). */
export function semanaAMes(porSemana: number): number {
  return Math.round((porSemana * 52) / 12);
}

/** De cada 10 consultas, las que no se responden en menos de 5 minutos. */
export function proporcionExpuesta(respondeATiempo: number): number {
  return (10 - respondeATiempo) / 10;
}

/** Cada 10 % de las consultas expuestas que se recuperen, por el valor de una consulta. */
export function escala(expuestas: number, valorConsulta: number): number {
  return (expuestas * valorConsulta) / 10;
}

export function validarDiagnostico(input: DiagnosticoInput): ValidacionDiagnostico {
  const errores: Partial<Record<CampoDiagnostico, string>> = {};
  const entero = (campo: CampoDiagnostico, raw: string, vacio: string): number | null => {
    if (String(raw ?? "").trim() === "") {
      errores[campo] = vacio;
      return null;
    }
    const n = parseEntero(raw);
    if (n === null) errores[campo] = ERRORES_DIAGNOSTICO.numero;
    return n;
  };

  const consultas = entero("consultas", input.consultas, ERRORES_DIAGNOSTICO.consultas);
  if (consultas === 0) errores.consultas = ERRORES_DIAGNOSTICO.consultasCero;
  const visitas = entero("visitas", input.visitas, ERRORES_DIAGNOSTICO.visitas);
  const operaciones = entero("operaciones", input.operaciones, ERRORES_DIAGNOSTICO.operaciones);
  const comision = entero("comision", input.comision, ERRORES_DIAGNOSTICO.comision);
  if (comision === 0) errores.comision = ERRORES_DIAGNOSTICO.comisionCero;
  const moneda = input.moneda === "USD" || input.moneda === "ARS" ? input.moneda : null;
  if (!moneda) errores.moneda = ERRORES_DIAGNOSTICO.moneda;
  const q5 = String(input.respondeATiempo ?? "").trim() === "" ? null : parseEntero(input.respondeATiempo);
  if (q5 === null || q5 > 10) errores.respondeATiempo = ERRORES_DIAGNOSTICO.respondeATiempo;

  if (Object.keys(errores).length || consultas === null || visitas === null || operaciones === null || comision === null || !moneda || q5 === null) {
    return { ok: false, errores, control: null, camposControl: [] };
  }

  const consultasMes = input.periodo === "semana" ? semanaAMes(consultas) : consultas;
  const camposControl: CampoDiagnostico[] = [];
  if (visitas > consultasMes) camposControl.push("visitas");
  if (operaciones > visitas) camposControl.push("operaciones");
  if (camposControl.length) return { ok: false, errores, control: MENSAJE_CONTROL, camposControl };

  return { ok: true, respuestas: { consultasMes, visitasMes: visitas, operacionesMes: operaciones, comision, moneda, respondeATiempo: q5 } };
}

/** Cálculo de 02-canales. No hay total de dinero perdido: solo valor de una consulta y escala. */
export function calcularDiagnostico(r: Respuestas): Resultado {
  const valorConsulta = (r.operacionesMes * r.comision) / r.consultasMes;
  const expuestas = r.consultasMes * proporcionExpuesta(r.respondeATiempo);
  return { valorConsulta, expuestas, escala: escala(expuestas, valorConsulta) };
}

/** Monto redondeado con separador de miles es-AR: "USD 3.000" o "$ 1.500.000". */
export function formatMonto(n: number, moneda: Moneda): string {
  const valor = Math.round(n).toLocaleString("es-AR", { maximumFractionDigits: 0 });
  return `${moneda === "USD" ? "USD" : "$"} ${valor}`;
}

/* ---------- Lista de espera ---------- */

export type CampoInscripcion = "nombre" | "inmobiliaria" | "whatsapp" | "acepta";

export type InscripcionInput = { nombre: string; inmobiliaria: string; whatsapp: string; acepta: boolean };

export type Inscripcion = { nombre: string; inmobiliaria: string; whatsapp: string };

export const ERRORES_INSCRIPCION: Record<CampoInscripcion, string> = {
  nombre: "Escribí tu nombre.",
  inmobiliaria: "Escribí el nombre de tu inmobiliaria.",
  whatsapp: "Escribí tu WhatsApp con el código de área, por ejemplo 11 5555 5555.",
  acepta: "Marcá la casilla para que podamos escribirte.",
};

/** Largo máximo de nombre e inmobiliaria (el campo tiene el mismo maxLength). */
export const MAX_TEXTO = 120;

/**
 * WhatsApp argentino a E.164 móvil (+549 + 10 dígitos). Acepta el código de área con o sin 0,
 * con o sin +54 / 9, y el 15 después del código de área. Sin código de área devuelve null.
 */
export function normalizarWhatsapp(raw: string): string | null {
  let n = String(raw ?? "").replace(/\D/g, "");
  if (n.startsWith("00")) n = n.slice(2);
  if (n.startsWith("54") && n.length >= 12) {
    n = n.slice(2);
    if (n.startsWith("9")) n = n.slice(1);
  } else if (n.startsWith("0")) {
    n = n.slice(1);
  }
  if (n.length === 12) {
    // Código de área + 15 + número: 11 es de 2 dígitos; el resto, de 3 o 4.
    const at = n.startsWith("11") ? [2] : [3, 4];
    const i = at.find((k) => n.slice(k, k + 2) === "15");
    if (i === undefined) return null;
    n = n.slice(0, i) + n.slice(i + 2);
  }
  // 10 dígitos que empiezan con un código de área: 11 o 2xx / 3xx.
  if (!/^(11|[23]\d)\d{8}$/.test(n)) return null;
  return `+549${n}`;
}

/** +5491155555555 → "11 5555 5555"; otros códigos de área como "351 555 5555". */
export function formatWhatsapp(e164: string): string {
  const n = e164.replace(/^\+549/, "");
  if (n.length !== 10) return e164;
  return n.startsWith("11") ? `${n.slice(0, 2)} ${n.slice(2, 6)} ${n.slice(6)}` : `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}

export function validarInscripcion(
  input: InscripcionInput,
): { ok: true; datos: Inscripcion } | { ok: false; errores: Partial<Record<CampoInscripcion, string>> } {
  const errores: Partial<Record<CampoInscripcion, string>> = {};
  const nombre = String(input.nombre ?? "").trim();
  const inmobiliaria = String(input.inmobiliaria ?? "").trim();
  if (!nombre || nombre.length > MAX_TEXTO) errores.nombre = ERRORES_INSCRIPCION.nombre;
  if (!inmobiliaria || inmobiliaria.length > MAX_TEXTO) errores.inmobiliaria = ERRORES_INSCRIPCION.inmobiliaria;
  const whatsapp = normalizarWhatsapp(input.whatsapp);
  if (!whatsapp) errores.whatsapp = ERRORES_INSCRIPCION.whatsapp;
  if (input.acepta !== true) errores.acepta = ERRORES_INSCRIPCION.acepta;
  if (Object.keys(errores).length || !whatsapp) return { ok: false, errores };
  return { ok: true, datos: { nombre, inmobiliaria, whatsapp } };
}
