import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import { assess, DEFAULT_INPUT, findConfigs, memoryVerdict, parseInput } from "@/lib/finder";
import { finderHref, MEMORY_PAGES, memoryPage, memoryPageAnswer, memoryPageCandidates, memoryPageInput, memoryPageResults, memoryPageTitle } from "@/lib/hardware";
import { cardImage, pageCards } from "@/lib/page-cards";
import { referenceSearchEntries } from "@/lib/reference-search";
import { FINDER_TASKS, FinderConfig } from "@/lib/schema";
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

/* ---------------- Memory pages ---------------- */

const src = { id: "doc", title: "Docs", url: "https://example.org/docs", publisher: "Example", accessed_at: "2026-10-08" };
const claim = (text: string) => ({ text, source_ids: ["doc"] });
const base = FinderConfig.parse({
  slug: "local-chat",
  title: "Local chat example",
  tasks: ["chat-and-write"],
  runs: "local",
  summary: claim("A local chat setup."),
  components: [
    { role: "runtime", name: "Runtime", url: "https://example.org/runtime" },
    { role: "model", name: "Example 20B", url: "https://example.org/model" },
  ],
  platforms: { values: ["linux", "windows", "macos"], source_ids: ["doc"] },
  accelerators: { values: ["nvidia", "apple-silicon", "cpu-only"], source_ids: ["doc"] },
  memory: { variant: "Example 20B, 4-bit", gpu_gb: 10, system_gb: null, statement: claim("Needs about 10 GB of GPU memory.") },
  skill: "advanced",
  skill_note: "Install from the command line.",
  account_required: { value: false, source_ids: ["doc"] },
  cost_basis: { value: "free-download", note: "Free to download and run.", source_ids: ["doc"] },
  data_location: claim("Processing happens on your computer."),
  getting_started: ["Install the runtime.", "Download the model."],
  getting_started_source_ids: ["doc"],
  limitations: [claim("Long contexts need more memory.")],
  unverified: ["USASI has not tested this configuration."],
  publication_status: "published",
  updated_at: "2026-10-08",
  last_reviewed: "2026-10-08",
  sources: [src],
});
const systemFigure = { ...base, slug: "system-figure", memory: { ...base.memory!, gpu_gb: null, system_gb: 16 } };
const noFigure = { ...base, slug: "no-figure", memory: null };
const hosted = { ...base, slug: "hosted", runs: "hosted" as const, memory: null };
const linuxOnly = { ...base, slug: "linux-only", platforms: { values: ["linux" as const], source_ids: ["doc"] } };
const testedBig = { ...base, slug: "tested-big", memory: { ...base.memory!, gpu_gb: 20 }, tested: { date: "2026-10-08", environment: "Linux, 24 GB GPU", result: "Ran at default context." } };
const synthetic = [base, systemFigure, noFigure, hosted, linuxOnly, testedBig];
const slugs = (xs: { config: { slug: string } }[]) => xs.map((x) => x.config.slug).sort();

describe("memory pages use the finder's own fit logic", () => {
  it("list exactly what the finder marks as a full match with a fitting memory figure, for every task", () => {
    for (const p of MEMORY_PAGES) {
      const listed = memoryPageResults(catalog.finder, p).fits;
      for (const task of FINDER_TASKS) {
        const fromFinder = findConfigs(memoryPageCandidates(catalog.finder, p), memoryPageInput(p, task)).filter((a) => a.fit === "match" && a.memory.kind === "fits");
        expect(slugs(listed.filter((e) => e.config.tasks.includes(task))), `${p.slug} ${task}`).toEqual(slugs(fromFinder));
      }
      for (const e of listed) {
        expect(assess(e.config, memoryPageInput(p)).fit).toBe("match");
        expect(memoryVerdict(e.config, memoryPageInput(p)).kind).toBe("fits");
      }
    }
  });

  it("compares graphics-memory figures with VRAM only, and unified memory with either figure", () => {
    const r = (slug: string) => memoryPageResults(synthetic, memoryPage(slug)!);
    expect(slugs(r("8gb-vram").fits)).toEqual([]);
    expect(slugs(r("8gb-vram").needsMore)).toEqual(["linux-only", "local-chat"]);
    expect(slugs(r("12gb-vram").fits)).toEqual(["linux-only", "local-chat"]);
    // A system-memory figure is never counted against graphics memory.
    for (const p of MEMORY_PAGES.filter((x) => x.kind === "vram")) {
      expect(slugs(memoryPageResults(synthetic, p).fits)).not.toContain("system-figure");
      expect(slugs(memoryPageResults(synthetic, p).systemFigure)).toEqual(["system-figure"]);
    }
    expect(slugs(r("16gb-apple-silicon").fits)).toEqual(["local-chat", "system-figure"]);
    expect(slugs(r("8gb-apple-silicon").needsMore)).toEqual(["local-chat", "system-figure"]);
    // Not documented for macOS: never on an Apple silicon page.
    for (const p of MEMORY_PAGES.filter((x) => x.kind === "apple-silicon")) expect(slugs(memoryPageResults(synthetic, p).fits)).not.toContain("linux-only");
    // No figure, or hosted: never listed as fitting.
    for (const p of MEMORY_PAGES) {
      const res = memoryPageResults(synthetic, p);
      expect(slugs(res.fits)).not.toContain("no-figure");
      expect(slugs(res.fits)).not.toContain("hosted");
      expect(slugs(res.noFigure)).toEqual(["no-figure"]);
    }
    // A USASI test record does not put a 20 GB configuration on the 8 or 16 GB pages.
    expect(slugs(r("16gb-vram").fits)).not.toContain("tested-big");
    expect(slugs(r("24gb-vram").fits)).toContain("tested-big");
  });

  it("links to the finder pre-filled with the same answers", () => {
    for (const p of MEMORY_PAGES) {
      for (const task of ["", ...FINDER_TASKS] as const) {
        const query = finderHref(p, task).split("?")[1];
        expect(parseInput(new URLSearchParams(query))).toEqual(memoryPageInput(p, task));
      }
    }
    expect(finderHref(memoryPage("8gb-vram")!, "chat-and-write")).toBe("/find/?task=chat-and-write&where=local&vram=8&skill=advanced");
    expect(finderHref(memoryPage("16gb-apple-silicon")!)).toBe("/find/?where=local&os=macos&gpu=apple-silicon&ram=16&skill=advanced");
    expect(memoryPageInput(memoryPage("8gb-vram")!)).toEqual({ ...DEFAULT_INPUT, where: "local", gpuGb: 8, skill: "advanced" });
  });

  it("answers first, with counts and names from the data", () => {
    for (const p of MEMORY_PAGES) {
      const r = memoryPageResults(catalog.finder, p);
      const answer = memoryPageAnswer(r);
      expect(answer).toMatch(new RegExp(`^With ${p.gb} GB of`));
      expect(answer).toContain(` ${r.fits.length} documented local`);
      for (const e of r.fits.slice(0, 3)) expect(answer).toContain(e.config.title.replace(/\s*\(.*$/, ""));
      expect(answer).not.toMatch(/\bbest\b/i);
      expect(`${memoryPageTitle(p)} · USASI`.length).toBeLessThanOrEqual(66);
    }
    expect(memoryPageAnswer(memoryPageResults([], MEMORY_PAGES[0]))).toMatch(/none of the documented/);
  });

  it("renders every memory page with ItemList and BreadcrumbList data", async () => {
    const mod = await import("@/app/find/memory/[amount]/page");
    expect(mod.generateStaticParams().map((x) => x.amount)).toEqual(MEMORY_PAGES.map((p) => p.slug));
    for (const p of MEMORY_PAGES) {
      const html = renderToStaticMarkup(await mod.default({ params: Promise.resolve({ amount: p.slug }) }));
      const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1]);
      const [list, crumbs] = ld["@graph"];
      expect(list["@type"]).toBe("ItemList");
      expect(list.numberOfItems).toBe(memoryPageResults(catalog.finder, p).fits.length);
      expect(crumbs["@type"]).toBe("BreadcrumbList");
      expect(crumbs.itemListElement.map((c: { name: string }) => c.name)).toEqual(["Home", "Find AI for my needs", "By memory", expect.any(String)]);
      expect(html).toContain("How this list is made");
      expect(html).toContain("Choose another amount");
      for (const e of memoryPageResults(catalog.finder, p).fits) expect(html).toContain(`id="${e.config.slug}"`);
      const meta = await mod.generateMetadata({ params: Promise.resolve({ amount: p.slug }) });
      expect(String(meta.description).length).toBeLessThanOrEqual(160);
    }
  }, 120_000);

  it("are in the sitemap, site search, preview cards, and known site paths", async () => {
    const sitemap = (await import("@/app/sitemap")).default().map((e) => e.url);
    const search = referenceSearchEntries(catalog, []);
    const cards = new Set(pageCards(catalog).map((c) => c.page));
    const none = { organizations: new Set<string>(), artifacts: new Set<string>(), news: new Set<string>(), hubs: new Set<string>(), licenses: new Set<string>(), explainers: new Set<string>(), paths: new Set<string>(), issues: new Set<string>() };
    const { memoryPageIndexable } = await import("@/lib/hardware");
    const indexable = new Set(["/find/memory/", ...MEMORY_PAGES.filter((p) => memoryPageIndexable(catalog.finder, p)).map((p) => `/find/memory/${p.slug}/`)]);
    for (const href of ["/find/memory/", ...MEMORY_PAGES.map((p) => `/find/memory/${p.slug}/`)]) {
      // Pages that would duplicate another result are noindex and so stay out of the sitemap.
      expect(sitemap.some((u) => u.endsWith(href)), href).toBe(indexable.has(href));
      expect(search.some((e) => e.href === href), href).toBe(true);
      expect(cards.has(href), href).toBe(true);
      expect(isKnownSitePath(href, none), href).toBe(true);
    }
    expect(cardImage(catalog, "/find/memory/8gb-vram/")!.path).toBe("/og/memory/8gb-vram.jpg");
    // The sitemap now holds tens of thousands of pages (jobs, AI on GitHub); allow for a busy machine.
  }, 90_000);
});

describe("memory page indexing", () => {
  it("indexes a page only when it lists enough configurations and differs from the next smaller amount", async () => {
    const { getCatalog } = await import("@/lib/catalog");
    const { MEMORY_PAGES, MIN_INDEXABLE_FITS, memoryPageIndexable, memoryPageResults } = await import("@/lib/hardware");
    const catalog = getCatalog();
    for (const p of MEMORY_PAGES) {
      const fits = memoryPageResults(catalog.finder, p).fits;
      if (fits.length < MIN_INDEXABLE_FITS) expect(memoryPageIndexable(catalog.finder, p)).toBe(false);
    }
    const indexed = MEMORY_PAGES.filter((p) => memoryPageIndexable(catalog.finder, p));
    for (const kind of ["vram", "unified"] as const) {
      const keys = indexed.filter((p) => p.kind === kind).map((p) => memoryPageResults(catalog.finder, p).fits.map((e) => e.config.slug).sort().join("|"));
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
});

describe("VRAM pages and graphics hardware", () => {
  it("never list a configuration documented only for Apple silicon or the processor", async () => {
    const { MEMORY_PAGES: pages, memoryPageResults: results } = await import("@/lib/hardware");
    for (const p of pages.filter((q) => q.kind === "vram")) {
      for (const e of results(catalog.finder, p).fits) {
        expect(e.config.accelerators.values.some((v) => ["nvidia", "amd", "intel"].includes(v)), `${p.slug} ${e.config.slug}`).toBe(true);
      }
    }
  });
});
