/**
 * Single source of truth for every contact / external datum of the studio.
 *
 * NONE of these exist yet. Fill them in HERE — in one place — when they do.
 * Nothing contact-related should be hardcoded anywhere else in the codebase.
 * Each pending value is marked `TODO` and guarded by `isConfigured()` so the
 * UI degrades gracefully until the real data lands.
 */
export const siteConfig = {
  name: "nocturna creative studio",
  shortName: "nocturna",
  tagline: "Vemos lo que otros no ven.",

  domain: "TODO", // TODO: completar — ej. nocturna.studio (sin dominio todavía)
  whatsapp: "TODO", // TODO: completar — número con código de país, sin signos. ej. 549XXXXXXXXXX
  whatsappMessage:
    "Hola nocturna, vi su web y me interesa hablar sobre un proyecto.",
  email: "TODO", // TODO: completar — ej. hola@nocturna.studio
  instagram: "TODO", // TODO: completar — ej. @nocturna.studio
  formEndpoint: "TODO", // TODO: completar — endpoint del formulario (Formspree / propio)
} as const;

/** A value is real when it isn't the TODO placeholder (and isn't empty). */
export function isConfigured(value: string): boolean {
  return value !== "TODO" && value.trim().length > 0;
}

/**
 * Builds the wa.me deep link with the pre-loaded message.
 * Returns `null` while the number is still a TODO so callers can disable the CTA.
 */
export function whatsappUrl(): string | null {
  if (!isConfigured(siteConfig.whatsapp)) return null;
  const text = encodeURIComponent(siteConfig.whatsappMessage);
  return `https://wa.me/${siteConfig.whatsapp}?text=${text}`;
}
