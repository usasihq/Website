import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import YAML from "yaml";
import { describe, expect, it, vi } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import { cardImage, pageCards } from "@/lib/page-cards";
import { policyHeading, policyHref, policyPageTitle, relatedPolicies, summarySentences } from "@/lib/policy";
import { referenceSearchEntries } from "@/lib/reference-search";
import { isKnownSitePath } from "@/lib/site-routes";

// Records reviewed after the suite's fixed USASI_TODAY must still load, as in the other catalog suites.
const TODAY = new Date().toISOString().slice(0, 10);
vi.stubEnv("USASI_TODAY", TODAY);
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; prefetch?: boolean }) => {
    delete rest.prefetch;
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: TODAY });

/* ---------------- Policy pages ---------------- */

const policyDir = path.join(process.cwd(), "content", "policy");
const publishedPolicy = fs
  .readdirSync(policyDir)
  .filter((f) => f.endsWith(".yml"))
  .map((f) => YAML.parse(fs.readFileSync(path.join(policyDir, f), "utf8")) as { slug: string; publication_status: string })
  .filter((d) => d.publication_status === "published")
  .map((d) => d.slug)
  .sort();

describe("policy document pages", () => {
  it("gives every published policy YAML its own page, sitemap entry, search entry, and card", async () => {
    expect(publishedPolicy.length).toBeGreaterThan(0);
    const mod = await import("@/app/policy/[slug]/page");
    expect(mod.generateStaticParams().map((x) => x.slug).sort()).toEqual(publishedPolicy);
    const sitemap = (await import("@/app/sitemap")).default().map((e) => e.url);
    const search = referenceSearchEntries(catalog, []);
    const cards = new Set(pageCards(catalog).map((c) => c.page));
    for (const slug of publishedPolicy) {
      expect(sitemap.some((u) => u.endsWith(`/policy/${slug}/`)), slug).toBe(true);
      expect(search.find((e) => e.type === "policy" && e.slug === slug)?.href).toBe(`/policy/${slug}/`);
      expect(cards.has(policyHref(slug)), slug).toBe(true);
      expect(cardImage(catalog, policyHref(slug))!.path).toBe(`/og/policy/${slug}.jpg`);
      expect(isKnownSitePath(`/policy/${slug}/`, { organizations: new Set(), artifacts: new Set(), news: new Set(), hubs: new Set(), licenses: new Set(), explainers: new Set(), paths: new Set(), issues: new Set(), policy: new Set(publishedPolicy) })).toBe(true);
    }
  });

  it("renders each page from the record: heading with identifier, provisions, sources, and a way back to the tracker", async () => {
    const mod = await import("@/app/policy/[slug]/page");
    for (const d of catalog.policy) {
      const html = renderToStaticMarkup(await mod.default({ params: Promise.resolve({ slug: d.slug }) }));
      const h1 = html.match(/<h1[^>]*>(.*?)<\/h1>/)![1].replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
      expect(h1).toBe(policyHeading(d));
      if (d.identifier && d.document_type !== "executive-order" && d.document_type !== "omb-memorandum") expect(h1).toContain(d.identifier);
      expect(html).toContain(`href="/policy/#${d.slug}"`);
      for (const s of d.sources) expect(html).toContain(`href="${s.url.replace(/&/g, "&amp;")}"`);
      for (const sentence of summarySentences(d.summary.text)) expect(html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&")).toContain(sentence);
      const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1]);
      const [main, crumbs] = ld["@graph"];
      expect(crumbs["@type"]).toBe("BreadcrumbList");
      if (["law", "executive-order", "presidential-memorandum", "omb-memorandum", "regulation"].includes(d.document_type)) {
        expect(main["@type"]).toBe("Legislation");
        expect(main.legislationJurisdiction).toBe("US");
        expect(main.legislationDate).toBe(d.date);
        if (d.identifier) expect(main.legislationIdentifier).toBe(d.identifier);
      } else {
        expect(main["@type"]).toBe("Article");
        expect(main.about.datePublished).toBe(d.date);
      }
      const meta = await mod.generateMetadata({ params: Promise.resolve({ slug: d.slug }) });
      expect(String(meta.title).length, d.slug).toBeLessThanOrEqual(60);
      expect(String(meta.description).length).toBeLessThanOrEqual(160);
    }
  });

  it("starts with EO 14434 as recorded", () => {
    const eo = catalog.policy.find((d) => d.slug === "eo-14434")!;
    expect(policyHeading(eo)).toBe("Executive Order 14434: Inaugurating the Era of Super Intelligence");
    expect(policyPageTitle(eo)).toBe("Executive Order 14434: summary, key provisions & sources");
  });

  it("relates documents only through what the records say", () => {
    const m2410 = catalog.policy.find((d) => d.slug === "m-24-10")!;
    const rel = relatedPolicies(m2410, catalog.policy);
    expect(rel[0]).toMatchObject({ relation: "Replaced by", doc: { slug: "m-25-21" } });
    const m2521 = relatedPolicies(catalog.policy.find((d) => d.slug === "m-25-21")!, catalog.policy);
    expect(m2521.find((r) => r.doc.slug === "m-24-10")?.relation).toBe("Replaces");
    for (const d of catalog.policy) expect(relatedPolicies(d, catalog.policy).some((r) => r.doc.slug === d.slug)).toBe(false);
  });

  it("splits summaries into sentences without breaking abbreviations", () => {
    expect(summarySentences('Covers 15 U.S.C. 9401(3) terms. It applies to U.S. agencies. "Quoted" ends.')).toEqual([
      "Covers 15 U.S.C. 9401(3) terms.",
      "It applies to U.S. agencies.",
      '"Quoted" ends.',
    ]);
  });
});
