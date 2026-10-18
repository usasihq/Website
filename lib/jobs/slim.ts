/**
 * The compact /data/jobs.json the /jobs/ directory loads after first paint, and
 * its exact inverse. Client-safe.
 *
 * The full list (every field, one object per listing) is published separately
 * as /data/jobs-full.json for reuse. This file carries the same listings as
 * arrays: repeated text (organizations, feeds, locations, departments, teams,
 * countries, salary labels) is stored once in a table and referenced by
 * index, timestamps are epoch milliseconds, and each posting URL drops the
 * prefix its feed's URLs share and writes its posting ID as "*". Each row also
 * carries its geography (lib/jobs/geo.ts jobGeography, computed at build), so
 * the browser does not re-read every location to filter by place. `decodeJobs(encodeJobs(items))` deep-equals
 * `items` (tests/unit/jobs-slim.test.ts).
 */
import type { JobItem } from "./search";
import { jobGeography, primeJobGeography } from "./geo";

const WORKPLACES = ["remote", "hybrid", "on-site", "unknown"] as const;
const EMPLOYMENTS = ["full-time", "part-time", "contract", "temporary", "internship", "unknown"] as const;
const POSTED_KINDS = [null, "first-published", "last-published"] as const;
const PERIODS = ["hour", "day", "week", "month", "year"] as const;
const STATUSES = ["employer-provided", "employer-description"] as const;

/** [min, max, currency, period, label string index or -1, status] */
type SlimSalary = [number | null, number | null, string, number, number, number];
/**
 * [feed, source_job_id, title, location indexes, country indexes, workplace, employment,
 *  department, team, salaries, posting URL after the feed's prefix, posted_at, posted kind, first_seen, last_seen]
 */
type SlimRow = [number, string, string, number[], number[], number, number, number, number, SlimSalary[], string | [string], number | null, number, number, number, SlimGeo];
/** [state codes, city ("ST|City") string indexes, 1 = names the U.S. + 2 = names a place outside it]; 0 when it names nothing. */
type SlimGeo = [string[], number[], number] | 0;
/** [organization_slug, organization_name, source_type, source_identifier, source_url, posting URL prefix] */
type SlimFeed = [string, string, JobItem["source_type"], string, string, string];
export type SlimJobs = { v: 2; build_at: string; feeds: SlimFeed[]; strings: string[]; rows: SlimRow[] };

const commonPrefix = (values: string[]) => {
  if (!values.length) return "";
  let p = values[0];
  for (const v of values) while (!v.startsWith(p)) p = p.slice(0, -1);
  return p;
};

/** The posting ID inside the rest of a URL becomes "*" (most URLs repeat it); a URL that has its own "*" is kept whole, as [rest]. */
const urlRest = (rest: string, id: string): string | [string] => (rest.includes("*") ? [rest] : rest.split(id).length === 2 ? rest.replace(id, "*") : rest);

function geoOfWith(str: (s: string) => number) {
  return (j: JobItem): SlimGeo => {
    const g = jobGeography(j);
    const flags = (g.us ? 1 : 0) + (g.outside ? 2 : 0);
    return !g.states.length && !g.cities.length && !flags ? 0 : [g.states, g.cities.map(str), flags];
  };
}

export function encodeJobs(items: JobItem[], buildAt: string): SlimJobs {
  const strings: string[] = [];
  const index = new Map<string, number>();
  const str = (s: string | null) => {
    if (s === null) return -1;
    let i = index.get(s);
    if (i === undefined) { i = strings.length; strings.push(s); index.set(s, i); }
    return i;
  };
  const geoOf = geoOfWith((s) => str(s));
  const feedKey = (j: JobItem) => `${j.organization_slug}\u0000${j.source_type}\u0000${j.source_identifier}`;
  const groups = new Map<string, JobItem[]>();
  for (const j of items) {
    const k = feedKey(j);
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(j);
  }
  const feeds: SlimFeed[] = [];
  const feedIndex = new Map<string, number>();
  for (const [k, rows] of groups) {
    const j = rows[0];
    for (const r of rows) {
      if (r.organization_name !== j.organization_name || r.source_url !== j.source_url) throw new Error(`jobs.json: feed fields differ within ${k}`);
    }
    feedIndex.set(k, feeds.length);
    feeds.push([j.organization_slug, j.organization_name, j.source_type, j.source_identifier, j.source_url, commonPrefix(rows.map((r) => r.official_url))]);
  }
  const rows = items.map((j): SlimRow => {
    const f = feedIndex.get(feedKey(j))!;
    if (j.status !== "open") throw new Error(`jobs.json: ${j.id} is not open`);
    if (j.id !== `${j.organization_slug}:${j.source_type}:${j.source_identifier}:${j.source_job_id}`) throw new Error(`jobs.json: unexpected id ${j.id}`);
    return [
      f, j.source_job_id, j.title, j.locations.map(str), j.countries.map(str),
      WORKPLACES.indexOf(j.workplace), EMPLOYMENTS.indexOf(j.employment_type), str(j.department), str(j.team),
      j.salaries.map((s): SlimSalary => [s.min, s.max, s.currency, PERIODS.indexOf(s.period), str(s.label), STATUSES.indexOf(s.source_status)]),
      urlRest(j.official_url.slice(feeds[f][5].length), j.source_job_id),
      j.posted_at === null ? null : Date.parse(j.posted_at), POSTED_KINDS.indexOf(j.posted_date_kind), Date.parse(j.first_seen), Date.parse(j.last_seen),
      geoOf(j),
    ];
  });
  return { v: 2, build_at: buildAt, feeds, strings, rows };
}

const iso = (ms: number) => new Date(ms).toISOString();

export function decodeJobs(data: SlimJobs): JobItem[] {
  const { feeds, strings } = data;
  const s = (i: number) => (i < 0 ? null : strings[i]);
  return data.rows.map(([f, sourceJobId, title, locations, countries, workplace, employment, department, team, salaries, url, posted, postedKind, first, last, geo]) => {
    const [slug, name, type, identifier, sourceUrl, prefix] = feeds[f];
    const job: JobItem = {
      id: `${slug}:${type}:${identifier}:${sourceJobId}`, organization_slug: slug, source_type: type, source_identifier: identifier,
      source_job_id: sourceJobId, source_url: sourceUrl, title, locations: locations.map((i) => strings[i]), countries: countries.map((i) => strings[i]),
      workplace: WORKPLACES[workplace], employment_type: EMPLOYMENTS[employment], department: s(department), team: s(team),
      salaries: salaries.map(([min, max, currency, period, label, status]) => ({ min, max, currency, period: PERIODS[period], label: s(label), source_status: STATUSES[status] })),
      official_url: prefix + (typeof url === "string" ? url.replace("*", () => sourceJobId) : url[0]), posted_at: posted === null ? null : iso(posted), posted_date_kind: POSTED_KINDS[postedKind],
      first_seen: iso(first), last_seen: iso(last), status: "open", organization_name: name,
    };
    primeJobGeography(job, geo === 0 ? { states: [], cities: [], us: false, outside: false } : { states: geo[0], cities: geo[1].map((i) => strings[i]), us: (geo[2] & 1) === 1, outside: (geo[2] & 2) === 2 });
    return job;
  });
}
