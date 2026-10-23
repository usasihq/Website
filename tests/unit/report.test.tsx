import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Catalog, loadCatalog } from "@/lib/catalog";
import { cardImage, pageCards } from "@/lib/page-cards";
import { organizationsByState } from "@/lib/place-index";
import { stateSlug } from "@/lib/places";
import { referenceSearchEntries } from "@/lib/reference-search";
import {
  compareFigures,
  computeFigures,
  createSnapshot,
  CSV_COLUMNS,
  editionDataHref,
  editionHref,
  editionLabel,
  editionTitle,
  nextEdition,
  licenseFamily,
  percent,
  releaseLicenseFamily,
  releaseQuarter,
  snapshotCsv,
  snapshotProblems,
  type ReportSnapshot,
} from "@/lib/report";
import { catalogDigest, latestEdition, policyLink, previousEdition, readEdition, reportEditions, reportLinks, sinceEdition } from "@/lib/report-editions";
import { reportJsonLd, reportMetadata, reportNames } from "@/lib/report-page";
import { isKnownSitePath, STATIC_ROUTES } from "@/lib/site-routes";
import { validateContent } from "@/lib/validate";
import { artifact, fixtureContent, TODAY as FIXTURE_TODAY } from "../fixtures/content";

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

const root = process.cwd();
const catalog = loadCatalog(path.join(root, "content"), { today: TODAY });
const editions = reportEditions();
const latest = latestEdition()!;

/* ------------------------------------------------------------------ */
/* Counting rules on synthetic records                                 */
/* ------------------------------------------------------------------ */

describe("report counting rules", () => {
  const raw = fixtureContent();
  raw.artifacts.push(
    { file: "artifacts/fixture-nc.yml", data: artifact("fixture-nc", { licenses: [{ name: "Fixture Non-Commercial License", spdx: null, url: null, applies_to: "weights", source_ids: ["s1"] }], released_at: "2026-02-03" }) },
    {
      file: "artifacts/fixture-two-licenses.yml",
      data: artifact("fixture-two-licenses", {
        licenses: [
          { name: "MIT License", spdx: "MIT", url: null, applies_to: "weights", source_ids: ["s1"] },
          { name: "Creative Commons Attribution-NonCommercial 4.0", spdx: "CC-BY-NC-4.0", url: null, applies_to: "weights", source_ids: ["s1"] },
        ],
      }),
    },
    { file: "artifacts/fixture-no-license.yml", data: artifact("fixture-no-license", { licenses: [] }) },
  );
  const fixture = new Catalog(validateContent(raw, { today: FIXTURE_TODAY }), `${FIXTURE_TODAY}T12:00:00.000Z`);
  const rel = (slug: string) => fixture.artifact(slug)!;

  it("classifies weights licenses into families, most restrictive first", () => {
    expect(releaseLicenseFamily(fixture, rel("fixture-fully-open"))).toBe("permissive");
    expect(releaseLicenseFamily(fixture, rel("fixture-open-weight"))).toBe("custom");
    expect(releaseLicenseFamily(fixture, rel("fixture-nc"))).toBe("non-commercial");
    expect(releaseLicenseFamily(fixture, rel("fixture-two-licenses"))).toBe("non-commercial");
    expect(releaseLicenseFamily(fixture, rel("fixture-no-license"))).toBe("none");
    expect(licenseFamily(fixture, { name: "GNU GPL v3", spdx: "GPL-3.0-only", url: null, applies_to: "code", source_ids: ["s1"] })).toBe("copyleft");
  });

  it("keeps date precision: a year alone has no quarter", () => {
    expect(releaseQuarter("2025-08-14")).toBe("2025-Q3");
    expect(releaseQuarter("2026-01")).toBe("2026-Q1");
    expect(releaseQuarter("2025")).toBeNull();
    expect(releaseQuarter(null)).toBeNull();
    expect(percent(0, 0)).toBe("0%");
    expect(percent(1, 1000)).toBe("<1%");
    expect(percent(56, 96)).toBe("58%");
  });

  const now = Date.parse(`${FIXTURE_TODAY}T12:00:00.000Z`);
  const figures = computeFigures(fixture, FIXTURE_TODAY);
  const t = (id: string) => figures.tables.find((x) => x.id === id)!;
  const row = (id: string, key: string) => t(id).rows.find((r) => r.key === key)?.count;

  it("adds up: single-category tables sum to their universe; overlapping ones never exceed it per row", () => {
    expect(snapshotProblems(createSnapshot({ catalog: fixture, edition: FIXTURE_TODAY.slice(0, 7), generatedAt: new Date(now).toISOString(), inputs: { catalog_digest: "x", jobs_digest: null, git_commit: null, content_clean: null, schema_version: "0", rubric_version: "0.2" } }))).toEqual([]);
    for (const table of figures.tables) {
      const sum = table.rows.reduce((n, r) => n + r.count, 0);
      if (!table.overlapping) expect(sum, table.id).toBe(table.universe);
      for (const r of table.rows) expect(r.count, `${table.id}/${r.key}`).toBeLessThanOrEqual(table.universe);
    }
  });

  it("counts drafts and archived records nowhere, and units separately", () => {
    expect(t("org-ownership").universe).toBe(3);
    expect(row("org-structure", "unit")).toBe(1);
    expect(figures.records.organizations).not.toContain("fixture-draft-org");
    expect(figures.records.artifacts).not.toContain("fixture-archived-artifact");
    expect(row("org-hq-state", "OH")).toBe(3);
  });

  it("computes tiers, weights, families, and quarters from each release", () => {
    expect(row("model-tiers", "fully-open")).toBe(1);
    // fixture-open-stack plus the three added releases, whose checklists are all public but carry no rights review.
    expect(row("model-tiers", "open-stack")).toBe(4);
    expect(row("model-tiers", "weights-not-public")).toBe(1);
    expect(row("model-tiers", "unknown")).toBe(1);
    expect(row("model-weights", "unknown")).toBe(1);
    expect(row("model-license-family", "non-commercial")).toBe(2);
    expect(row("model-license-family", "none")).toBe(1);
    expect(row("model-quarters", "year-only")).toBe(1);
    expect(row("model-quarters", "none")).toBe(1);
    expect(row("model-quarters", "2026-Q1")).toBe(1);
    // A quarter with no release is still a row, so the series has no gaps.
    expect(row("model-quarters", "2026-Q2")).toBeGreaterThan(0);
    expect(t("model-quarters").rows.at(-3)!.key).toBe("2026-Q3");
    // The open-stack release lists two organizations and counts for both.
    expect(row("open-weight-organizations", "fixture-unit")).toBe(1);
  });

  it("writes one tidy CSV row per total and table row, quoting where needed", () => {
    const s = createSnapshot({ catalog: fixture, edition: "2026-09", generatedAt: new Date(now).toISOString(), inputs: { catalog_digest: "x", jobs_digest: null, git_commit: null, content_clean: null, schema_version: "0", rubric_version: "0.2" } });
    const lines = snapshotCsv(s).trimEnd().split("\r\n");
    expect(lines[0]).toBe(CSV_COLUMNS.join(","));
    expect(lines).toHaveLength(1 + s.totals.length + s.tables.reduce((n, x) => n + x.rows.length, 0));
    expect(lines.some((l) => l.includes('"Graphics memory (VRAM): 8 GB or less"') || l.includes("No memory figure documented"))).toBe(true);
    expect(lines.find((l) => l.includes(",org-ownership,"))).toMatch(/^2026-09,organizations,org-ownership,Organization records by ownership,organization records,3,false,/);
  });

  it("finds added and removed records between two computations", () => {
    const smaller = new Catalog(validateContent({ ...raw, artifacts: raw.artifacts.filter((d) => !String(d.file).includes("fixture-nc")) }, { today: FIXTURE_TODAY }));
    const c = compareFigures(computeFigures(smaller, FIXTURE_TODAY), computeFigures(fixture, FIXTURE_TODAY));
    expect(c.artifacts.added).toEqual(["fixture-nc"]);
    expect(c.totals.find((x) => x.key === "model_releases")).toMatchObject({ to: expect.any(Number) });
    expect(c.tables.map((x) => x.id)).toContain("model-license-family");
  });
});

/* ------------------------------------------------------------------ */
/* The snapshot script                                                 */
/* ------------------------------------------------------------------ */

describe("npm run report:snapshot", () => {
  it(
    "writes an edition whose numbers equal a recomputation from the catalog at snapshot time",
    () => {
      const at = `${TODAY.slice(0, 7)}-15T12:00:00.000Z`;
      const edition = at.slice(0, 7);
      const out = fs.mkdtempSync(path.join(os.tmpdir(), "usasi-report-"));
      const run = (...extra: string[]) =>
        spawnSync(process.execPath, [path.join(root, "node_modules", "tsx", "dist", "cli.mjs"), "scripts/report-snapshot.ts", edition, "--out", out, "--at", at, ...extra], {
          cwd: root,
          encoding: "utf8",
          env: { ...process.env, USASI_TODAY: TODAY },
        });
      const first = run();
      expect(first.status, first.stderr).toBe(0);
      const written = JSON.parse(fs.readFileSync(path.join(out, `${edition}.json`), "utf8")) as ReportSnapshot;
      expect(snapshotProblems(written)).toEqual([]);
      expect(written.generated_at).toBe(new Date(at).toISOString());
      expect(written.inputs.catalog_digest).toBe(catalogDigest(catalog));
      expect(written.inputs.jobs_digest).toBeNull();

      // Recompute independently from the same inputs and instant.
      const again = computeFigures(catalog, written.data_cutoff);
      expect(written.tables).toEqual(again.tables);
      expect(written.totals).toEqual(again.totals);
      expect(written.findings).toEqual(again.findings);
      expect(written.records).toEqual(again.records);

      // A published edition is never overwritten without --force.
      const second = run();
      expect(second.status).toBe(1);
      expect(second.stderr).toContain("already exists");
      fs.rmSync(out, { recursive: true, force: true });
    },
    180_000,
  );
});

/* ------------------------------------------------------------------ */
/* Committed editions                                                  */
/* ------------------------------------------------------------------ */

describe("published editions", () => {
  it("exist, starting with October 2026, and each is internally consistent", () => {
    expect(editions.map((e) => e.edition)).toContain("2026-10");
    expect(editions[0].edition).toBe("2026-10");
    for (const e of editions) {
      expect(snapshotProblems(e), e.edition).toEqual([]);
      expect(readEdition(path.join(root, "content", "reports", `${e.edition}.json`))).toEqual(e);
      expect(e.title).toBe(editionTitle(e.edition));
      expect(e.data_cutoff.startsWith(e.edition)).toBe(true);
      expect(e.findings.length).toBeGreaterThanOrEqual(3);
      expect(e.findings.length).toBeLessThanOrEqual(5);
    }
    expect(editionTitle("2026-10")).toBe("The State of American AI, October 2026");
    expect(editionLabel("2026-10")).toBe("October 2026");
  });

  it("totals add up across tables, totals, and record lists", () => {
    for (const e of editions) {
      const total = (k: string) => e.totals.find((t) => t.key === k)!.value;
      const table = (id: string) => e.tables.find((t) => t.id === id)!;
      for (const t of e.tables) {
        const sum = t.rows.reduce((n, r) => n + r.count, 0);
        if (t.overlapping) expect(sum, t.id).toBeGreaterThanOrEqual(Math.max(...t.rows.map((r) => r.count)));
        else expect(sum, t.id).toBe(t.universe);
      }
      expect(table("artifact-kinds").rows.find((r) => r.key === "model-release")!.count).toBe(total("model_releases"));
      expect(table("org-structure").rows.find((r) => r.key === "unit")!.count).toBe(total("organization_units"));
      expect(table("finder-runs").rows.find((r) => r.key === "local")!.count).toBe(total("local_configurations"));
      if (e.tables.some((t) => t.id === "jobs-employers")) {
        expect(table("jobs-employers").rows.length).toBe(total("job_employers"));
      }
      expect(e.records.policy.length).toBe(table("policy-types").universe);
    }
  });

  it("states every headline number from the edition's own figures", () => {
    for (const e of editions) {
      const counts = new Set([...e.totals.map((t) => t.value), ...e.tables.flatMap((t) => [t.universe, ...t.rows.map((r) => r.count)])]);
      const universes = [...new Set(e.tables.map((t) => t.universe))];
      for (const f of e.findings) {
        const text = f.text.replace(/Washington, D\.C\./g, "").replace(/\b[A-Za-z]+-[\d.]+\b/g, "");
        for (const m of text.matchAll(/(?<![\d.])(\d[\d,]*)(?![\d,]*(?:%| GB))/g)) expect(counts.has(Number(m[1].replace(/,/g, ""))), `${f.id}: ${m[1]}`).toBe(true);
        for (const m of text.matchAll(/(<?\d+)%/g)) {
          const ok = [...counts].some((c) => universes.some((u) => percent(c, u) === `${m[1]}%`));
          expect(ok, `${f.id}: ${m[1]}%`).toBe(true);
        }
        expect(e.tables.some((t) => t.id === f.table)).toBe(true);
        expect(f.definition.length).toBeGreaterThan(40);
      }
    }
  });

  it("names the next monthly edition", () => {
    expect(nextEdition("2026-10")).toBe("2026-11");
    expect(nextEdition("2026-12")).toBe("2027-01");
    expect(() => nextEdition("2026-13")).toThrow();
  });

  it("reproduces the latest edition from the catalog when the catalog has not changed, and says so when it has", () => {
    const live = computeFigures(catalog, latest.data_cutoff);
    const since = sinceEdition(latest, catalog);
    if (catalogDigest(catalog) === latest.inputs.catalog_digest) {
      expect(since.status).toBe("unchanged");
      const catalogTables = latest.tables.filter((t) => t.section !== "jobs");
      expect(live.tables).toEqual(catalogTables);
      expect(live.records).toEqual(latest.records);
      expect(live.totals).toEqual(latest.totals.filter((t) => t.section !== "jobs"));
    } else {
      expect(since.status).not.toBe("unchanged");
    }
  });

  it("uses neutral wording: catalog records, no rankings or superlatives", () => {
    for (const e of editions) {
      const prose = [e.notice, ...e.findings.flatMap((f) => [f.text, f.definition]), ...e.tables.flatMap((t) => [t.title, t.caption, t.counted])].join(" ");
      expect(prose).not.toMatch(/\b(best|leading|top-ranked|cutting-edge|world-class|dominan\w*|the U\.S\. has|America leads|ahead of)\b/i);
      expect(e.notice).toContain("Not a United States government website.");
    }
  });

  it("serves the committed edition as CSV and JSON downloads", async () => {
    const csv = await import("@/app/report/[edition]/data.csv/route");
    const json = await import("@/app/report/[edition]/data.json/route");
    expect(csv.generateStaticParams()).toEqual(editions.map((e) => ({ edition: e.edition })));
    const params = Promise.resolve({ edition: latest.edition });
    const csvText = await (await csv.GET(new Request("https://x.invalid/"), { params })).text();
    expect(csvText).toBe(snapshotCsv(latest));
    const jsonText = await (await json.GET(new Request("https://x.invalid/"), { params: Promise.resolve({ edition: latest.edition }) })).text();
    expect(JSON.parse(jsonText)).toEqual(latest);
  });
});

/* ------------------------------------------------------------------ */
/* Pages, links, search, cards, and structured data                    */
/* ------------------------------------------------------------------ */

describe("report pages", () => {
  it("are known site paths, in search, with a preview card per edition", () => {
    const slugs = { organizations: new Set<string>(), artifacts: new Set<string>(), news: new Set<string>(), hubs: new Set<string>(), licenses: new Set<string>(), explainers: new Set<string>(), paths: new Set<string>(), issues: new Set<string>(), reports: new Set(editions.map((e) => e.edition)) };
    expect(STATIC_ROUTES).toContain("/report/");
    for (const e of editions) {
      expect(isKnownSitePath(editionHref(e.edition), slugs)).toBe(true);
      expect(cardImage(catalog, editionHref(e.edition))?.path).toBe(`/og/report/${e.edition}.jpg`);
    }
    expect(isKnownSitePath("/report/1999-01/", slugs)).toBe(false);
    expect(pageCards(catalog).filter((c) => c.page.startsWith("/report/"))).toHaveLength(editions.length);
    const search = referenceSearchEntries(catalog, []);
    expect(search.find((x) => x.href === "/report/")?.name).toBe("The State of American AI");
    expect(search.find((x) => x.href === editionHref(latest.edition))?.name).toBe(latest.title);
  });

  it("have a short title with the brand, a description within 160 characters, and Report, Dataset, and breadcrumb data", () => {
    const meta = reportMetadata(latest, false);
    expect((meta.title as { absolute: string }).absolute).toBe(`${latest.title} | USASI`);
    expect(latest.title.length).toBeLessThanOrEqual(60);
    expect(String(meta.description).length).toBeLessThanOrEqual(160);
    expect(String(meta.description)).toMatch(/^October 2026: \d+ U\.S\. AI organization records/);
    expect(meta.openGraph?.images).toEqual([expect.objectContaining({ url: expect.stringMatching(/\/og\/report\/2026-10\.jpg$/) })]);
    const latestMeta = reportMetadata(latest, true);
    expect(latestMeta.alternates?.canonical).toMatch(/\/report\/$/);
    const ld = reportJsonLd(latest, false, "summary");
    const types = ld["@graph"].map((n) => n["@type"]);
    expect(types).toEqual(["Report", "Dataset", "BreadcrumbList"]);
    const dataset = ld["@graph"][1] as { distribution: { contentUrl: string; encodingFormat: string }[]; license: string };
    expect(dataset.distribution.map((d) => d.encodingFormat)).toEqual(["text/csv", "application/json"]);
    expect(dataset.distribution[0].contentUrl).toMatch(/\/report\/2026-10\/data\.csv$/);
    expect(dataset.license).toBe("https://creativecommons.org/licenses/by/4.0/");
  });

  it("render every figure with a caption and counting note, and every link resolves to a page the site builds", async () => {
    const { ReportEdition } = await import("@/components/report/ReportEdition");
    const html = renderToStaticMarkup(
      <ReportEdition
        snapshot={latest}
        previous={previousEdition(latest.edition)}
        latest={latest}
        since={sinceEdition(latest, catalog)}
        hrefFor={reportLinks(catalog)}
        policyHrefFor={(slug) => policyLink(catalog, slug)}
        names={reportNames(catalog)}
        onLatestPage
      />,
    );
    for (const t of latest.tables) {
      expect(html, t.id).toContain(`data-report-table="${t.id}"`);
    }
    expect((html.match(/data-counted/g) ?? []).length).toBe(latest.tables.length);
    if (!previousEdition(latest.edition)) expect(html).toContain('data-testid="report-baseline"');

    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    const anchorsIn = (file: string) => new Set([...fs.readFileSync(path.join(root, file), "utf8").matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
    const pageAnchors: Record<string, Set<string>> = { "/methodology/": anchorsIn("content/pages/methodology.mdx"), "/contribute/": anchorsIn("content/pages/contribute.mdx") };
    const built = new Set<string>([
      ...STATIC_ROUTES,
      ...catalog.organizations.map((o) => `/companies/${o.slug}/`),
      ...catalog.artifacts.map((a) => `/open/${a.slug}/`),
      ...catalog.licenses.map((l) => `/licenses/${l.slug}/`),
      ...catalog.policy.map((d) => `/policy/${d.slug}/`),
      ...organizationsByState(catalog).states.map((s) => `/places/${stateSlug(s.code)}/`),
      ...["8gb-vram", "12gb-vram", "16gb-vram", "24gb-vram", "8gb-apple-silicon", "16gb-apple-silicon", "24gb-apple-silicon", "32gb-apple-silicon", "64gb-apple-silicon"].map((s) => `/find/memory/${s}/`),
      ...editions.flatMap((e) => [editionHref(e.edition), editionDataHref(e.edition, "csv"), editionDataHref(e.edition, "json")]),
    ]);
    const hrefs = [...html.matchAll(/\shref="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
    expect(hrefs.length).toBeGreaterThan(50);
    for (const href of hrefs) {
      if (/^(https:|mailto:)/.test(href)) continue;
      const [pathPart, fragment] = href.split("#");
      if (!pathPart) {
        expect(ids.has(fragment), `missing in-page anchor ${href}`).toBe(true);
        continue;
      }
      const target = pathPart.split("?")[0];
      expect(built.has(target), `link to a page the site does not build: ${href}`).toBe(true);
      if (fragment) expect(pageAnchors[target]?.has(fragment), `missing anchor ${href}`).toBe(true);
    }
  });
});
