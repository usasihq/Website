import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import { HIRING_INDEX_HREF } from "@/lib/jobs/hiring-index";
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
    for (const title of ["Jobs", "Companies & Labs", "People Behind Big SI", "Open-source people", "Voices of SI", "Resources"]) {
      expect(titles, title).toContain(title);
    }
    expect(text).toContain(`](https://${siteConfig.domain}${HIRING_INDEX_HREF})`);
    expect(text).toContain(`](https://${siteConfig.domain}/jobs/)`);
    expect(text).toContain(`](https://${siteConfig.domain}/voices/)`);
    expect(text).toContain(`](https://${siteConfig.domain}/big-si/)`);
    expect(text).toContain(`](https://${siteConfig.domain}/companies/)`);
    expect(text).toContain(`](https://${siteConfig.domain}/sitemap.xml)`);
  });

  it("lists published companies, Big SI leaders, and the Voices of SI and open-source people", () => {
    const byTitle = Object.fromEntries(sections.map((s) => [s.title, s.items]));
    expect(byTitle["Companies & Labs"].length).toBeGreaterThan(catalog.organizations.length);
    expect(byTitle["People Behind Big SI"].some((i) => i.path === `/big-si/${catalog.leaders[0].slug}/`)).toBe(true);
    expect(byTitle["Open-source people"].some((i) => i.path.startsWith("/people/"))).toBe(true);
    expect(byTitle["Voices of SI"].some((i) => i.path === "/voices/")).toBe(true);
    expect(byTitle["Jobs"].some((i) => i.path === HIRING_INDEX_HREF)).toBe(true);
  });

  it("does not dump individual job-posting pages", () => {
    expect(text).not.toMatch(/\/jobs\/at\/[^/\s)]+\/[^/\s)]+\//);
    const jobsByCompany = sections.find((s) => s.title === "Jobs by company")?.items ?? [];
    expect(jobsByCompany.every((i) => /^\/jobs\/at\/[^/]+\/$/.test(i.path))).toBe(true);
  });

  it("includes every fixed sitemap route somewhere in the file", () => {
    const listed = new Set(sections.flatMap((s) => s.items.map((i) => i.path)));
    for (const path of STATIC_ROUTES) {
      expect(listed.has(path) || text.includes(`](https://${siteConfig.domain}${path})`), path).toBe(true);
    }
  });
});
