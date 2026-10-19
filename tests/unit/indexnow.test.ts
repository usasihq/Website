import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { jobSlug } from "@/lib/jobs/job-url";
import {
  INDEXNOW_BATCH_SIZE,
  INDEXNOW_ENDPOINT,
  INDEXNOW_KEY,
  INDEXNOW_KEY_FILE,
  INDEXNOW_MAX_URLS,
  indexNowBatches,
  indexNowChangedUrls,
  indexNowHost,
  indexNowKeyLocation,
  sitemapLocs,
  submitIndexNow,
  urlSetDiff,
} from "@/lib/jobs/indexnow";
import { EMPTY_DATASET, type Dataset, type FeedHealth, type Job } from "@/lib/jobs/schema";

const seen = "2026-10-16T12:00:00.000Z";
const now = Date.parse("2026-10-16T18:00:00.000Z");
const origin = "https://unitedstatesofamericasuperintelligence.com";

const feed = (slug: string): FeedHealth => ({
  organization_slug: slug,
  source_type: "greenhouse",
  source_identifier: slug,
  last_attempted: seen,
  last_successful: seen,
  result: "ok",
  consecutive_failures: 0,
  current_count: 1,
  pending_digest: null,
  pending_since: null,
});

const job = (over: Partial<Job> & Pick<Job, "id" | "source_job_id" | "organization_slug" | "title" | "posted_at">): Job => ({
  requisition_id: null,
  source_type: "greenhouse",
  source_identifier: over.organization_slug,
  source_url: `https://boards-api.greenhouse.io/v1/boards/${over.organization_slug}/jobs`,
  locations: ["San Francisco, CA"],
  countries: [],
  workplace: "on-site",
  remote: false,
  employment_type: "full-time",
  department: null,
  team: null,
  salaries: [],
  official_url: `https://job-boards.greenhouse.io/${over.organization_slug}/jobs/${over.source_job_id}`,
  apply_url: null,
  posted_date_kind: "first-published",
  first_seen: seen,
  last_seen: seen,
  last_successfully_checked: seen,
  status: "open",
  missing_since: null,
  missing_checks: 0,
  closed_at: null,
  ...over,
});

const dataset = (jobs: Job[]): Dataset => ({
  version: 1,
  jobs,
  feeds: [...new Set(jobs.map((j) => j.organization_slug))].map((slug) => ({
    ...feed(slug),
    current_count: jobs.filter((j) => j.organization_slug === slug && j.status === "open").length,
  })),
});

const older = job({
  id: "acme:greenhouse:acme:1",
  source_job_id: "1",
  organization_slug: "acme",
  title: "Research Engineer",
  posted_at: "2026-09-01T00:00:00.000Z",
});
const newer = job({
  id: "acme:greenhouse:acme:2",
  source_job_id: "2",
  organization_slug: "acme",
  title: "Staff Engineer",
  posted_at: "2026-10-15T00:00:00.000Z",
});

describe("IndexNow key file", () => {
  it("is a hex key of 8–128 characters, matching public/<key>.txt", () => {
    expect(INDEXNOW_KEY).toMatch(/^[a-f0-9]{8,128}$/);
    expect(INDEXNOW_KEY_FILE).toBe(`${INDEXNOW_KEY}.txt`);
    const body = fs.readFileSync(path.join(process.cwd(), "public", INDEXNOW_KEY_FILE), "utf8").trim();
    expect(body).toBe(INDEXNOW_KEY);
  });
  it("builds host and keyLocation from the site origin", () => {
    expect(indexNowHost(origin)).toBe("unitedstatesofamericasuperintelligence.com");
    expect(indexNowKeyLocation(origin)).toBe(`${origin}/${INDEXNOW_KEY_FILE}`);
  });
});

describe("IndexNow URL diff", () => {
  it("skips when the current job pages are unchanged", () => {
    const data = dataset([older, newer]);
    expect(indexNowChangedUrls(data, data, origin, now)).toEqual([]);
  });

  it("lists added and removed job pages and the hub pages, newest jobs first after hubs", () => {
    const urls = indexNowChangedUrls(dataset([older]), dataset([newer]), origin, now);
    expect(urls.slice(0, 3)).toEqual([`${origin}/`, `${origin}/jobs/`, `${origin}/jobs/index/`]);
    expect(urls).toContain(`${origin}/jobs/at/acme/${jobSlug(newer)}/`);
    expect(urls).toContain(`${origin}/jobs/at/acme/${jobSlug(older)}/`);
    expect(urls.indexOf(`${origin}/jobs/at/acme/${jobSlug(newer)}/`)).toBeLessThan(urls.indexOf(`${origin}/jobs/at/acme/${jobSlug(older)}/`));
  });

  it("treats a missing previous snapshot as every current page added", () => {
    const urls = indexNowChangedUrls(EMPTY_DATASET, dataset([older]), origin, now);
    expect(urls).toContain(`${origin}/jobs/at/acme/${jobSlug(older)}/`);
    expect(urls).toContain(`${origin}/jobs/`);
  });

  it("diffs sitemap loc lists the same way", () => {
    const previous = `<?xml version="1.0"?><urlset><url><loc>${origin}/jobs/at/acme/${jobSlug(older)}/</loc></url></urlset>`;
    const next = `<?xml version="1.0"?><urlset><url><loc>${origin}/jobs/at/acme/${jobSlug(newer)}/</loc></url></urlset>`;
    expect(urlSetDiff(sitemapLocs(previous), sitemapLocs(next))).toEqual([
      `${origin}/jobs/at/acme/${jobSlug(newer)}/`,
      `${origin}/jobs/at/acme/${jobSlug(older)}/`,
    ]);
  });
});

describe("IndexNow batches and POST", () => {
  it("splits at 10,000 URLs per request", () => {
    const many = Array.from({ length: INDEXNOW_BATCH_SIZE + 2 }, (_, i) => `${origin}/jobs/at/acme/role-${i}/`);
    const payloads = indexNowBatches(many, origin);
    expect(payloads).toHaveLength(2);
    expect(payloads[0].urlList).toHaveLength(INDEXNOW_BATCH_SIZE);
    expect(payloads[1].urlList).toHaveLength(2);
    expect(payloads[0]).toMatchObject({
      host: "unitedstatesofamericasuperintelligence.com",
      key: INDEXNOW_KEY,
      keyLocation: `${origin}/${INDEXNOW_KEY_FILE}`,
    });
    expect(INDEXNOW_MAX_URLS).toBe(INDEXNOW_BATCH_SIZE);
  });

  it("POSTs JSON to api.indexnow.org and counts 200/202 as success", async () => {
    const calls: { url: string; body: string }[] = [];
    const fetcher: typeof fetch = (async (url, init) => {
      calls.push({ url: String(url), body: String(init?.body ?? "") });
      return new Response("Accepted", { status: 202 });
    }) as typeof fetch;
    const payloads = indexNowBatches([`${origin}/jobs/`], origin);
    await expect(submitIndexNow(payloads, fetcher)).resolves.toEqual({ ok: 1, failed: 0, submitted: 1 });
    expect(calls[0].url).toBe(INDEXNOW_ENDPOINT);
    expect(JSON.parse(calls[0].body).urlList).toEqual([`${origin}/jobs/`]);
  });

  it("does not throw when IndexNow is unreachable", async () => {
    const fetcher: typeof fetch = (async () => {
      throw new Error("network");
    }) as typeof fetch;
    await expect(submitIndexNow(indexNowBatches([`${origin}/jobs/`], origin), fetcher)).resolves.toEqual({
      ok: 0,
      failed: 1,
      submitted: 1,
    });
  });
});
