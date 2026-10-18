import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { encodeJobs, decodeJobs } from "@/lib/jobs/slim";
import { filterJobs, parseJobFilters, toJobItem, type JobItem } from "@/lib/jobs/search";
import { jobGeography } from "@/lib/jobs/geo";
import { Dataset } from "@/lib/jobs/schema";

// The jobs snapshot in data/jobs/current.json (the committed seed, or a local refresh): every open listing.
const dataset = Dataset.parse(JSON.parse(fs.readFileSync(path.join(process.cwd(), "data/jobs/current.json"), "utf8")));
const data = { items: dataset.jobs.filter((j) => j.status === "open").map((j) => toJobItem(j, j.organization_slug)), feeds: dataset.feeds };
const catalog = { buildAt: "2026-10-18T00:00:00.000Z" };
// A time when the snapshot's listings are current, so the filters have something to select.
const now = Math.max(...data.items.map((j) => Date.parse(j.last_seen)), Date.parse("2026-10-18T00:00:00Z")) + 3600000;

const URLS = [
  "", "where=all", "where=us", "where=remote", "where=remote-us", "q=machine+learning", "q=swe&where=all", "level=entry",
  "level=senior&category=software", "pay=200000", "salary=1&sort=pay", "posted=7", "state=CA", "state=CA&city=san-francisco",
  "state=CO&city=longmont-max", "company=spacex&where=all", "role=forward-deployed-engineer&where=all", "track=early-career",
  "workplace=unknown&employment=full-time", "w=London", "currency=USD&period=year&salary_min=150000", "view=unverified&where=all",
  "sort=company&where=all", "sort=title&page=3",
];

describe("compact /data/jobs.json", () => {
  const slim = JSON.parse(JSON.stringify(encodeJobs(data.items, catalog.buildAt)));
  const decoded = decodeJobs(slim);

  it("has current listings to compare", () => {
    if (data.items.length) expect(filterJobs(data.items, data.feeds, parseJobFilters(new URLSearchParams("")), now).length).toBeGreaterThan(0);
  });

  it("decodes to exactly the directory's listings", () => {
    expect(decoded).toHaveLength(data.items.length);
    expect(decoded).toEqual(data.items);
  });

  it("carries the same geography the browser would compute", () => {
    const fresh = (j: JobItem) => jobGeography({ locations: [...j.locations], countries: [...j.countries] });
    for (const j of decoded) expect(jobGeography(j)).toEqual(fresh(j));
  });

  it.each(URLS)("gives the same results for /jobs/?%s", (query) => {
    const f = parseJobFilters(new URLSearchParams(query));
    const ids = (rows: JobItem[]) => filterJobs(rows, data.feeds, f, now).map((j) => j.id);
    expect(ids(decoded)).toEqual(ids(data.items));
  });
});
