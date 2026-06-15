"use client";

import { useEffect } from "react";
import { whatsappUrl } from "@/lib/site-config";

type WhatsAppButtonProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Opens WhatsApp with the pre-loaded message from siteConfig.
 * While the number is still a TODO, `whatsappUrl()` returns null: the button
 * renders disabled (and warns in dev) instead of linking nowhere — but the
 * wiring is complete, so it goes live the moment the number is filled in.
 */
export function WhatsAppButton({ children, className }: WhatsAppButtonProps) {
  const url = whatsappUrl();

  useEffect(() => {
    if (!url) {
      console.warn(
        "[nocturna] WhatsApp number not set — complete `whatsapp` in siteConfig to activate the CTA.",
      );
    }
  }, [url]);

  if (!url) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Próximamente: estamos configurando nuestro WhatsApp."
        className={className}
      >
        {children}
      </button>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
