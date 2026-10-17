/**
 * Google Indexing API notifications for job pages that appeared or disappeared
 * after a jobs refresh. Pure comparison and auth helpers; the workflow script
 * is scripts/ping-indexing.ts. Never logs the service-account JSON.
 *
 * Quota: Google's Indexing API default is 200 publish calls per day (Pacific).
 * We send newest postings first and persist the day's count so a six-hour
 * refresh cannot exceed that cap.
 *
 * https://developers.google.com/search/apis/indexing-api/v3/using-api
 */
import { createSign } from "node:crypto";
import { jobSlug } from "./job-url";
import type { Dataset, Job } from "./schema";
import { isCurrent } from "./search";

export const INDEXING_DAILY_CAP = 200;
export const INDEXING_SCOPE = "https://www.googleapis.com/auth/indexing";
export const INDEXING_PUBLISH_URL = "https://indexing.googleapis.com/v3/urlNotifications:publish";
export const INDEXING_TOKEN_URL = "https://oauth2.googleapis.com/token";

export type IndexingType = "URL_UPDATED" | "URL_DELETED";

export type IndexableJobPage = {
  id: string;
  path: string;
  when: number;
};

export type IndexingNotification = {
  url: string;
  path: string;
  type: IndexingType;
  when: number;
};

export type IndexingQuota = { day: string; sent: number };

export type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri: string;
};

/** Empty or unset secret: skip. Invalid JSON: also skip (never throw). */
export function parseServiceAccountJson(raw: string | undefined | null): ServiceAccount | null {
  if (!raw || !raw.trim()) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (value.type !== "service_account") return null;
    if (typeof value.client_email !== "string" || !value.client_email.includes("@")) return null;
    if (typeof value.private_key !== "string" || !value.private_key.includes("PRIVATE KEY")) return null;
    return {
      client_email: value.client_email,
      private_key: value.private_key.replace(/\\n/g, "\n"),
      token_uri: typeof value.token_uri === "string" && value.token_uri.startsWith("https://") ? value.token_uri : INDEXING_TOKEN_URL,
    };
  } catch {
    return null;
  }
}

/** Google's daily Indexing API quota resets at midnight Pacific Time. */
export function indexingQuotaDay(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function pageSlug(job: Job, taken: Set<string>): string {
  let slug = jobSlug(job);
  if (taken.has(`${job.organization_slug}/${slug}`)) {
    slug = `${slug}-${job.source_job_id.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
  }
  taken.add(`${job.organization_slug}/${slug}`);
  return slug;
}

/**
 * Job pages that would be written for this snapshot at `now`: open, from a
 * successful feed, seen within 48 hours. `allow` is the current catalog rule
 * (published + eligible employer). Previous snapshots omit `allow` so a
 * deactivated employer still produces URL_DELETED for the pages that existed.
 */
export function currentJobPages(data: Dataset, now: number, allow: (job: Job) => boolean = () => true): IndexableJobPage[] {
  const health = new Map(data.feeds.map((f) => [`${f.organization_slug}:${f.source_type}:${f.source_identifier}`, f]));
  const taken = new Set<string>();
  const pages: IndexableJobPage[] = [];
  for (const job of data.jobs) {
    if (!allow(job)) continue;
    if (!isCurrent(job, health.get(`${job.organization_slug}:${job.source_type}:${job.source_identifier}`), now)) continue;
    const slug = pageSlug(job, taken);
    pages.push({
      id: job.id,
      path: `/jobs/at/${job.organization_slug}/${slug}/`,
      when: Date.parse(job.posted_at ?? job.first_seen) || 0,
    });
  }
  return pages;
}

/** Added pages → URL_UPDATED; removed pages → URL_DELETED. Newest first. */
export function indexingNotifications(
  previous: Dataset,
  next: Dataset,
  origin: string,
  now: number,
  allowNext: (job: Job) => boolean = () => true,
): IndexingNotification[] {
  const base = origin.replace(/\/+$/, "");
  const before = new Map(currentJobPages(previous, now).map((p) => [p.path, p]));
  const after = new Map(currentJobPages(next, now, allowNext).map((p) => [p.path, p]));
  const out: IndexingNotification[] = [];
  for (const [path, page] of after) {
    if (!before.has(path)) out.push({ url: `${base}${path}`, path, type: "URL_UPDATED", when: page.when });
  }
  for (const [path, page] of before) {
    if (!after.has(path)) out.push({ url: `${base}${path}`, path, type: "URL_DELETED", when: page.when });
  }
  out.sort((a, b) => b.when - a.when || a.path.localeCompare(b.path, "en"));
  return out;
}

export function applyDailyQuota(
  notifications: IndexingNotification[],
  quota: IndexingQuota | null,
  today: string,
  cap = INDEXING_DAILY_CAP,
): { send: IndexingNotification[]; next: IndexingQuota; skipped: number } {
  const used = quota && quota.day === today ? Math.max(0, quota.sent) : 0;
  const remaining = Math.max(0, cap - used);
  const send = notifications.slice(0, remaining);
  return { send, next: { day: today, sent: used + send.length }, skipped: notifications.length - send.length };
}

function base64url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

export function signServiceAccountJwt(account: ServiceAccount, now = Date.now()): string {
  const iat = Math.floor(now / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: account.client_email,
      scope: INDEXING_SCOPE,
      aud: account.token_uri,
      iat,
      exp: iat + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${signer.sign(account.private_key, "base64url")}`;
}

export async function indexingAccessToken(account: ServiceAccount, fetcher: typeof fetch = fetch, now = Date.now()): Promise<string> {
  const assertion = signServiceAccountJwt(account, now);
  const response = await fetcher(account.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }).toString(),
  });
  if (!response.ok) throw new Error("indexing-token");
  const body = (await response.json()) as { access_token?: unknown };
  if (typeof body.access_token !== "string" || !body.access_token) throw new Error("indexing-token");
  return body.access_token;
}

export async function publishIndexingNotifications(
  notifications: IndexingNotification[],
  token: string,
  fetcher: typeof fetch = fetch,
): Promise<{ ok: number; failed: number }> {
  let ok = 0;
  let failed = 0;
  for (const notification of notifications) {
    try {
      const response = await fetcher(INDEXING_PUBLISH_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ url: notification.url, type: notification.type }),
      });
      if (response.ok) ok += 1;
      else failed += 1;
    } catch {
      failed += 1;
    }
  }
  return { ok, failed };
}
