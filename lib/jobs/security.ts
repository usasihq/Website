import type { Careers } from "./schema";
import { safeJobUrl } from "./schema";
export class FeedError extends Error {
  constructor(public category: "network" | "http" | "rate-limited" | "payload" | "unsafe-url" | "anomaly") { super(category); }
}
export function endpoint(c: Careers): string {
  if (c.source.type === "greenhouse") return `https://boards-api.greenhouse.io/v1/boards/${c.source.identifier}/jobs`;
  if (c.source.type === "ashby") return `https://api.ashbyhq.com/posting-api/job-board/${c.source.identifier}?includeCompensation=true`;
  throw new FeedError("payload");
}
export function postingUrl(value: string, c: Careers): string {
  if (!safeJobUrl(value)) throw new FeedError("unsafe-url");
  const u = new URL(value);
  const type = c.source.type;
  const ats = type === "greenhouse" ? ["boards.greenhouse.io", "job-boards.greenhouse.io"] : ["jobs.ashbyhq.com"];
  const tenant = "identifier" in c.source ? c.source.identifier : "";
  if (ats.includes(u.hostname)) {
    if (decodeURIComponent(u.pathname.split("/")[1]) !== tenant) throw new FeedError("unsafe-url");
  } else if (!c.posting_hosts.includes(u.hostname)) throw new FeedError("unsafe-url");
  // Keep requisition-bearing parameters (e.g. gh_jid); remove tracking only.
  for (const key of [...u.searchParams.keys()]) if (/^(utm_|gh_src$|source$|ref$)/i.test(key)) u.searchParams.delete(key);
  u.hash = "";
  u.searchParams.sort();
  return u.href;
}
export const MAX_BYTES = 32 * 1024 * 1024;
/** Fixed public ATS hosts, no redirects, credentials, cookies, custom URL, or retries. */
export async function fetchFeed(c: Careers, fetcher: typeof fetch = fetch): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetcher(endpoint(c), { redirect: "error", signal: controller.signal, credentials: "omit",
      headers: { Accept: "application/json", "User-Agent": "USASI-Jobs/1.0 (+https://unitedstatesofamericasuperintelligence.com/jobs/)" } });
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
  } catch (e) {
    if (e instanceof FeedError) throw e;
    throw new FeedError(e instanceof SyntaxError ? "payload" : "network");
  } finally { clearTimeout(timer); }
}
