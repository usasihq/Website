/**
 * Hugging Face dataset copy of current job listings (usasihq/usasi-ai-jobs).
 * CSV + dataset card only; upload is a separate, token-gated step.
 *
 * Columns match the existing Hub dataset, plus `page` (the listing on
 * unitedstatesofamericasuperintelligence.com). Pay is the first
 * employer-provided range; descriptions are never included.
 */
import { exportCsv } from "../export";
import { absoluteUrl } from "../paths";
import { JOB_SOURCE_LABELS } from "./schema";
import { jobSlug } from "./job-url";
import type { JobItem } from "./search";

export const HF_JOBS_DATASET = "usasihq/usasi-ai-jobs";
export const HF_JOBS_SPACE = "usasihq/usasi-ai-jobs";
export const HF_JOBS_DATASET_URL = `https://huggingface.co/datasets/${HF_JOBS_DATASET}`;
export const HF_JOBS_SPACE_URL = `https://huggingface.co/spaces/${HF_JOBS_SPACE}`;

export const HF_JOBS_FIELDS = [
  { key: "id", description: "USASI posting id (`slug:ats:board:job_id`)" },
  { key: "title", description: "Job title as posted" },
  { key: "employer", description: "Employer name" },
  { key: "employer_slug", description: "USASI organization slug" },
  { key: "locations", description: "Posted location(s), separated by `; `" },
  { key: "countries", description: "Country codes, separated by `; `" },
  { key: "workplace", description: "`remote`, `hybrid`, `on-site`, or `unknown`" },
  { key: "remote", description: "True if workplace is remote; empty if unknown" },
  { key: "employment_type", description: "For example `full-time`" },
  { key: "salary_min", description: "First employer-provided pay range minimum" },
  { key: "salary_max", description: "First employer-provided pay range maximum" },
  { key: "salary_currency", description: "ISO currency code" },
  { key: "salary_period", description: "`year`, `month`, `week`, `day`, or `hour`" },
  { key: "posted_at", description: "Date from the ATS" },
  { key: "posted_date_kind", description: "`first-published` or `last-published`. These are not the same thing." },
  { key: "last_seen", description: "When USASI last saw the posting open" },
  { key: "ats", description: "Applicant-tracking system (`greenhouse`, `ashby`, `lever`, …)" },
  { key: "page", description: "This listing's page on the USASI jobs board" },
  { key: "official_url", description: "The employer's original posting (the authoritative source)" },
] as const;

export type HfJobRow = {
  id: string;
  title: string;
  employer: string;
  employer_slug: string;
  locations: string;
  countries: string;
  workplace: string;
  remote: boolean | "";
  employment_type: string;
  salary_min: number | "";
  salary_max: number | "";
  salary_currency: string;
  salary_period: string;
  posted_at: string;
  posted_date_kind: string;
  last_seen: string;
  ats: string;
  page: string;
  official_url: string;
};

const join = (values: string[]) => values.filter(Boolean).join("; ");
const siteOrigin = (siteUrl: string) => siteUrl.replace(/\/$/, "");

/** Collision rule matches lib/jobs/job-pages.ts: a duplicate slug gets the source job id appended. */
export function hfJobPagePath(job: Pick<JobItem, "id" | "title" | "organization_slug" | "source_job_id">, taken: Set<string>): string {
  let slug = jobSlug(job);
  if (taken.has(`${job.organization_slug}/${slug}`)) {
    slug = `${slug}-${job.source_job_id.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
  }
  taken.add(`${job.organization_slug}/${slug}`);
  return `/jobs/at/${job.organization_slug}/${slug}/`;
}

export function hfJobRows(items: JobItem[], siteUrl: string): HfJobRow[] {
  const origin = siteOrigin(siteUrl);
  const taken = new Set<string>();
  return items.map((job) => {
    const pay = job.salaries.find((s) => s.source_status === "employer-provided") ?? null;
    const path = hfJobPagePath(job, taken);
    return {
      id: job.id,
      title: job.title,
      employer: job.organization_name,
      employer_slug: job.organization_slug,
      locations: join(job.locations),
      countries: join(job.countries),
      workplace: job.workplace,
      remote: job.workplace === "remote" ? true : job.workplace === "unknown" ? "" : false,
      employment_type: job.employment_type,
      salary_min: pay?.min ?? "",
      salary_max: pay?.max ?? "",
      salary_currency: pay?.currency ?? "",
      salary_period: pay?.period ?? "",
      posted_at: job.posted_at ?? "",
      posted_date_kind: job.posted_date_kind ?? "",
      last_seen: job.last_seen,
      ats: job.source_type,
      page: `${origin}${path}`,
      official_url: job.official_url,
    };
  });
}

const tally = (values: string[]) => {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
};
const fmtTally = (entries: [string, number][], label = (k: string) => k) =>
  entries.map(([k, n]) => `${label(k)} ${n.toLocaleString("en-US")}`).join(" · ");

export function hfJobsCsv(rows: HfJobRow[]): string {
  return exportCsv({
    source: "",
    snapshot: "",
    caveat: "",
    fields: HF_JOBS_FIELDS.map((f) => ({ key: f.key, description: f.description })),
    rows: rows as unknown as Record<string, string | number>[],
  });
}

export function hfJobsReadme(rows: HfJobRow[], snapshot: string): string {
  const origin = siteOrigin(absoluteUrl("/"));
  const day = snapshot.slice(0, 10);
  const paid = rows.filter((r) => r.salary_min !== "" || r.salary_max !== "");
  const n = rows.length.toLocaleString("en-US");
  const employers = new Set(rows.map((r) => r.employer_slug)).size;
  const size = rows.length < 1000 ? "n<1K" : rows.length < 10_000 ? "1K<n<10K" : "10K<n<100K";
  const atsLabel = (k: string) => JOB_SOURCE_LABELS[k as keyof typeof JOB_SOURCE_LABELS] ?? k;
  const fieldTable = HF_JOBS_FIELDS.map((f) => `| \`${f.key}\` | ${f.description} |`).join("\n");
  return `---
license: cc-by-4.0
language:
- en
pretty_name: USASI AI Job Listings (snapshot ${day})
size_categories:
- ${size}
tags:
- jobs
- ai
- labor-market
- united-states
configs:
- config_name: default
  data_files:
  - split: train
    path: jobs.csv
---

# USASI AI Job Listings: snapshot of ${day}

Basic metadata for open job postings at U.S. AI companies tracked by **USASI**
([unitedstatesofamericasuperintelligence.com](${origin}/)),
an independent, sourced directory of U.S. AI companies. Each row is one open posting, pulled
from the employer's public applicant-tracking-system (ATS) board.
**No job descriptions are included.** Every row links to its page on the USASI jobs board
(\`page\`) and to the employer's original posting (\`official_url\`).

- Browse live listings: ${origin}/jobs/
- Search this snapshot: [${HF_JOBS_SPACE_URL}](${HF_JOBS_SPACE_URL})
- Related report: [The State of American AI](${origin}/report/)

USASI is an independent project and is not a United States government website.

## Snapshot

| | |
|---|---|
| Source | USASI jobs snapshot (\`data/jobs/current.json\`) |
| Build timestamp | ${snapshot} |
| Rows (open postings) | ${n} |
| Employers | ${employers} |
| Rows with employer-provided pay | ${paid.length.toLocaleString("en-US")}${paid.length ? ` (${fmtTally(tally(paid.map((r) => String(r.salary_currency))))})` : ""} |
| Pay period (rows with pay) | ${paid.length ? fmtTally(tally(paid.map((r) => String(r.salary_period)))) : "—"} |
| Workplace | ${fmtTally(tally(rows.map((r) => r.workplace)))} |
| ATS | ${fmtTally(tally(rows.map((r) => r.ats)), atsLabel)} |

## Fields

| Field | Description |
|---|---|
${fieldTable}

## Limitations

- This is a point-in-time snapshot. Postings close and change, so check every listing on its \`page\` and \`official_url\`.
- \`page\` is the listing on the USASI jobs board. That page is published while the posting is current (confirmed in the last 48 hours); older open rows may 404 until the next site refresh.
- The data is posted by employers. Titles, locations and pay are what the employer published, with no further checks.
- Pay is missing for most rows. Listings with more than one pay range keep only the first employer-provided range. Currencies and periods are mixed, so normalize them before comparing.
- \`posted_at\` means different things on different ATS boards (see the field table above).
- Coverage only reaches the employers USASI tracks through public ATS boards. It is not a census of the AI job market.

## License and attribution

Released as CC BY 4.0, which matches the USASI content license (\`CONTENT_LICENSE.md\` in
[usasihq/Website](https://github.com/usasihq/Website)). Factual fields (names, dates, URLs)
are not claimed as copyrightable. Job titles and pay belong to the employers who posted them.
Employer names and trademarks belong to their owners.

Attribution: "Source: USASI (unitedstatesofamericasuperintelligence.com), CC BY 4.0."
`;
}
