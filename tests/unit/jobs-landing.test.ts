import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import { jobsIndexJsonLd, jobsLandingJsonLd } from "@/lib/jobs/jsonld";
import { cityDefinition, companyDefinition, computeLandingData, LISTINGS_SHOWN, MAX_CITY_NAME, MIN_CITY_LISTINGS, MIN_STATE_LISTINGS, stateDefinition, TOPICS, type Facts } from "@/lib/jobs/landing";
import { jobHref } from "@/lib/jobs/job-url";
import { DEFAULT_JOB_FILTERS, filterJobs, parseJobFilters, type JobItem } from "@/lib/jobs/search";
import type { FeedHealth } from "@/lib/jobs/schema";
import { US_STATES } from "@/lib/places";

describe("landing page text", () => {
  // Realistic upper bounds: 9,999 listings from 99 employers, and the longest date and state names.
  const worst: Facts = { count: 9999, employers: 99, soleEmployer: null, date: "Sep 30, 2026", usOnly: 9999, outside: 9999 };
  const longCity = "X".repeat(MAX_CITY_NAME);
  const employers = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) }).organizations.map((o) =>
    companyDefinition({ slug: o.slug, name: o.name, provider: o.careers?.source.type ?? null }),
  );
  const defs = [
    ...Object.values(TOPICS),
    ...Object.keys(US_STATES).map(stateDefinition),
    ...Object.keys(US_STATES).map((c) => cityDefinition(c, "x", longCity)),
    ...employers,
  ];
  it("keeps titles and descriptions answer-first and within 160 characters", () => {
    for (const d of defs) {
      expect(d.description(worst).length, d.path).toBeLessThanOrEqual(160);
      expect(d.title(worst).length, d.path).toBeLessThanOrEqual(90);
      expect(d.description(worst).startsWith("9,999"), d.path).toBe(true);
    }
  });
  it("says whether non-U.S. roles are included from the data, and names a sole employer", () => {
    const one: Facts = { count: 12, employers: 1, soleEmployer: "xAI", date: "Oct 13, 2026", usOnly: 12, outside: 0 };
    expect(TOPICS["entry-level"].description(one)).toContain("No non-U.S. roles listed.");
    expect(TOPICS["entry-level"].description({ ...one, outside: 2 })).toContain("Includes non-U.S. roles.");
    expect(stateDefinition("MS").description(one)).toBe("12 open listings naming a location in Mississippi, at xAI in the USASI catalog. Listings last checked Oct 13, 2026.");
    expect(stateDefinition("DC").h1).toBe("AI jobs in Washington, D.C.");
    expect(stateDefinition("DC").path).toBe("/jobs/in/district-of-columbia/");
    const sf = cityDefinition("CA", "san-francisco", "San Francisco");
    expect(sf.path).toBe("/jobs/in/california/san-francisco/");
    expect(sf.h1).toBe("AI jobs in San Francisco, California");
    expect(sf.description(one)).toBe("12 open listings naming San Francisco, CA, at xAI in the USASI catalog. Listings last checked Oct 13, 2026.");
    expect(sf.image).toBe("/og/jobs/in-california-san-francisco.jpg");
  });
});

describe("landing pages from listings", () => {
  const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });
  const now = Date.parse("2026-10-13T12:00:00.000Z");
  const seen = "2026-10-13T11:00:00.000Z";
  const feed = (organization_slug: string): FeedHealth => ({ organization_slug, source_type: "greenhouse", source_identifier: organization_slug, last_attempted: seen,
    last_successful: seen, result: "ok", consecutive_failures: 0, current_count: 0, pending_digest: null, pending_since: null });
  let id = 0;
  const item = (org: string, title: string, locations: string[], extra: Partial<JobItem> = {}): JobItem => {
    id += 1;
    return { id: `${org}:greenhouse:${org}:${id}`, organization_slug: org, source_type: "greenhouse", source_identifier: org, source_job_id: String(id),
      source_url: `https://boards-api.greenhouse.io/v1/boards/${org}/jobs`, title, locations, countries: [], workplace: "unknown", employment_type: "unknown",
      department: null, team: null, salaries: [], official_url: `https://job-boards.greenhouse.io/${org}/jobs/${id}`,
      posted_at: `2026-09-${String((id % 28) + 1).padStart(2, "0")}T00:00:00.000Z`, posted_date_kind: "first-published", last_seen: seen, status: "open",
      organization_name: catalog.organization(org)?.name ?? org, ...extra };
  };
  const items = [
    ...Array.from({ length: 112 }, (_, i) => item("openai", `Data Center Technician ${i}`, ["Atlanta, GA"])),
    ...Array.from({ length: 3 }, () => item("anthropic", "Account Executive", ["Savannah, Georgia, United States", "London, UK"])),
    ...Array.from({ length: MIN_STATE_LISTINGS - 1 }, () => item("anthropic", "Recruiter", ["Boise, ID"])),
    ...Array.from({ length: 20 }, () => item("anthropic", "Recruiter", ["Toronto, CA"])),
    // Washington: 11 in Seattle (named on its own) and 3 in Bellevue; Seattle gets a page, Bellevue does not.
    ...Array.from({ length: 11 }, (_, i) => item("openai", "Research Engineer", [i % 2 ? "Seattle" : "Seattle, WA"])),
    ...Array.from({ length: 3 }, () => item("openai", "Research Engineer", ["Bellevue Office"])),
    // Every Mississippi listing is in Southaven, so a Southaven page would repeat the state page.
    ...Array.from({ length: 12 }, () => item("openai", "Research Engineer", ["Southaven, MS"])),
    item("anthropic", "Stale listing", ["Atlanta, GA"], { last_seen: "2026-10-10T00:00:00.000Z" }),
  ];
  const data = computeLandingData(catalog, items, [feed("openai"), feed("anthropic")], now);
  const georgia = data.states.find((p) => p.state === "GA")!;

  it("generates state pages only at or above the threshold, from named states only", () => {
    expect(data.states.map((p) => p.state)).toEqual(["GA", "MS", "WA"]);
    expect(data.stateCounts.ID).toBe(MIN_STATE_LISTINGS - 1);
    expect(data.stateCounts.CA).toBeUndefined();
    expect(data.stateCounts.WA).toBe(14);
  });

  it("generates city pages at or above the threshold, below their state's count, and matching the directory", () => {
    expect(data.cities.map((p) => p.path)).toEqual(["/jobs/in/georgia/atlanta/", "/jobs/in/washington/seattle/"]);
    expect(data.cityCounts["MS|southaven"]).toBe(12);
    expect(data.cityCounts["WA|bellevue"]).toBeLessThan(MIN_CITY_LISTINGS);
    const seattle = data.cities.find((p) => p.city?.slug === "seattle")!;
    expect(seattle.count).toBe(11);
    expect(seattle.kind).toBe("city");
    expect(seattle.indexable).toBe(true);
    expect(seattle.directoryHref).toBe("/jobs/?state=WA&city=seattle&sort=newest");
    const directory = filterJobs(items, [feed("openai"), feed("anthropic")], parseJobFilters(new URLSearchParams(seattle.directoryHref.split("?")[1])), now);
    expect(directory.map((j) => j.id)).toEqual(seattle.listings.map((j) => j.id));
    expect(seattle.geography.alsoElsewhere).toBe(0);
    expect(data.all.map((p) => p.path)).toContain(seattle.path);
  });

  it("counts current listings, caps the embedded list, and matches the directory exactly", () => {
    expect(georgia.count).toBe(115);
    expect(georgia.listings).toHaveLength(LISTINGS_SHOWN);
    expect(georgia.title).toBe("AI jobs in Georgia: 115 open listings at U.S. AI companies and labs");
    expect(georgia.directoryHref).toBe("/jobs/?state=GA&sort=newest");
    const directory = filterJobs(items, [feed("openai"), feed("anthropic")], parseJobFilters(new URLSearchParams(georgia.directoryHref.split("?")[1])), now);
    expect(directory.map((j) => j.id)).toEqual(georgia.listings.map((j) => j.id).concat(directory.slice(LISTINGS_SHOWN).map((j) => j.id)));
    expect(georgia.employers.map((e) => [e.slug, e.count])).toEqual([["openai", 112], ["anthropic", 3]]);
    expect(georgia.geography).toMatchObject({ alsoElsewhere: 3, outside: 3 });
    expect(georgia.lastChecked).toBe(seen);
  });

  it("labels topic geography from the data", () => {
    const dc = data.topics.find((p) => p.id === "data-center-infrastructure")!;
    expect(dc.count).toBe(112);
    expect(dc.directoryHref).toBe("/jobs/?track=infrastructure&sort=newest");
    expect(dc.usOnlyHref).toBe("/jobs/?track=infrastructure&where=us&sort=newest");
    expect(dc.description).toContain("No non-U.S. roles listed.");
    const noCode = data.topics.find((p) => p.id === "no-programming")!;
    expect(noCode.geography).toMatchObject({ outsideOnly: 20, outside: 23 });
    expect(noCode.description).toContain("Includes non-U.S. roles.");
    const remote = data.topics.find((p) => p.id === "remote-us")!;
    expect(remote.count).toBe(0);
    expect(remote.indexable).toBe(false);
  });

  it("gives every employer with an automated board a shareable page that matches the directory", () => {
    const openai = data.companies.find((p) => p.organization?.slug === "openai")!;
    expect(openai.path).toBe("/jobs/at/openai/");
    expect(openai.kind).toBe("company");
    expect(openai.count).toBe(112 + 11 + 3 + 12);
    expect(openai.directoryHref).toBe("/jobs/?company=openai&sort=newest");
    expect(openai.indexable).toBe(true);
    const directory = filterJobs(items, [feed("openai"), feed("anthropic")], parseJobFilters(new URLSearchParams(openai.directoryHref.split("?")[1])), now);
    expect(directory).toHaveLength(openai.count);
    expect(openai.title).toBe("OpenAI jobs: 138 open positions from its own job board");
    // Employers whose feeds report no current listings keep a page, kept out of search engines.
    const empty = data.companies.find((p) => p.count === 0);
    if (empty) expect(empty.indexable).toBe(false);
    expect(data.all.filter((p) => p.kind === "company")).toHaveLength(data.companies.length);
  });

  it("never emits JobPosting-style fields it does not have", () => {
    expect(Object.keys(DEFAULT_JOB_FILTERS)).toContain("state");
    expect(JSON.stringify(georgia)).not.toContain("JobPosting");
  });

  it("describes a landing page as a CollectionPage of the listings shown, not as JobPosting", () => {
    const ld = jobsLandingJsonLd(georgia) as { "@graph": { "@type": string; numberOfItems?: number; itemListElement?: { url: string }[] }[] };
    const types = ld["@graph"].map((n) => n["@type"]);
    expect(types).toEqual(["CollectionPage", "ItemList", "ItemList"]);
    expect(JSON.stringify(ld)).not.toContain("JobPosting");
    const listings = ld["@graph"].find((n) => n["@type"] === "ItemList" && n.numberOfItems === LISTINGS_SHOWN)!;
    expect(listings.numberOfItems).toBe(georgia.listings.length);
    expect(listings.itemListElement![0].url).toContain(jobHref(georgia.listings[0]));
  });
});

describe("jobs directory structured data", () => {
  it("lists topic, state, and city pages and omits JobPosting and empty topic pages", () => {
    const ld = jobsIndexJsonLd([
      { path: "/jobs/remote/", name: "Remote jobs, all locations", count: 40, kind: "topic", state: null },
      { path: "/jobs/remote-us/", name: "Remote jobs, U.S. locations", count: 0, kind: "topic", state: null },
      { path: "/jobs/in/california/", name: "Jobs in California", count: 50, kind: "state", state: "CA" },
      { path: "/jobs/at/openai/", name: "Jobs at OpenAI", count: 100, kind: "company", state: null },
    ]) as { "@graph": { "@type": string; numberOfItems?: number; itemListElement?: { name: string }[] }[] };
    expect(ld["@graph"][0]["@type"]).toBe("CollectionPage");
    const list = ld["@graph"][1];
    expect(list["@type"]).toBe("ItemList");
    expect(list.numberOfItems).toBe(2);
    expect(list.itemListElement!.map((i) => i.name)).toEqual(["Remote jobs, all locations", "Jobs in California"]);
    expect(JSON.stringify(ld)).not.toContain("JobPosting");
  });
});
