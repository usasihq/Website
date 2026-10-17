import type { Careers } from "./schema";
import { isAutomatedSource, safeJobUrl } from "./schema";
export class FeedError extends Error {
  constructor(public category: "network" | "http" | "rate-limited" | "payload" | "unsafe-url" | "anomaly") { super(category); }
}
/**
 * A Workday career site from its identifier: "<tenant>.<wdN>.<site>" for
 * https://<tenant>.<wdN>.myworkdayjobs.com/<site>, or "<tenant>.<wdN>site.<site>"
 * for https://<wdN>.myworkdaysite.com/recruiting/<tenant>/<site> (the other
 * domain Workday hosts career sites on). `base` is the public path before /job/.
 */
export function workdaySite(identifier: string): { tenant: string; host: string; site: string; base: string } {
  const m = /^([a-z0-9-]+)\.(wd[0-9]{1,3})(site)?\.([A-Za-z0-9_-]+)$/.exec(identifier);
  if (!m) throw new FeedError("payload");
  return m[3]
    ? { tenant: m[1], host: `${m[2]}.myworkdaysite.com`, site: m[4], base: `/recruiting/${m[1]}/${m[4]}` }
    : { tenant: m[1], host: `${m[1]}.${m[2]}.myworkdayjobs.com`, site: m[4], base: `/${m[4]}` };
}
export function endpoint(c: Careers): string {
  if (c.source.type === "greenhouse") return `https://boards-api.greenhouse.io/v1/boards/${c.source.identifier}/jobs`;
  if (c.source.type === "ashby") return `https://api.ashbyhq.com/posting-api/job-board/${c.source.identifier}?includeCompensation=true`;
  if (c.source.type === "lever") return `https://api.lever.co/v0/postings/${c.source.identifier}?mode=json`;
  if (c.source.type === "workable") return `https://apply.workable.com/api/v1/widget/accounts/${c.source.identifier}?details=true`;
  if (c.source.type === "smartrecruiters") return `https://api.smartrecruiters.com/v1/companies/${c.source.identifier}/postings`;
  if (c.source.type === "workday") { const w = workdaySite(c.source.identifier); return `https://${w.host}/wday/cxs/${w.tenant}/${w.site}/jobs`; }
  if (c.source.type === "usajobs") return "https://data.usajobs.gov/api/search";
  throw new FeedError("payload");
}
/** What is requested: the source endpoint, plus Greenhouse's content flag so each posting's description comes with the listing. */
export function feedUrl(c: Careers): string {
  return c.source.type === "greenhouse" ? `${endpoint(c)}?content=true` : endpoint(c);
}
const USAJOBS_POSTING = /^\/GetJob\/ViewDetails\/[A-Za-z0-9_-]+\/?$/i;
export function postingUrl(value: string, c: Careers): string {
  // An employer-owned posting host (an editorial allow-list) may be linked over
  // plain http in the feed; its pages are served over https, so upgrade it.
  const plainHttp = /^http:\/\/([^/:?#]+)/i.exec(value);
  if (plainHttp && c.posting_hosts.includes(plainHttp[1].toLowerCase())) value = `https://${value.slice(7)}`;
  if (!safeJobUrl(value)) throw new FeedError("unsafe-url");
  const u = new URL(value);
  const type = c.source.type;
  if (type === "usajobs") {
    if (u.hostname === "www.usajobs.gov") {
      if (!USAJOBS_POSTING.test(u.pathname)) throw new FeedError("unsafe-url");
    } else if (!c.posting_hosts.includes(u.hostname)) throw new FeedError("unsafe-url");
  } else {
    // Workday posting links live on the employer's own career site host, under /<site>/job/.
    if (type === "workday" && "identifier" in c.source) {
      const w = workdaySite(c.source.identifier);
      if (u.hostname !== w.host || !u.pathname.startsWith(`${w.base}/job/`)) throw new FeedError("unsafe-url");
      u.hash = "";
      u.search = "";
      return u.href;
    }
    // Workable's public posting links are apply.workable.com/j/<shortcode>, with no account in the path.
    if (type === "workable" && u.hostname === "apply.workable.com") {
      if (!/^\/j\/[A-Za-z0-9]{4,20}(\/apply)?\/?$/.test(u.pathname)) throw new FeedError("unsafe-url");
      u.hash = "";
      u.search = "";
      return u.href;
    }
    const ats = type === "greenhouse" ? ["boards.greenhouse.io", "job-boards.greenhouse.io"] : type === "lever" ? ["jobs.lever.co"] : type === "ashby" ? ["jobs.ashbyhq.com"] : type === "smartrecruiters" ? ["jobs.smartrecruiters.com"] : [];
    const tenant = "identifier" in c.source ? c.source.identifier : "";
    if (ats.includes(u.hostname)) {
      if (decodeURIComponent(u.pathname.split("/")[1]) !== tenant) throw new FeedError("unsafe-url");
    } else if (!c.posting_hosts.includes(u.hostname)) throw new FeedError("unsafe-url");
  }
  // Keep requisition-bearing parameters (e.g. gh_jid, PostingChannelID); remove tracking only.
  for (const key of [...u.searchParams.keys()]) if (/^(utm_|gh_src$|source$|ref$)/i.test(key)) u.searchParams.delete(key);
  u.hash = "";
  u.searchParams.sort();
  return u.href;
}
// Large boards with descriptions run to tens of megabytes (Anduril was 44 MB in October 2026).
export const MAX_BYTES = 64 * 1024 * 1024;
/** Bounded JSON body: no prototype-poisoning keys, no payloads over MAX_BYTES. */
export async function readJsonBody(response: Response): Promise<unknown> {
  if (response.status === 429) throw new FeedError("rate-limited");
  if (!response.ok) throw new FeedError("http");
  if (!response.headers.get("content-type")?.includes("application/json")) throw new FeedError("payload");
  if (Number(response.headers.get("content-length")) > MAX_BYTES || !response.body) throw new FeedError("payload");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) { await reader.cancel(); throw new FeedError("payload"); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"), (key, value) => {
    if (["__proto__", "prototype", "constructor"].includes(key)) throw new FeedError("payload");
    return value;
  });
}
/** Fixed public ATS hosts, no redirects, credentials, cookies, custom URL, or retries. */
export async function fetchFeed(c: Careers, fetcher: typeof fetch = fetch): Promise<unknown> {
  if (!isAutomatedSource(c.source.type) || c.source.type === "usajobs") throw new FeedError("payload");
  return fetchJson(feedUrl(c), fetcher);
}
/** One bounded JSON request to a URL built from fixed ATS hosts (never from feed input). */
export async function fetchJson(url: string, fetcher: typeof fetch = fetch, body?: unknown): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const headers: Record<string, string> = { Accept: "application/json", "User-Agent": "USASI-Jobs/1.0 (+https://unitedstatesofamericasuperintelligence.com/jobs/)" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const response = await fetcher(url, { redirect: "error", signal: controller.signal, credentials: "omit", headers,
      ...(body !== undefined ? { method: "POST", body: JSON.stringify(body) } : {}) });
    return await readJsonBody(response);
  } catch (e) {
    if (e instanceof FeedError) throw e;
    throw new FeedError(e instanceof SyntaxError ? "payload" : "network");
  } finally { clearTimeout(timer); }
}
