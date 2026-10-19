/**
 * IndexNow (Bing, Yandex, and other participants) notifications for URLs that
 * appeared or disappeared after a jobs refresh. The workflow script is
 * scripts/ping-indexnow.ts. Ownership is proved by public/<key>.txt at the
 * site root (copied into the static export).
 *
 * https://www.indexnow.org/documentation
 */
import { indexingNotifications, type IndexingNotification } from "./indexing";
import type { Dataset, Job } from "./schema";

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_BATCH_SIZE = 10_000;
export const INDEXNOW_MAX_URLS = 10_000;
/** Hex key hosted at /<key>.txt. 32 characters, within IndexNow's 8–128 limit. */
export const INDEXNOW_KEY = "745c203344b0b6686f92c9a3e457671d";
export const INDEXNOW_KEY_FILE = `${INDEXNOW_KEY}.txt`;
export const INDEXNOW_SUCCESS = new Set([200, 202]);
/** Hub pages that change when the jobs catalog changes. */
export const INDEXNOW_HUB_PATHS = ["/", "/jobs/", "/jobs/index/"] as const;

export type IndexNowPayload = {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
};

export function indexNowHost(origin: string): string {
  return new URL(origin).hostname;
}

export function indexNowKeyLocation(origin: string): string {
  return `${origin.replace(/\/+$/, "")}/${INDEXNOW_KEY_FILE}`;
}

/** Loc values from a sitemap or sitemap index. */
export function sitemapLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
}

/** Added and removed URLs, previous first for deletes after the new set. */
export function urlSetDiff(previous: readonly string[], next: readonly string[]): string[] {
  const before = new Set(previous);
  const after = new Set(next);
  const out: string[] = [];
  for (const url of after) if (!before.has(url)) out.push(url);
  for (const url of before) if (!after.has(url)) out.push(url);
  return out;
}

function uniqueUrls(urls: readonly string[], cap = INDEXNOW_MAX_URLS): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of urls) {
    if (seen.has(url)) continue;
    seen.add(url);
    out.push(url);
    if (out.length >= cap) break;
  }
  return out;
}

/**
 * Job pages added or removed, newest first, plus hub pages when anything
 * changed. Empty when the current pages are unchanged.
 */
export function indexNowChangedUrls(
  previous: Dataset,
  next: Dataset,
  origin: string,
  now: number,
  allowNext: (job: Job) => boolean = () => true,
  hubs: readonly string[] = INDEXNOW_HUB_PATHS,
): string[] {
  const notes: IndexingNotification[] = indexingNotifications(previous, next, origin, now, allowNext);
  if (notes.length === 0) return [];
  const base = origin.replace(/\/+$/, "");
  return uniqueUrls([...hubs.map((path) => `${base}${path}`), ...notes.map((n) => n.url)]);
}

export function indexNowBatches(
  urls: readonly string[],
  origin: string,
  batchSize = INDEXNOW_BATCH_SIZE,
  key = INDEXNOW_KEY,
): IndexNowPayload[] {
  const host = indexNowHost(origin);
  const keyLocation = indexNowKeyLocation(origin);
  const batches: IndexNowPayload[] = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push({ host, key, keyLocation, urlList: urls.slice(i, i + batchSize) });
  }
  return batches;
}

export async function submitIndexNow(
  payloads: readonly IndexNowPayload[],
  fetcher: typeof fetch = fetch,
  endpoint = INDEXNOW_ENDPOINT,
): Promise<{ ok: number; failed: number; submitted: number }> {
  let ok = 0;
  let failed = 0;
  let submitted = 0;
  for (const payload of payloads) {
    submitted += payload.urlList.length;
    try {
      const response = await fetcher(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8", "User-Agent": "USASI-indexnow/0.1" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20_000),
      });
      if (INDEXNOW_SUCCESS.has(response.status)) ok += 1;
      else failed += 1;
    } catch {
      failed += 1;
    }
  }
  return { ok, failed, submitted };
}
