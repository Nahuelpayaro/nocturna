import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Space_Mono, Unbounded } from "next/font/google";
import "./globals.css";
import { Preloader } from "@/components/Preloader";
import { isConfigured, siteConfig } from "@/lib/site-config";

// Absolute base for resolving OG/Twitter image URLs. Uses the real domain once
// it's set in siteConfig; until then a placeholder keeps share previews working.
// TODO: this resolves automatically when siteConfig.domain is filled in.
const siteUrl = isConfigured(siteConfig.domain)
  ? `https://${siteConfig.domain}`
  : "https://nocturna.studio";

// Structured data for local SEO (helps Google understand the business and
// surface it for local searches / Google Maps).
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "nocturna creative studio",
  description:
    "Estudio creativo en Buenos Aires. Diseño web, branding y comunicación.",
  slogan: "Vemos lo que otros no ven.",
  url: siteUrl,
  areaServed: { "@type": "Country", name: "Argentina" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Buenos Aires",
    addressCountry: "AR",
  },
  knowsAbout: [
    "Diseño web",
    "Branding",
    "Identidad visual",
    "Comunicación digital",
    "SEO local",
  ],
  ...(isConfigured(siteConfig.email) ? { email: siteConfig.email } : {}),
};

// Wordmark face — "nocturna" is set in Unbounded Bold.
const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-unbounded",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "nocturna creative studio — Diseño web, branding y comunicación",
  description:
    "Estudio creativo en Buenos Aires. Diseño web, branding y comunicación para marcas que quieren destacar. Vemos lo que otros no ven.",
  icons: {
    icon: [{ url: "/logos/favicon.svg", type: "image/svg+xml" }],
    apple: "/logos/nocturna-appicon-negro.svg",
  },
  openGraph: {
    title: "nocturna creative studio",
    description:
      "Diseño web, branding y comunicación para marcas que quieren destacar. Vemos lo que otros no ven.",
    type: "website",
    locale: "es_AR",
    siteName: "nocturna creative studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "nocturna creative studio",
    description: "Vemos lo que otros no ven.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${inter.variable} ${spaceMono.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="grain min-h-full flex flex-col bg-noche text-hueso">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Preloader />
        {children}
      </body>
    </html>
  );
}
