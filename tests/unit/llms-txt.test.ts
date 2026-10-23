import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import { llmsTxtSections, renderLlmsTxt } from "@/lib/llms-txt";
import { siteConfig } from "@/lib/site-config";
import { STATIC_ROUTES } from "@/lib/site-routes";

const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });

describe("llms.txt", () => {
  const text = renderLlmsTxt(catalog);
  const sections = llmsTxtSections(catalog);

  it("follows the llms.txt layout: H1, summary blockquote, then H2 link sections", () => {
    expect(text.startsWith(`# ${siteConfig.name}\n`)).toBe(true);
    expect(text).toContain(`\n> Independent, unofficial catalog`);
    expect(text).toContain(siteConfig.disclaimer);
    expect(text).toMatch(/^## /m);
    expect(text).toContain("](https://");
    expect(text).not.toContain("](/");
  });

  it("covers the main sitemap areas with absolute URLs", () => {
    const titles = sections.map((s) => s.title);
    for (const title of ["Companies & Labs", "Open Models & Tools", "Resources"]) {
      expect(titles, title).toContain(title);
    }
    expect(titles).not.toContain("Jobs");
    expect(text).not.toContain(`](https://${siteConfig.domain}/jobs/)`);
    expect(text).toContain(`](https://${siteConfig.domain}/companies/)`);
    expect(text).toContain(`](https://${siteConfig.domain}/sitemap.xml)`);
  });

  it("lists published companies", () => {
    const byTitle = Object.fromEntries(sections.map((s) => [s.title, s.items]));
    expect(byTitle["Companies & Labs"].length).toBeGreaterThan(catalog.organizations.length);
  });

  it("includes every fixed sitemap route somewhere in the file", () => {
    const listed = new Set(sections.flatMap((s) => s.items.map((i) => i.path)));
    for (const path of STATIC_ROUTES) {
      expect(listed.has(path) || text.includes(`](https://${siteConfig.domain}${path})`), path).toBe(true);
    }
  });
});
