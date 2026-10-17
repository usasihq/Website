/**
 * Fetch recent WARN Act notices for CA, WA, NY, and TX from the published
 * warn-scraper CSVs (one official-state file per state). A failed state keeps
 * its previous notices or is omitted. Network access lives here, not in the
 * page render.
 */
import { cityFromLocation, LAYOFF_MAX_PER_STATE, LAYOFF_RECENT_DAYS, LAYOFF_STATES, type LayoffStateMeta, type WarnDataset, type WarnNotice, type WarnStateFile } from "./layoffs";

export const WARN_COLLECTOR = { name: "Big Local News warn-scraper", url: "https://github.com/biglocalnews/warn-scraper" } as const;
const USER_AGENT = "USASI-Jobs/1.0 (+https://unitedstatesofamericasuperintelligence.com/jobs/layoffs/)";
const MAX_BYTES = 8 * 1024 * 1024;
const TIMEOUT_MS = 20_000;

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let quoted = false;
  const s = text.replace(/^\uFEFF/, "");
  const pushRow = () => {
    if (row.some((cell) => cell.length)) rows.push(row);
    row = [];
  };
  while (i < s.length) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        quoted = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      quoted = true;
      i += 1;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      pushRow();
      i += 1;
      continue;
    }
    field += c;
    i += 1;
  }
  if (field.length || row.length) {
    row.push(field);
    pushRow();
  }
  return rows;
}

function plain(value: string, max: number): string {
  return value.replace(/<[^>]*>/g, "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function parseIsoDate(value: string): string | null {
  const v = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v);
  if (!m) return null;
  return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
}

export function parseEmployees(value: string): number | null {
  const trimmed = value.replace(/[, ]/g, "");
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

function headerIndex(header: string[], ...names: string[]): number {
  const wanted = new Set(names.map((n) => n.toLowerCase()));
  return header.findIndex((h) => wanted.has(h.trim().toLowerCase()));
}

export function recentSince(today: string, days = LAYOFF_RECENT_DAYS): string {
  const t = Date.parse(`${today}T00:00:00Z`);
  return new Date(t - days * 86_400_000).toISOString().slice(0, 10);
}

export function noticesFromCsv(csv: string, meta: LayoffStateMeta, today: string): WarnNotice[] {
  const rows = parseCsv(csv);
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const company = headerIndex(header, "company", "company_canonical", "employer", "job_site_name");
  const location = headerIndex(header, "location", "city", "city_name");
  const date = headerIndex(header, "notice_date", "notice date");
  const count = headerIndex(header, "employees_affected", "num_employees", "employees", "total_layoff_number");
  const idCol = headerIndex(header, "id");
  if (company < 0 || date < 0) return [];
  const since = recentSince(today);
  const seen = new Set<string>();
  const notices: WarnNotice[] = [];
  for (const row of rows.slice(1)) {
    const noticeDate = parseIsoDate(row[date] ?? "");
    if (!noticeDate || noticeDate < since || noticeDate > today) continue;
    const name = plain(row[company] ?? "", 240);
    if (!name) continue;
    const city = cityFromLocation(plain(row[location] ?? "", 120));
    const id = plain(row[idCol] ?? "", 80) || `${meta.code}:${noticeDate}:${name}:${city}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80);
    if (seen.has(id)) continue;
    seen.add(id);
    notices.push({
      id,
      state: meta.code,
      company: name,
      city,
      notice_date: noticeDate,
      employees: count >= 0 ? parseEmployees(row[count] ?? "") : null,
      source_url: meta.sourceUrl,
    });
  }
  notices.sort((a, b) => (b.notice_date ?? "").localeCompare(a.notice_date ?? "") || a.company.localeCompare(b.company, "en"));
  return notices.slice(0, LAYOFF_MAX_PER_STATE);
}

async function readBody(response: Response): Promise<string> {
  if (!response.ok || !response.body) throw new Error(`http ${response.status}`);
  const length = Number(response.headers.get("content-length"));
  if (length > MAX_BYTES) throw new Error("too-large");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel();
      throw new Error("too-large");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function fetchStateNotices(
  meta: LayoffStateMeta,
  today: string,
  fetcher: typeof fetch = fetch,
): Promise<WarnStateFile> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetcher(meta.datasetUrl, {
      redirect: "follow",
      signal: controller.signal,
      headers: { Accept: "text/csv,text/plain,*/*", "User-Agent": USER_AGENT },
    });
    const csv = await readBody(response);
    const notices = noticesFromCsv(csv, meta, today);
    return {
      code: meta.code,
      fetched_at: new Date().toISOString(),
      source_name: meta.sourceName,
      source_url: meta.sourceUrl,
      dataset_url: meta.datasetUrl,
      notices,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Refresh every configured state. A failed fetch keeps that state's previous
 * notices; a state with no previous data is skipped.
 */
export async function mergeLayoffRefresh(
  previous: WarnDataset,
  today: string,
  fetcher: typeof fetch = fetch,
  now = () => new Date().toISOString(),
): Promise<{ dataset: WarnDataset; counts: Record<string, number>; kept: string[]; skipped: string[] }> {
  const kept: string[] = [];
  const skipped: string[] = [];
  const states: WarnStateFile[] = [];
  const counts: Record<string, number> = {};
  for (const meta of LAYOFF_STATES) {
    const prior = previous.states.find((s) => s.code === meta.code);
    try {
      const next = await fetchStateNotices(meta, today, fetcher);
      states.push(next);
      counts[meta.code] = next.notices.length;
    } catch {
      if (prior && prior.notices.length) {
        states.push(prior);
        counts[meta.code] = prior.notices.length;
        kept.push(meta.code);
      } else {
        skipped.push(meta.code);
        counts[meta.code] = 0;
      }
    }
  }
  return {
    dataset: { version: 1, fetched_at: now(), collector: WARN_COLLECTOR, states },
    counts,
    kept,
    skipped,
  };
}
