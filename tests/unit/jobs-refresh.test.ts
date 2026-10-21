import { afterEach, describe, expect, it, vi } from "vitest";
import { Careers, EMPTY_DATASET, type NormalizedJob } from "@/lib/jobs/schema";
import { reconcile } from "@/lib/jobs/reconcile";
import { FeedError } from "@/lib/jobs/security";
import {
  sourceTimeoutMs,
  WORKDAY_SOURCE_TIMEOUT_MS,
  checkSource,
  createLock,
  mapPool,
  parseConcurrency,
  parseTimeoutMs,
  refreshJobs,
  withSourceTimeout,
  type EnabledOrg,
} from "@/lib/jobs/refresh";

const config = Careers.parse({
  url: "https://employer.com/careers",
  enabled: true,
  source: { type: "greenhouse", identifier: "acme" },
  source_ids: ["careers"],
  reviewed_at: "2026-10-16",
});
const org: EnabledOrg = { slug: "acme", careers: config };

const greenhouseBody = {
  jobs: [{
    id: 1,
    internal_job_id: 1,
    title: "Research Engineer",
    location: { name: "Boston" },
    absolute_url: "https://job-boards.greenhouse.io/acme/jobs/1",
  }],
  meta: { total: 1 },
};

const jsonResponse = (body: unknown, status = 200, headers: Record<string, string> = { "content-type": "application/json" }) =>
  new Response(JSON.stringify(body), { status, headers });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("refresh pool and budgets", () => {
  it("parses concurrency and timeout with bounds", () => {
    expect(parseConcurrency(undefined)).toBe(4);
    expect(parseConcurrency("0")).toBe(4);
    expect(parseConcurrency("9")).toBe(8);
    expect(parseTimeoutMs("500")).toBe(180_000);
    expect(parseTimeoutMs("120000")).toBe(120_000);
  });

  it("keeps at most N calls in flight", async () => {
    let inflight = 0;
    let max = 0;
    await mapPool([1, 2, 3, 4, 5, 6], 2, async (n) => {
      inflight++;
      max = Math.max(max, inflight);
      await new Promise((r) => setTimeout(r, 20));
      inflight--;
      return n;
    });
    expect(max).toBe(2);
  });

  it("serializes lock callbacks", async () => {
    const lock = createLock();
    const order: number[] = [];
    await Promise.all([
      lock(async () => { await new Promise((r) => setTimeout(r, 30)); order.push(1); }),
      lock(async () => { order.push(2); }),
    ]);
    expect(order).toEqual([1, 2]);
  });

  it("aborts work that overruns the source budget", async () => {
    await expect(withSourceTimeout(40, async (signal) => {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, 200);
        signal.addEventListener("abort", () => { clearTimeout(timer); reject(new FeedError("network", "timeout")); });
      });
    })).rejects.toMatchObject({ category: "network", reason: "timeout" });
  });
});

describe("checkSource timeout and retry", () => {
  it("treats a hung feed as a failed check, not a throw", async () => {
    vi.stubGlobal("fetch", (async (_url: string | URL, init?: RequestInit) => {
      await new Promise<never>((_, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
      });
    }) as unknown as typeof fetch);
    const checked = await checkSource(org, { descriptions: new Map(), workdayMeta: new Map() }, 50);
    expect(checked.result).toEqual({ ok: false, error: "network" });
    expect(checked.timedOut).toBe(true);
    expect(checked.retried).toBe(false);
  });

  it("retries a short network error once", async () => {
    let calls = 0;
    vi.stubGlobal("fetch", (async () => {
      calls++;
      if (calls === 1) throw new TypeError("fetch failed");
      return jsonResponse(greenhouseBody);
    }) as typeof fetch);
    const checked = await checkSource(org, { descriptions: new Map(), workdayMeta: new Map() }, 5_000);
    expect(calls).toBe(2);
    expect(checked.retried).toBe(true);
    expect(checked.result.ok).toBe(true);
    if (checked.result.ok) expect(checked.result.jobs).toHaveLength(1);
  });

  it("does not retry a 429", async () => {
    let calls = 0;
    vi.stubGlobal("fetch", (async () => {
      calls++;
      return jsonResponse({}, 429, { "content-type": "application/json" });
    }) as typeof fetch);
    const checked = await checkSource(org, { descriptions: new Map(), workdayMeta: new Map() }, 5_000);
    expect(calls).toBe(1);
    expect(checked.retried).toBe(false);
    expect(checked.result).toEqual({ ok: false, error: "rate-limited" });
  });
});

describe("refreshJobs keeps previous listings on timeout", () => {
  it("reconciles a timed-out source without dropping open jobs", async () => {
    const job: NormalizedJob = {
      id: "acme:greenhouse:acme:1",
      source_job_id: "1",
      organization_slug: "acme",
      source_type: "greenhouse",
      source_identifier: "acme",
      source_url: "https://boards-api.greenhouse.io/v1/boards/acme/jobs",
      title: "Research Engineer",
      official_url: "https://job-boards.greenhouse.io/acme/jobs/1",
      apply_url: null,
      requisition_id: null,
      locations: ["Boston"],
      countries: [],
      workplace: "unknown",
      remote: null,
      employment_type: "unknown",
      department: null,
      team: null,
      salaries: [],
      posted_at: null,
      posted_date_kind: null,
    };
    const previous = reconcile(EMPTY_DATASET, "acme", config, { ok: true, jobs: [job] }, "2026-10-18T00:00:00.000Z");
    vi.stubGlobal("fetch", (async (_url: string | URL, init?: RequestInit) => {
      await new Promise<never>((_, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
      });
    }) as unknown as typeof fetch);
    const lines: string[] = [];
    const result = await refreshJobs({
      orgs: [org],
      state: previous,
      now: "2026-10-19T00:00:00.000Z",
      descriptions: new Map(),
      workdayMeta: new Map(),
      concurrency: 1,
      timeoutMs: 40,
      persist: false,
      log: (line) => lines.push(line),
    });
    expect(result.failed).toBe(1);
    expect(result.state.jobs.filter((j) => j.status === "open")).toHaveLength(1);
    expect(result.state.jobs[0].title).toBe("Research Engineer");
    expect(result.state.feeds[0].result).toBe("network");
    expect(lines.some((l) => l.includes("timed out") && l.includes("previous listings kept"))).toBe(true);
  });
});

describe("per-source time budget", () => {
  it("gives Workday sites a longer budget than the base, and others the base", () => {
    expect(sourceTimeoutMs({ careers: { source: { type: "workday" } } }, 180_000)).toBe(WORKDAY_SOURCE_TIMEOUT_MS);
    expect(sourceTimeoutMs({ careers: { source: { type: "greenhouse" } } }, 180_000)).toBe(180_000);
    expect(sourceTimeoutMs({ careers: { source: { type: "workday" } } }, 900_000)).toBe(900_000);
  });
});
