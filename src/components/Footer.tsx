import { Nocturna } from "./Nocturna";
import { navLinks } from "@/lib/content";
import { isConfigured, siteConfig } from "@/lib/site-config";

/**
 * Footer — a quiet sign-off. Contacto already carries the call to action right
 * above, so the footer deliberately does NOT repeat it: just the wordmark, the
 * navigation, optional social links, and the credit.
 */
export function Footer() {
  return (
    <footer className="border-t border-gris-sutil px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <a href="#inicio" aria-label="nocturna — volver arriba">
            <Nocturna className="text-2xl" />
          </a>

          <nav
            aria-label="Secciones"
            className="flex flex-wrap gap-x-8 gap-y-3"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-hueso/70 transition-colors duration-200 hover:text-hueso"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex gap-6">
            {isConfigured(siteConfig.instagram) && (
              <a
                href={`https://instagram.com/${siteConfig.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-hueso/70 transition-colors duration-200 hover:text-hueso"
              >
                Instagram
              </a>
            )}
            {isConfigured(siteConfig.email) && (
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-sm text-hueso/70 transition-colors duration-200 hover:text-hueso"
              >
                Email
              </a>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-gris-sutil pt-8 text-xs text-gris sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 nocturna creative studio</p>
          <p className="font-mono tracking-wide">Buenos Aires, Argentina</p>
        </div>
      </div>
    </footer>
  );
}
