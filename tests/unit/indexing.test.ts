import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  applyDailyQuota,
  currentJobPages,
  indexingAccessToken,
  indexingNotifications,
  indexingQuotaDay,
  INDEXING_DAILY_CAP,
  INDEXING_PUBLISH_URL,
  parseServiceAccountJson,
  publishIndexingNotifications,
  signServiceAccountJwt,
} from "@/lib/jobs/indexing";
import { jobSlug } from "@/lib/jobs/job-url";
import { EMPTY_DATASET, type Dataset, type FeedHealth, type Job } from "@/lib/jobs/schema";

const seen = "2026-10-16T12:00:00.000Z";
const now = Date.parse("2026-10-16T18:00:00.000Z");

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

describe("service account JSON", () => {
  it("skips a missing, blank, or invalid secret without throwing", () => {
    expect(parseServiceAccountJson(undefined)).toBeNull();
    expect(parseServiceAccountJson("")).toBeNull();
    expect(parseServiceAccountJson("   ")).toBeNull();
    expect(parseServiceAccountJson("{")).toBeNull();
    expect(parseServiceAccountJson(JSON.stringify({ type: "service_account" }))).toBeNull();
  });
  it("accepts a service-account object and unescapes the private key", () => {
    const sa = parseServiceAccountJson(
      JSON.stringify({
        type: "service_account",
        client_email: "indexing@project.iam.gserviceaccount.com",
        private_key: "-----BEGIN PRIVATE KEY-----\\nABC\\n-----END PRIVATE KEY-----\\n",
        token_uri: "https://oauth2.googleapis.com/token",
      }),
    );
    expect(sa?.client_email).toBe("indexing@project.iam.gserviceaccount.com");
    expect(sa?.private_key).toContain("BEGIN PRIVATE KEY");
    expect(sa?.private_key).toContain("\n");
  });
});

describe("job-page URL diff", () => {
  it("emits URL_UPDATED for a new page and URL_DELETED for a removed one, newest first", () => {
    const prev = dataset([older]);
    const next = dataset([newer]);
    const notes = indexingNotifications(prev, next, "https://unitedstatesofamericasuperintelligence.com", now);
    expect(notes.map((n) => n.type)).toEqual(["URL_UPDATED", "URL_DELETED"]);
    expect(notes[0].path).toBe(`/jobs/at/acme/${jobSlug(newer)}/`);
    expect(notes[0].url).toBe(`https://unitedstatesofamericasuperintelligence.com/jobs/at/acme/${jobSlug(newer)}/`);
    expect(notes[1].path).toBe(`/jobs/at/acme/${jobSlug(older)}/`);
  });

  it("treats a title change as delete-old plus update-new", () => {
    const renamed = { ...older, title: "Research Engineer, Inference" };
    const notes = indexingNotifications(dataset([older]), dataset([renamed]), "https://example.com", now);
    expect(notes).toHaveLength(2);
    expect(notes.find((n) => n.type === "URL_DELETED")?.path).toBe(`/jobs/at/acme/${jobSlug(older)}/`);
    expect(notes.find((n) => n.type === "URL_UPDATED")?.path).toBe(`/jobs/at/acme/${jobSlug(renamed)}/`);
  });

  it("emits nothing when the current pages are unchanged", () => {
    const data = dataset([older, newer]);
    expect(indexingNotifications(data, data, "https://example.com", now)).toEqual([]);
  });

  it("treats a missing previous snapshot as every current page added", () => {
    const notes = indexingNotifications(EMPTY_DATASET, dataset([older]), "https://example.com", now);
    expect(notes).toEqual([expect.objectContaining({ type: "URL_UPDATED", path: `/jobs/at/acme/${jobSlug(older)}/` })]);
  });

  it("omits a next page when allow() rejects the employer, so a deactivated org is deleted", () => {
    const notes = indexingNotifications(dataset([older]), dataset([older]), "https://example.com", now, () => false);
    expect(notes).toEqual([expect.objectContaining({ type: "URL_DELETED", path: `/jobs/at/acme/${jobSlug(older)}/` })]);
  });

  it("does not index a stale or closed listing", () => {
    const closed = { ...older, status: "closed" as const, closed_at: seen, missing_since: seen, missing_checks: 2 };
    expect(currentJobPages(dataset([closed]), now)).toEqual([]);
  });
});

describe("daily cap", () => {
  it("sends at most 200 newest remaining calls and persists the Pacific-time day count", () => {
    const extra = job({
      id: "acme:greenhouse:acme:3",
      source_job_id: "3",
      organization_slug: "acme",
      title: "Mid Engineer",
      posted_at: "2026-10-01T00:00:00.000Z",
    });
    const notes = indexingNotifications(EMPTY_DATASET, dataset([older, newer, extra]), "https://example.com", now);
    expect(notes.map((n) => n.path)).toEqual([
      `/jobs/at/acme/${jobSlug(newer)}/`,
      `/jobs/at/acme/${jobSlug(extra)}/`,
      `/jobs/at/acme/${jobSlug(older)}/`,
    ]);
    const first = applyDailyQuota(notes, { day: "2026-10-16", sent: 199 }, "2026-10-16", INDEXING_DAILY_CAP);
    expect(first.send).toHaveLength(1);
    expect(first.send[0].path).toBe(`/jobs/at/acme/${jobSlug(newer)}/`);
    expect(first.next).toEqual({ day: "2026-10-16", sent: 200 });
    expect(first.skipped).toBe(2);
    const reset = applyDailyQuota(notes, { day: "2026-10-15", sent: 200 }, "2026-10-16", INDEXING_DAILY_CAP);
    expect(reset.send).toHaveLength(3);
    expect(reset.next.sent).toBe(3);
  });

  it("formats the quota day in America/Los_Angeles", () => {
    expect(indexingQuotaDay(new Date("2026-10-17T06:30:00.000Z"))).toBe("2026-10-16");
    expect(indexingQuotaDay(new Date("2026-10-17T08:00:00.000Z"))).toBe("2026-10-17");
  });
});

describe("Indexing API auth and publish", () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const account = {
    client_email: "indexing@project.iam.gserviceaccount.com",
    private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
    token_uri: "https://oauth2.googleapis.com/token",
  };

  it("signs a JWT the token endpoint will accept", async () => {
    const jwt = signServiceAccountJwt(account, Date.parse("2026-10-16T12:00:00.000Z"));
    const [header, payload] = jwt.split(".").slice(0, 2).map((part) => JSON.parse(Buffer.from(part, "base64url").toString("utf8")));
    expect(header).toEqual({ alg: "RS256", typ: "JWT" });
    expect(payload.iss).toBe(account.client_email);
    expect(payload.scope).toContain("indexing");
    expect(payload.aud).toBe(account.token_uri);
    const { createVerify } = await import("node:crypto");
    const verify = createVerify("RSA-SHA256");
    verify.update(jwt.split(".").slice(0, 2).join("."));
    verify.end();
    expect(verify.verify(publicKey, jwt.split(".")[2], "base64url")).toBe(true);
  });

  it("exchanges the JWT for an access token and publishes each notification", async () => {
    const calls: { url: string; body: string }[] = [];
    const fetcher: typeof fetch = (async (url, init) => {
      const body = String(init?.body ?? "");
      calls.push({ url: String(url), body });
      if (String(url).includes("oauth2")) return new Response(JSON.stringify({ access_token: "ya29.test" }), { status: 200 });
      return new Response("{}", { status: 200 });
    }) as typeof fetch;
    await expect(indexingAccessToken(account, fetcher)).resolves.toBe("ya29.test");
    expect(calls[0].body).toContain("urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer");
    const result = await publishIndexingNotifications(
      [{ url: "https://example.com/jobs/at/acme/x/", path: "/jobs/at/acme/x/", type: "URL_UPDATED", when: 1 }],
      "ya29.test",
      fetcher,
    );
    expect(result).toEqual({ ok: 1, failed: 0 });
    expect(calls[1].url).toBe(INDEXING_PUBLISH_URL);
    expect(JSON.parse(calls[1].body)).toEqual({ url: "https://example.com/jobs/at/acme/x/", type: "URL_UPDATED" });
  });
});
