import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

describe("visual design tokens and header chrome", () => {
  it("defines a 72ch reading measure and a 12.5px-or-higher type floor", () => {
    const tokens = read("app/tokens.css");
    expect(tokens).toMatch(/--measure:\s*72ch;/);
    expect(tokens).toMatch(/--text-label:\s*0\.8125rem;/);
    expect(tokens).toMatch(/--text-ui:\s*0\.875rem;/);
    expect(tokens).toMatch(/--text-body:\s*1\.0625rem;/);
    const css = read("app/globals.css");
    expect(css).toContain('@import "./tokens.css"');
    expect(css).toContain("--max-width-measure: var(--measure)");
    expect(css).toContain("max-width: var(--measure)");
    expect(css).toContain("--text-xs: var(--text-label)");
  });

  it("keeps Instrument Sans, Source Serif 4, and Plex Mono self-hosted", () => {
    const layout = read("app/layout.tsx");
    expect(layout).toContain("next/font/local");
    expect(layout).toContain("./fonts/InstrumentSans-latin-wght.woff2");
    expect(layout).toContain("./fonts/SourceSerif4-latin-wght.woff2");
    expect(layout).toContain("./fonts/IBMPlexMono-latin-400.woff2");
    expect(layout).not.toMatch(/fonts\.googleapis|fonts\.gstatic|typekit|use\.typekit/);
    for (const file of [
      "app/fonts/InstrumentSans-latin-wght.woff2",
      "app/fonts/IBMPlexMono-latin-400.woff2",
      "app/fonts/SourceSerif4-latin-wght.woff2",
    ]) {
      expect(fs.existsSync(path.join(ROOT, file)), file).toBe(true);
    }
  });

  it("keeps the independence line and moves secondary links into More, not a 9-link utility bar", () => {
    const header = read("components/SiteHeader.tsx");
    expect(header).toContain('data-testid="header-disclaimer"');
    expect(header).toContain("More");
    expect(header).toContain('aria-label="Reference"');
    expect(header).not.toMatch(/REFERENCE\.filter\(\(r\) => r\.bar\)/);
    expect(header).not.toContain("hidden shrink-0 sm:block");
  });

  it("does not change PostHog or privacy-page copy", () => {
    const privacy = read("content/pages/privacy.mdx");
    expect(privacy).toContain('<h2 id="posthog">PostHog</h2>');
    expect(privacy).toContain("us.i.posthog.com");
    expect(privacy).toContain("e.unitedstatesofamericasuperintelligence.com");
    expect(privacy).toMatch(/cookie-free/i);
    const analytics = read("public/analytics.js");
    expect(analytics).toContain("posthog.init");
  });
});
