import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import { closestFeed, narrowingFilters, type FollowFeed } from "@/lib/jobs/feed-match";
import { jobFeedDescription } from "@/lib/jobs/feeds";
import { computeLandingData, MIN_INDEX_LISTINGS } from "@/lib/jobs/landing";
import { computePayData, MIN_PAY_LISTINGS, payStats, quantile, yearlyUsdRange } from "@/lib/jobs/pay";
import { DEFAULT_JOB_FILTERS, parseJobFilters, type JobFilters, type JobItem } from "@/lib/jobs/search";
import type { FeedHealth, Job } from "@/lib/jobs/schema";
import type { Organization } from "@/lib/schema";
import { rssDocument } from "@/lib/rss";

const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });
const now = Date.parse("2026-10-13T12:00:00.000Z");
const seen = "2026-10-13T11:00:00.000Z";
const feed = (organization_slug: string): FeedHealth => ({ organization_slug, source_type: "greenhouse", source_identifier: organization_slug, last_attempted: seen,
  last_successful: seen, result: "ok", consecutive_failures: 0, current_count: 0, pending_digest: null, pending_since: null });
let id = 0;
const item = (org: string, title: string, extra: Partial<JobItem> = {}): JobItem => {
  id += 1;
  return { id: `${org}:greenhouse:${org}:${id}`, organization_slug: org, source_type: "greenhouse", source_identifier: org, source_job_id: String(id),
    source_url: `https://boards-api.greenhouse.io/v1/boards/${org}/jobs`, title, locations: ["San Francisco, CA"], countries: [], workplace: "unknown", employment_type: "unknown",
    department: null, team: null, salaries: [], official_url: `https://job-boards.greenhouse.io/${org}/jobs/${id}`,
    posted_at: "2026-10-01T00:00:00.000Z", posted_date_kind: "first-published", first_seen: seen, last_seen: seen, status: "open",
    organization_name: catalog.organization(org)?.name ?? org, ...extra };
};
const year = (min: number | null, max: number | null, source_status: "employer-provided" | "employer-description" = "employer-provided") =>
  ({ min, max, currency: "USD", period: "year" as const, label: null, source_status });

/** Well-formedness: every tag closes in order, and no raw "<" or bare "&" is left in text. */
function wellFormed(xml: string): boolean {
  const body = xml.replace(/^<\?xml[^>]*\?>\s*/, "");
  const stack: string[] = [];
  for (const m of body.matchAll(/<(\/?)([A-Za-z:]+)([^>]*?)(\/?)>|&(?!(amp|lt|gt|quot|apos|#\d+);)/g)) {
    if (m[0].startsWith("&")) return false;
    if (m[4]) continue;
    if (m[1]) {
      if (stack.pop() !== m[2]) return false;
    } else stack.push(m[2]);
  }
  return stack.length === 0 && !/<(?![/A-Za-z?])/.test(body);
}

describe("job feeds", () => {
  it("are valid RSS with exact timestamps, escaped text, and guid = the job page", () => {
    const xml = rssDocument({
      title: "Jobs & <more>",
      path: "/jobs/",
      selfPath: "/jobs/feed.xml",
      description: "x",
      items: [{ title: `R&D "Lead" <script>`, path: "/jobs/at/acme/r-and-d-lead-abc1234/", date: "2026-10-12T08:30:00.000Z", exact: true, description: "Pay: $1 & up" }],
    });
    expect(wellFormed(xml)).toBe(true);
    expect(xml).toContain("<pubDate>Mon, 12 Oct 2026 08:30:00 GMT</pubDate>");
    expect(xml).toContain("<lastBuildDate>Mon, 12 Oct 2026 08:30:00 GMT</lastBuildDate>");
    expect(xml).toMatch(/<guid isPermaLink="true">https:\/\/[^<]+\/jobs\/at\/acme\/r-and-d-lead-abc1234\/<\/guid>/);
    expect(xml).toContain("R&amp;D &quot;Lead&quot; &lt;script&gt;");
    // Date-only items keep the noon-UTC convention.
    expect(rssDocument({ title: "t", path: "/", selfPath: "/f.xml", description: "d", items: [{ title: "a", path: "/a/", date: "2026-10-12", description: "b" }] })).toContain("Mon, 12 Oct 2026 12:00:00 GMT");
  });

  it("describe a listing with facts only, labelling pay read from the description", () => {
    const org = { slug: "acme", name: "Acme AI (Example)" } as Organization;
    const job = { ...item("openai", "Engineer"), workplace: "remote", salaries: [year(150000, 200000, "employer-description")] } as unknown as Job;
    expect(jobFeedDescription({ job, org })).toBe(
      "Acme AI. Location: San Francisco, CA. Workplace: remote. Pay: $150,000 to $200,000 a year, as stated in the employer's job description. First listed on USASI Oct 13, 2026.",
    );
  });
});

describe("follow this search", () => {
  const feeds: FollowFeed[] = [
    { path: "/jobs/at/openai/feed.xml", page: "/jobs/at/openai/", title: "Jobs at OpenAI", filters: { company: "openai", where: "all" }, includesOutside: true },
    { path: "/jobs/in/california/feed.xml", page: "/jobs/in/california/", title: "AI jobs in California", filters: { state: "CA" }, includesOutside: false },
    { path: "/jobs/remote-us/feed.xml", page: "/jobs/remote-us/", title: "Remote (U.S.)", filters: { where: "remote-us" }, includesOutside: false },
    { path: "/jobs/role/research-scientist/feed.xml", page: "/jobs/role/research-scientist/", title: "Research scientist", filters: { role: "research-scientist" }, includesOutside: true },
  ];
  const all: FollowFeed = { path: "/jobs/feed.xml", page: "/jobs/", title: "New AI jobs in the U.S.", filters: {}, includesOutside: false };
  const f = (q: string): JobFilters => parseJobFilters(new URLSearchParams(q));

  it("matches a page's own filters exactly, ignoring sort, page, and the default or all-country scope", () => {
    expect(closestFeed(f("company=openai&sort=pay&page=3"), feeds, all)).toMatchObject({ exact: true, feed: { path: "/jobs/at/openai/feed.xml" } });
    expect(closestFeed(f("company=openai&where=all"), feeds, all).exact).toBe(true);
    expect(closestFeed(f("state=CA"), feeds, all).feed.path).toBe("/jobs/in/california/feed.xml");
    expect(closestFeed(f("where=remote-us"), feeds, all).feed.path).toBe("/jobs/remote-us/feed.xml");
    expect(closestFeed(f(""), feeds, all)).toEqual({ feed: all, exact: true, unmatched: [] });
  });

  it("falls back to the broadest page feed that contains the search, then to all U.S. jobs, naming what is left out", () => {
    const m = closestFeed(f("company=openai&q=research&salary=1"), feeds, all);
    expect(m.exact).toBe(false);
    expect(m.feed.path).toBe("/jobs/at/openai/feed.xml");
    expect(m.unmatched.sort()).toEqual(["q", "salary"]);
    const none = closestFeed(f("q=robotics&level=senior"), feeds, all);
    expect(none.feed).toBe(all);
    expect(none.exact).toBe(false);
    expect(narrowingFilters({ ...DEFAULT_JOB_FILTERS, where: "all", sort: "pay", view: "unverified" }).size).toBe(0);
  });
});

describe("AI pay", () => {
  it("uses yearly U.S.-dollar ranges only, preferring the feed, spanning tiers, and rejecting implausible ones", () => {
    expect(yearlyUsdRange([year(100000, 200000)])).toEqual({ min: 100000, max: 200000, mid: 150000, source: "employer-provided" });
    expect(yearlyUsdRange([year(100000, 200000), year(150000, 260000)])).toMatchObject({ min: 100000, max: 260000, mid: 180000 });
    expect(yearlyUsdRange([year(90000, 120000, "employer-description"), year(100000, 200000)])).toMatchObject({ mid: 150000, source: "employer-provided" });
    expect(yearlyUsdRange([{ ...year(50, 70), period: "hour" }])).toBeNull();
    expect(yearlyUsdRange([{ ...year(100000, 200000), currency: "EUR" }])).toBeNull();
    expect(yearlyUsdRange([year(null, 200000)])).toBeNull();
    expect(yearlyUsdRange([year(50, 70)])).toBe("implausible");
    expect(yearlyUsdRange([{ ...year(200000, 400000, "employer-description"), label: "On-target earnings" }])).toBeNull();
    expect(yearlyUsdRange([{ ...year(200000, 400000), label: "Zone A · on-target earnings" }, { ...year(100000, 150000), label: "Zone A" }])).toMatchObject({ mid: 125000 });
  });

  it("computes the median and middle range of midpoints by linear interpolation", () => {
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
    expect(quantile([1, 2, 3, 4, 5], 0.25)).toBe(2);
    expect(quantile([10], 0.75)).toBe(10);
    const jobs = [100, 120, 140, 160, 180].map((k, i) => item("openai", `Engineer ${i}`, { salaries: [year(k * 1000 - 20000, k * 1000 + 20000)], workplace: i === 0 ? "remote" : "on-site" }));
    const s = payStats([...jobs, item("openai", "No pay"), item("openai", "Bad pay", { salaries: [year(10, 20)] })]);
    expect(s).toMatchObject({ listings: 7, count: 5, median: 140000, p25: 120000, p75: 160000, remote: 1, implausible: 1 });
    expect(s.rows[0].range.mid).toBe(180000);
  });

  it("publishes a role or employer only with enough listings with pay, from the directory's default view", () => {
    const fde = Array.from({ length: MIN_PAY_LISTINGS }, (_, i) => item("openai", `Forward Deployed Engineer ${i}`, { salaries: [year(150000 + i * 1000, 250000)], first_seen: `2026-10-0${(i % 9) + 1}T00:00:00.000Z` }));
    const few = Array.from({ length: MIN_PAY_LISTINGS - 1 }, (_, i) => item("anthropic", `Research Scientist ${i}`, { salaries: [year(300000, 400000)] }));
    const abroad = Array.from({ length: 5 }, (_, i) => item("openai", `Forward Deployed Engineer abroad ${i}`, { locations: ["London, UK"], salaries: [year(100000, 120000)] }));
    const data = computePayData(catalog, [...fde, ...few, ...abroad], [feed("openai"), feed("anthropic")], now, new Map());
    expect(data.roles.map((g) => g.slug)).toEqual(["forward-deployed-engineer"]);
    expect(data.roles[0].stats.count).toBe(MIN_PAY_LISTINGS);
    expect(data.roles[0].path).toBe("/jobs/pay/forward-deployed-engineer/");
    expect(data.roles[0].directoryHref).toBe("/jobs/?role=forward-deployed-engineer&salary=1&sort=pay");
    expect(data.roles[0].stats.newestFirstSeen).toBe("2026-10-09T00:00:00.000Z");
    expect(data.employers.map((g) => g.slug)).toEqual(["openai"]);
    expect(data.all.stats.count).toBe(MIN_PAY_LISTINGS * 2 - 1);
  });
});

describe("landing page quality gate", () => {
  it("keeps employer pages under the threshold reachable but noindex, and dates pages by their newest listing", () => {
    const items = [
      ...Array.from({ length: MIN_INDEX_LISTINGS - 1 }, () => item("anthropic", "Recruiter")),
      ...Array.from({ length: MIN_INDEX_LISTINGS }, (_, i) => item("openai", "Recruiter", { first_seen: `2026-10-0${i + 1}T00:00:00.000Z` })),
    ];
    const data = computeLandingData(catalog, items, [feed("openai"), feed("anthropic")], now);
    const anthropic = data.companies.find((p) => p.organization?.slug === "anthropic")!;
    const openai = data.companies.find((p) => p.organization?.slug === "openai")!;
    expect(anthropic.count).toBe(MIN_INDEX_LISTINGS - 1);
    expect(anthropic.indexable).toBe(false);
    expect(openai.indexable).toBe(true);
    expect(openai.newestFirstSeen).toBe(`2026-10-0${MIN_INDEX_LISTINGS}T00:00:00.000Z`);
    expect(openai.lastChecked).toBe(seen);
  });
});
