import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { absoluteUrl } from "@/lib/paths";
import { SITE_URL, BASE_PATH, siteConfig } from "@/lib/site-config";
import "./globals.css";

const instrumentSans = localFont({
  src: "./fonts/InstrumentSans-latin-wght.woff2",
  weight: "400 700",
  style: "normal",
  variable: "--font-instrument",
  display: "swap",
  adjustFontFallback: "Arial",
});

const sourceSerif = localFont({
  src: [
    { path: "./fonts/SourceSerif4-latin-wght.woff2", weight: "200 900", style: "normal" },
    { path: "./fonts/SourceSerif4-latin-wght-italic.woff2", weight: "200 900", style: "italic" },
  ],
  variable: "--font-source-serif",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

const plexMono = localFont({
  src: [
    { path: "./fonts/IBMPlexMono-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/IBMPlexMono-latin-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}${BASE_PATH}/`),
  title: {
    default: `${siteConfig.name} (${siteConfig.shortName})`,
    template: `%s · ${siteConfig.shortName}`,
  },
  description:
    "An independent directory of U.S. AI organizations and U.S.-led open models, software, and research, with sources for every claim. Not a United States government website.",
  applicationName: siteConfig.shortName,
  alternates: { canonical: absoluteUrl("/") },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#050816",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${sourceSerif.variable} ${plexMono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <SiteHeader siteName={siteConfig.name} shortName={siteConfig.shortName} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
