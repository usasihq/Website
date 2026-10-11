/**
 * Builds the Hugging Face dataset copy of the catalog in
 * reports/automation/hf-dataset/ (not committed). Upload is a separate,
 * owner-approved step (see docs/AUTOMATION.md).
 *
 * Included: published organizations, open models and tools, and news items,
 * as summary CSVs (for the dataset viewer) and full JSON Lines with every
 * source and date. Excluded: People Behind Local AI profiles and job postings.
 *
 * Usage: npx tsx scripts/hf-dataset.ts
 */
import fs from "node:fs";
import path from "node:path";
import { getCatalog } from "../lib/catalog";
import { artifactExport, exportCsv, orgExport } from "../lib/export";
import { absoluteUrl } from "../lib/paths";

const SITE_URL = absoluteUrl("/").replace(/\/$/, "");

const out = path.join("reports", "automation", "hf-dataset");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "full"), { recursive: true });

const catalog = getCatalog();
const exported = JSON.parse(fs.readFileSync(path.join("public", "data", "catalog.json"), "utf8")) as {
  schema_version: string;
  rubric_version: string;
  build_at: string;
  organizations: unknown[];
  artifacts: unknown[];
  news: unknown[];
};
const snapshot = exported.build_at;

const orgs = orgExport(catalog.organizations.map((o) => catalog.toOrgListItem(o)), SITE_URL, "", snapshot);
const arts = artifactExport(catalog.artifacts.map((a) => catalog.toArtifactListItem(a)), SITE_URL, "", snapshot);
const news = {
  fields: ["slug", "title", "page", "category", "event_date", "published_at", "summary", "related_organizations", "related_artifacts", "source_urls"].map((key) => ({ key, description: "" })),
  rows: catalog.news.map((n) => ({
    slug: n.slug,
    title: n.title,
    page: absoluteUrl(`/news/${n.slug}/`),
    category: n.category,
    event_date: n.event_date,
    published_at: n.published_at,
    summary: n.summary.text,
    related_organizations: n.related_organizations.join("; "),
    related_artifacts: n.related_artifacts.join("; "),
    source_urls: n.sources.map((s) => s.url).join(" "),
  })),
};

fs.writeFileSync(path.join(out, "organizations.csv"), exportCsv(orgs));
fs.writeFileSync(path.join(out, "artifacts.csv"), exportCsv(arts));
fs.writeFileSync(path.join(out, "news.csv"), exportCsv({ ...news, source: "", snapshot, caveat: "" }));
const jsonl = (rows: unknown[]) => rows.map((r) => JSON.stringify(r)).join("\n") + "\n";
fs.writeFileSync(path.join(out, "full", "organizations.jsonl"), jsonl(exported.organizations));
fs.writeFileSync(path.join(out, "full", "artifacts.jsonl"), jsonl(exported.artifacts));
fs.writeFileSync(path.join(out, "full", "news.jsonl"), jsonl(exported.news));

const fieldTable = (fields: { key: string; description: string }[]) => fields.map((f) => `| \`${f.key}\` | ${f.description} |`).join("\n");
const readme = `---
license: cc-by-4.0
language:
- en
pretty_name: USASI catalog of U.S. AI organizations and open models
tags:
- ai-policy
- open-source
- model-licenses
- united-states
- catalog
size_categories:
- n<1K
configs:
- config_name: artifacts
  data_files: artifacts.csv
  default: true
- config_name: organizations
  data_files: organizations.csv
- config_name: news
  data_files: news.csv
---

# USASI catalog

A snapshot of the [USASI catalog](${SITE_URL}/) (United States of America Superintelligence): an independent, sourced reference on U.S. AI organizations and U.S.-led open models and tools. USASI is an independent project and is not a United States government website.

Snapshot: \`${snapshot}\` (catalog schema ${exported.schema_version}, openness rubric ${exported.rubric_version}). The live site is updated daily; [${SITE_URL}/data/catalog.json](${SITE_URL}/data/catalog.json) always has the latest full export.

## What is here

| File | Rows | What it contains |
|---|---|---|
| \`artifacts.csv\` | ${arts.rows.length} | Open models, model families, software, datasets, and evaluation tools: type, organizations, availability, licenses, release date, last review |
| \`organizations.csv\` | ${orgs.rows.length} | Companies, labs, and institutions: legal name, headquarters, roles, sectors, ownership category, number of linked open records, last review |
| \`news.csv\` | ${news.rows.length} | Dated news items about catalog records, each with its primary source links |
| \`full/*.jsonl\` | | The same published records with every claim, source, and date, as on the site |

Every row links to its page on the site, where each statement cites a primary source (model cards, license files, release notes, official pages, filings) with the date it was read.

### artifacts.csv

| Column | Meaning |
|---|---|
${fieldTable(arts.fields)}

### organizations.csv

| Column | Meaning |
|---|---|
${fieldTable(orgs.fields)}

## How it was made, and its limits

- Records are written from primary sources and checked by automated validation; see the [methodology](${SITE_URL}/methodology/). News items are researched and written daily by an AI assistant without individual human review, as the site discloses.
- Coverage is selective. Counts describe this catalog, not the field: this is not a census, a ranking, or a measure of capability.
- The catalog deliberately records no funding, valuations, revenue, staff or user counts, or benchmark scores.
- Availability and openness fields describe documented availability under the catalog's own rules; they are not certifications.
- People Behind Local AI profiles and job postings from the site are not included.

## License and attribution

Original catalog text is licensed under CC BY 4.0. Suggested attribution: "Source: USASI catalog (unitedstatesofamericasuperintelligence.com), CC BY 4.0." Facts such as names, dates, license identifiers, and URLs are not claimed as copyrighted. Models, software, datasets, and documents described in the catalog keep their own licenses. Names and marks belong to their owners. See [reuse terms](${SITE_URL}/reuse/#terms).

Corrections: [${SITE_URL}/contribute/#corrections](${SITE_URL}/contribute/#corrections).
`;
fs.writeFileSync(path.join(out, "README.md"), readme);
for (const f of ["README.md", "artifacts.csv", "organizations.csv", "news.csv", "full/organizations.jsonl", "full/artifacts.jsonl", "full/news.jsonl"]) {
  console.log(`${f.padEnd(26)} ${(fs.statSync(path.join(out, f)).size / 1024).toFixed(0).padStart(6)} KiB`);
}
