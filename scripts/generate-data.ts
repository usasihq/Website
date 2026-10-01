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
import { siteConfig } from "../lib/site-config";
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
  local_corner: {
    month: catalog.currentMonth(),
    lineup: catalog.localCornerLineup(catalog.currentMonth()).people.map((p) => p.slug),
    people: catalog.people.map((p) => catalog.publicPerson(p)),
  },
};

fs.writeFileSync(path.join(outDir, "catalog.json"), JSON.stringify(exportData, null, 2) + "\n");
fs.writeFileSync(path.join(outDir, "search-index.json"), JSON.stringify({ build_at: buildAt, entries: catalog.searchEntries() }) + "\n");
// Full current Jobs list, loaded by the /jobs/ page after first paint (the page itself embeds only the first 30).
const jobs = jobsDirectoryData(catalog);
fs.writeFileSync(path.join(outDir, "jobs.json"), JSON.stringify({ build_at: buildAt, jobs: jobs.items }) + "\n");
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
