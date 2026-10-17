/**
 * WARN Act layoff notices for /jobs/layoffs/ and /jobs/layoffs/<state>/.
 * Built from official state filings collected via Big Local News warn-scraper
 * (or its published CSVs). Client-unsafe: reads data/layoffs/current.json.
 */
import fs from "node:fs";
import path from "node:path";
import type { Catalog } from "../catalog";
import { z } from "../zod";
import { citySlug } from "./geo";
import { jobsLandingData, type LandingPage } from "./landing";
import { stateSlug, US_STATES } from "../places";

export const LAYOFFS_PATH = path.join(process.cwd(), "data/layoffs/current.json");
/** Notices dated within this many days of the fetch are "recent". */
export const LAYOFF_RECENT_DAYS = 180;
export const LAYOFF_MAX_PER_STATE = 800;

export const LAYOFF_STATES = [
  {
    code: "CA",
    slug: "california",
    name: "California",
    sourceName: "California Employment Development Department",
    sourceUrl: "https://edd.ca.gov/en/Jobs_and_Training/Layoff_Services_WARN",
    datasetUrl: "https://raw.githubusercontent.com/APVentureEngine/warn-act-notices/main/data/by-state/ca.csv",
  },
  {
    code: "WA",
    slug: "washington",
    name: "Washington",
    sourceName: "Washington Employment Security Department",
    sourceUrl: "https://esd.wa.gov/about-employees/WARN",
    datasetUrl: "https://raw.githubusercontent.com/APVentureEngine/warn-act-notices/main/data/by-state/wa.csv",
  },
  {
    code: "NY",
    slug: "new-york",
    name: "New York",
    sourceName: "New York Department of Labor",
    sourceUrl: "https://dol.ny.gov/warn-notices",
    datasetUrl: "https://raw.githubusercontent.com/APVentureEngine/warn-act-notices/main/data/by-state/ny.csv",
  },
  {
    code: "TX",
    slug: "texas",
    name: "Texas",
    sourceName: "Texas Workforce Commission",
    sourceUrl: "https://www.twc.texas.gov/data-reports/warn-notice",
    datasetUrl: "https://raw.githubusercontent.com/APVentureEngine/warn-act-notices/main/data/by-state/tx.csv",
  },
] as const;

export type LayoffStateCode = (typeof LAYOFF_STATES)[number]["code"];
export type LayoffStateMeta = (typeof LAYOFF_STATES)[number];

const httpsUrl = z.string().url().refine((v) => v.startsWith("https://"), "Expected an https URL");
const text = (max: number) => z.string().trim().min(1).max(max).refine((v) => !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v), "Expected plain text");

export const WarnNotice = z
  .object({
    id: z.string().trim().min(1).max(80),
    state: z.enum(["CA", "WA", "NY", "TX"]),
    company: text(240),
    city: z.string().trim().max(120).refine((v) => !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v), "Expected plain text"),
    notice_date: z.iso.date().nullable(),
    employees: z.number().int().nonnegative().nullable(),
    source_url: httpsUrl,
  })
  .strict();
export type WarnNotice = z.infer<typeof WarnNotice>;

export const WarnStateFile = z
  .object({
    code: z.enum(["CA", "WA", "NY", "TX"]),
    fetched_at: z.iso.datetime({ offset: true }),
    source_name: text(160),
    source_url: httpsUrl,
    dataset_url: httpsUrl,
    notices: z.array(WarnNotice).max(LAYOFF_MAX_PER_STATE),
  })
  .strict();
export type WarnStateFile = z.infer<typeof WarnStateFile>;

export const WarnDataset = z
  .object({
    version: z.literal(1),
    fetched_at: z.iso.datetime({ offset: true }),
    collector: z.object({
      name: text(160),
      url: httpsUrl,
    }),
    states: z.array(WarnStateFile).max(4),
  })
  .strict();
export type WarnDataset = z.infer<typeof WarnDataset>;

export const EMPTY_WARN_DATASET: WarnDataset = {
  version: 1,
  fetched_at: "1970-01-01T00:00:00.000Z",
  collector: { name: "Big Local News warn-scraper", url: "https://github.com/biglocalnews/warn-scraper" },
  states: [],
};

export function layoffState(codeOrSlug: string): LayoffStateMeta | undefined {
  const key = codeOrSlug.toLowerCase();
  return LAYOFF_STATES.find((s) => s.code.toLowerCase() === key || s.slug === key);
}

export function layoffHref(code: LayoffStateCode): string {
  return `/jobs/layoffs/${stateSlug(code)}/`;
}

/** City text as the filing wrote it, minus a trailing county name when that is the only part after a comma. */
export function cityFromLocation(location: string): string {
  const raw = location.replace(/\s+/g, " ").trim();
  if (!raw || /^(statewide|various|multiple(?: locations)?|unknown|n\/?a|-)$/i.test(raw)) return "";
  const first = raw.split(",")[0]?.trim() ?? "";
  return first.replace(/\s+county$/i, "").trim();
}

export function readLayoffs(file = LAYOFFS_PATH): WarnDataset {
  if (!fs.existsSync(file)) return EMPTY_WARN_DATASET;
  try {
    return WarnDataset.parse(JSON.parse(fs.readFileSync(file, "utf8")));
  } catch {
    console.warn("layoffs: snapshot is unreadable; layoff pages are built without notices");
    return EMPTY_WARN_DATASET;
  }
}

export function writeLayoffs(data: WarnDataset, file = LAYOFFS_PATH): void {
  WarnDataset.parse(data);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(data) + "\n");
  fs.renameSync(`${file}.tmp`, file);
}

export type LayoffJobLink = { path: string; name: string; count: number; kind: "state" | "city" };

export type LayoffStatePage = {
  meta: LayoffStateMeta;
  file: WarnStateFile;
  jobState: LayoffJobLink | null;
  jobCities: LayoffJobLink[];
};

export type LayoffsIndex = {
  dataset: WarnDataset;
  states: LayoffStatePage[];
};

function jobLinksForState(catalog: Catalog, code: LayoffStateCode, notices: WarnNotice[]): { jobState: LayoffJobLink | null; jobCities: LayoffJobLink[] } {
  const landing = jobsLandingData(catalog);
  const statePage = landing.states.find((p) => p.state === code);
  const wanted = new Set(notices.map((n) => citySlug(n.city)).filter(Boolean));
  const jobCities = landing.cities
    .filter((p) => p.state === code && wanted.has(p.city!.slug))
    .map((p) => linkOf(p, "city"))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "en"));
  return { jobState: statePage ? linkOf(statePage, "state") : null, jobCities };
}

const linkOf = (p: LandingPage, kind: "state" | "city"): LayoffJobLink => ({
  path: p.path,
  name: kind === "city" ? p.city!.label : US_STATES[p.state!],
  count: p.count,
  kind,
});

let memo: { catalog: Catalog; data: WarnDataset; index: LayoffsIndex } | null = null;

export function layoffsIndex(catalog: Catalog, data = readLayoffs()): LayoffsIndex {
  if (memo && memo.catalog === catalog && memo.data === data) return memo.index;
  const states: LayoffStatePage[] = [];
  for (const meta of LAYOFF_STATES) {
    const file = data.states.find((s) => s.code === meta.code);
    if (!file || file.notices.length === 0) continue;
    const { jobState, jobCities } = jobLinksForState(catalog, meta.code, file.notices);
    states.push({ meta, file, jobState, jobCities });
  }
  const index = { dataset: data, states };
  memo = { catalog, data, index };
  return index;
}

export function layoffStatePage(catalog: Catalog, slug: string): LayoffStatePage | undefined {
  return layoffsIndex(catalog).states.find((s) => s.meta.slug === slug);
}

export function layoffSitemap(catalog: Catalog, data = readLayoffs()): { path: string; lastModified: string | undefined }[] {
  return layoffsIndex(catalog, data).states.map((s) => ({ path: layoffHref(s.meta.code), lastModified: s.file.fetched_at.slice(0, 10) }));
}

export function layoffSearchEntries(catalog: Catalog, data = readLayoffs()) {
  const index = layoffsIndex(catalog, data);
  const entries = [
    {
      type: "page" as const,
      slug: "jobs-layoffs",
      href: "/jobs/layoffs/",
      name: "WARN Act layoffs and nearby AI jobs",
      summary: `Recent official WARN Act layoff notices in ${index.states.map((s) => s.meta.name).join(", ") || "selected U.S. states"}, with links to open AI jobs nearby.`,
      keywords: "layoffs warn act jobs california washington new york texas",
    },
  ];
  for (const s of index.states) {
    entries.push({
      type: "page",
      slug: `jobs-layoffs-${s.meta.slug}`,
      href: layoffHref(s.meta.code),
      name: `Layoffs in ${s.meta.name}`,
      summary: `${s.file.notices.length} recent WARN Act notices in ${s.meta.name} from ${s.file.source_name}, with open AI-job counts for the state and its cities.`,
      keywords: `layoffs warn ${s.meta.name} ${s.meta.code} jobs`,
    });
  }
  return entries;
}
