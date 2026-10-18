/**
 * Writes the public data exports before `next build`:
 *
 *   public/data/catalog.json       validated, published catalog (schema version,
 *                                  build timestamp, sources, real review dates)
 *   public/data/search-index.json  the cross-directory search index
 *   public/data/build-info.json    the build timestamp shared by every page
 *
 * Only active records (published + eligible) are exported. Drafts, archived
 * records, research notes, and site/payment configuration are never exported.
 */
import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";
import { loadCatalog } from "../lib/catalog";
import { jobsDirectoryData } from "../lib/jobs/directory-data";
import { encodeJobs } from "../lib/jobs/slim";
import { jobLandingSearchEntries } from "../lib/jobs/landing-links";
import { hiringIndexSearchEntry } from "../lib/jobs/hiring-index";
import { EMPTY_WARN_DATASET, layoffSearchEntries, readLayoffs, writeLayoffs } from "../lib/jobs/layoffs";
import { mergeLayoffRefresh } from "../lib/jobs/layoffs-refresh";
import { sourceLibrary } from "../lib/source-library";
import { parseFaq, parseGlossary, referenceSearchEntries } from "../lib/reference-search";
import { githubEntries, toListItem } from "../lib/github/projects";
import { hfDatasetEntries, hfModelEntries, toHfListItem } from "../lib/huggingface/items";
import { BASE_PATH, SITE_URL, siteConfig } from "../lib/site-config";
import { computeTier, RUBRIC_VERSION } from "../lib/openness";
import { SCHEMA_VERSION } from "../lib/schema";

// A configured advertisement must reference an existing local asset.
if (siteConfig.homepageSponsor) {
  const logoPath = path.join(process.cwd(), "public", siteConfig.homepageSponsor.logo);
  if (!fs.existsSync(logoPath) || !fs.lstatSync(logoPath).isFile()) {
    throw new Error("The configured homepage sponsor logo must exist as a local file in public/images/sponsors/.");
  }
}

const buildAt = process.env.USASI_BUILD_AT ?? new Date().toISOString();
// WARN notices: try the published warn-scraper CSVs; keep the last snapshot if a state fails.
try {
  const previous = readLayoffs();
  const { dataset, counts, kept, skipped } = await mergeLayoffRefresh(
    previous.states.length ? previous : EMPTY_WARN_DATASET,
    (process.env.USASI_TODAY ?? buildAt).slice(0, 10),
  );
  writeLayoffs(dataset);
  console.log(`layoffs: ${dataset.states.map((s) => `${s.code}=${s.notices.length}`).join(" ")} (${Object.keys(counts).length} states)`);
  if (kept.length) console.log(`layoffs: kept previous notices for ${kept.join(", ")}`);
  if (skipped.length) console.log(`layoffs: skipped ${skipped.join(", ")}`);
} catch (error) {
  console.warn(`layoffs: refresh failed; using the last snapshot (${error instanceof Error ? error.message : "unknown error"})`);
}
const catalog = loadCatalog(path.join(process.cwd(), "content"), { buildAt });
const outDir = path.join(process.cwd(), "public", "data");
fs.mkdirSync(outDir, { recursive: true });

const exportData = {
  schema_version: SCHEMA_VERSION,
  rubric_version: RUBRIC_VERSION,
  build_at: buildAt,
  notice:
    "Independent project. Not a United States government website. Catalog coverage only: counts reflect published records in this catalog, not a census. Original catalog prose is CC BY 4.0; names and marks belong to their owners.",
  counts: catalog.counts(),
  organizations: catalog.organizations.map((o) => catalog.publicOrganization(o)),
  artifacts: catalog.artifacts.map((a) => ({ ...catalog.publicArtifact(a), computed_tier: computeTier(a) })),
  news: catalog.news,
  // People Behind Local SI: the permanent, alphabetical list of published profiles.
  people: catalog.people.map((p) => catalog.publicPerson(p)),
};

fs.writeFileSync(path.join(outDir, "catalog.json"), JSON.stringify(exportData, null, 2) + "\n");
const glossary = parseGlossary(fs.readFileSync(path.join(process.cwd(), "content", "pages", "glossary.mdx"), "utf8"));
const faqPath = path.join(process.cwd(), "content", "pages", "faq.mdx");
const faq = fs.existsSync(faqPath) ? parseFaq(fs.readFileSync(faqPath, "utf8")) : [];
fs.writeFileSync(
  path.join(outDir, "search-index.json"),
  JSON.stringify({ build_at: buildAt, entries: [...catalog.searchEntries(), ...referenceSearchEntries(catalog, glossary, faq), ...jobLandingSearchEntries(catalog), ...layoffSearchEntries(catalog), hiringIndexSearchEntry(catalog)] }) + "\n",
);
// AI on GitHub: the full ranked list, loaded by /github/ when someone searches, filters, or shows more (the page embeds the first 100).
fs.writeFileSync(path.join(outDir, "github.json"), JSON.stringify({ build_at: buildAt, projects: githubEntries().map(toListItem) }) + "\n");
// AI on Hugging Face: the full ranked lists, loaded by /huggingface/ and /huggingface/datasets/ the same way.
fs.writeFileSync(path.join(outDir, "huggingface-models.json"), JSON.stringify({ build_at: buildAt, items: hfModelEntries().map(toHfListItem) }) + "\n");
fs.writeFileSync(path.join(outDir, "huggingface-datasets.json"), JSON.stringify({ build_at: buildAt, items: hfDatasetEntries().map(toHfListItem) }) + "\n");
// Current Jobs list. jobs.json is the compact form the /jobs/ page loads after first paint (the page
// itself embeds only the first 30; lib/jobs/slim.ts); jobs-full.json has every field, for reuse.
const jobs = jobsDirectoryData(catalog);
fs.writeFileSync(path.join(outDir, "jobs.json"), JSON.stringify(encodeJobs(jobs.items, buildAt)) + "\n");
fs.writeFileSync(path.join(outDir, "jobs-full.json"), JSON.stringify({ build_at: buildAt, jobs: jobs.items }) + "\n");
// Every cited source, with the published records that cite it (loaded by /sources/).
fs.writeFileSync(path.join(outDir, "sources.json"), JSON.stringify({ build_at: buildAt, entries: sourceLibrary(catalog) }) + "\n");
// OpenSearch description, so browsers can add site search (linked from every page's <head>).
const siteRoot = `${SITE_URL}${BASE_PATH}`;
fs.writeFileSync(
  path.join(process.cwd(), "public", "opensearch.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>${siteConfig.shortName}</ShortName>
  <Description>Search the ${siteConfig.shortName} catalog of U.S. AI organizations, open models and tools, explainers, and news.</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="180" height="180" type="image/png">${siteRoot}/apple-icon.png</Image>
  <Url type="text/html" method="get" template="${siteRoot}/search/?q={searchTerms}"/>
</OpenSearchDescription>
`,
);
fs.writeFileSync(path.join(outDir, "build-info.json"), JSON.stringify({ build_at: buildAt, schema_version: SCHEMA_VERSION }) + "\n");

console.log(
  `data: ${catalog.organizations.length} organizations, ${catalog.artifacts.length} artifacts → public/data (build_at ${buildAt})`,
);

// QR code for the configured tip page (shown on /support/), generated from the
// same validated URL as the "Leave a tip" button so the two can never differ.
const qrPath = path.join(process.cwd(), "public", "images", "tip-qr.svg");
if (siteConfig.support.enabled && siteConfig.support.tipUrl) {
  const svg = await QRCode.toString(siteConfig.support.tipUrl, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#050816", light: "#ffffff" },
  });
  fs.writeFileSync(qrPath, svg);
} else if (fs.existsSync(qrPath)) {
  fs.rmSync(qrPath);
}
