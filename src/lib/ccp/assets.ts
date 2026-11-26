// Recursos del design system copiados a public/ccp/ con la misma ruta que en assets/.
// En el DS, asset(key) devolvía /_blob/<id>; acá devuelve /ccp/<key>.
export function asset(key: string): string {
  return `/ccp/${key}`;
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function pad2(n: number | string): string {
  const s = String(n);
  return s.length < 2 ? `0${s}` : s;
}

export type Theme = "paper" | "ink" | "paper-nocturna" | "ink-nocturna";

export function themeId(theme?: "paper" | "ink", accent?: "ccp" | "nocturna"): Theme {
  const t = theme === "ink" ? "ink" : "paper";
  return accent === "nocturna" ? `${t}-nocturna` : t;
}

/** Destino de todos los botones "Pedí tu diagnóstico" de la landing. */
export const DIAGNOSTICO_HREF = "/diagnostico";

/** Texto único de los botones que llevan al diagnóstico; coincide con el título del anuncio g2 (auditoría mobile, L4). */
export const CTA_DIAGNOSTICO = "Hacé el diagnóstico gratuito";

/** Instagram de nocturna (ventas/02-canales.md). */
export const INSTAGRAM_URL = "https://www.instagram.com/_____nocturna/";

/** Anclas de la landing (/) (NavBar y columna "Página" del Footer). */
export const NAV_LINKS: Array<[string, string]> = [
  ["Cómo funciona", "#como-funciona"],
  ["Garantías", "#garantias"],
  ["Programa Piloto", "#programa-piloto"],
  ["Preguntas", "#preguntas"],
];
