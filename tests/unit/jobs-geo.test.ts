import { describe, expect, it } from "vitest";
import { inLocationScope, isRemoteListing, jobGeography, placeGeography } from "@/lib/jobs/geo";
import { parseJobFilters, serializeJobFilters } from "@/lib/jobs/search";

const states = (location: string, countries: string[] = []) => jobGeography({ locations: [location], countries }).states;

describe("U.S. states read from employer-supplied locations", () => {
  it.each([
    ["Atlanta, GA", ["GA"]],
    ["Atlanta, GA - Data Center", ["GA"]],
    ["Atlanta, Georgia, United States", ["GA"]],
    ["San Francisco, CA - US", ["CA"]],
    ["Tulsa, OK - US (2)", ["OK"]],
    ["Dallas, TX - US (Remote)", ["TX"]],
    ["Hybrid- Any Office (Fremont, CA, Salem, OR, or Pittsburgh, PA)", ["CA", "OR", "PA"]],
    ["Hybrid- Salem, OR or Fremont, CA", ["CA", "OR"]],
    ["San Francisco, CA | New York City, NY | Seattle, WA", ["CA", "NY", "WA"]],
    ["Livingston, NJ / New York, NY / Washington, D.C./ Philadelphia, PA", ["DC", "NJ", "NY", "PA"]],
    ["Dallas, TX | Livingston, NJ | NYC | Richmond, VA | Washington DC", ["DC", "NJ", "NY", "TX", "VA"]],
    ["New York, New York, United States", ["NY"]],
    ["New York City", ["NY"]],
    ["Texas", ["TX"]],
    ["Remote - Texas", ["TX"]],
    ["United States | Alabama", ["AL"]],
    ["Seattle, Washington, United States", ["WA"]],
    ["Kansas City, MO - Data Center", ["MO"]],
    ["Delaware, OH", ["OH"]],
    ["Paris, TX", ["TX"]],
    ["Cambridge, MA", ["MA"]],
  ])("%s → %j", (location, expected) => {
    expect(states(location)).toEqual(expected);
  });

  it.each([
    "San Francisco", // a city alone names no state
    "Remote - US",
    "US - Remote",
    "United States",
    "Remote-Friendly, United States",
    "Multiple U.S. Data Center Locations",
    "Washington", // the state or D.C.
    "Georgia", // the state or the country
    "Toronto, CA", // Canada, not California
    "Tel Aviv - IL", // Israel, not Illinois
    "Bangalore, IN", // India, not Indiana
    "Perth, WA", // Australia, not Washington
    "Tbilisi, Georgia",
    "Toronto, ON, Canada",
    "Sunnyvale, Ca", // postal codes must be written as codes
    "Dublin - IE",
    "Distributed",
  ])("%s names no U.S. state", (location) => {
    expect(states(location)).toEqual([]);
  });

  it("drops state-like text when the employer's countries for the posting are all outside the U.S.", () => {
    expect(states("Georgia", ["United States"])).toEqual(["GA"]);
    expect(states("New York", ["United Kingdom"])).toEqual([]);
    expect(states("Atlanta, GA", ["USA"])).toEqual(["GA"]);
  });

  it("separates U.S., outside, and unreadable locations", () => {
    expect(placeGeography("London, UK")).toEqual({ states: [], us: false, outside: true });
    expect(placeGeography("US, UK, Singapore, Remote")).toMatchObject({ us: true, outside: true });
    expect(placeGeography("Remote - US")).toEqual({ states: [], us: true, outside: false });
    expect(placeGeography("San Francisco")).toEqual({ states: [], us: false, outside: false });
    expect(placeGeography("Remote International").outside).toBe(true);
    expect(placeGeography("New Mexico").outside).toBe(false);
    expect(placeGeography("Panama City, FL")).toEqual({ states: ["FL"], us: true, outside: false });
    expect(placeGeography("Mexico City, MX").outside).toBe(true);
    expect(jobGeography({ locations: ["London"], countries: ["United States"] })).toMatchObject({ us: true, outside: true });
  });
});

describe("remote and U.S.-only scopes", () => {
  const job = (locations: string[], workplace = "unknown", countries: string[] = []) => ({ locations, workplace, countries });
  it("counts the employer's remote flag or a location that says Remote", () => {
    expect(isRemoteListing(job(["Japan"], "remote"))).toBe(true);
    expect(isRemoteListing(job(["Remote-Friendly (Travel-Required) | San Francisco, CA"], "on-site"))).toBe(true);
    expect(isRemoteListing(job(["San Francisco, CA"], "hybrid"))).toBe(false);
  });
  it("labels U.S.-only precisely", () => {
    expect(inLocationScope(job(["Remote - US"]), "remote-us")).toBe(true);
    expect(inLocationScope(job(["Remote"], "remote", ["United States"]), "remote-us")).toBe(true);
    expect(inLocationScope(job(["Remote"], "remote"), "remote-us")).toBe(false); // country unknown
    expect(inLocationScope(job(["US, UK, Remote"], "remote"), "remote-us")).toBe(false);
    expect(inLocationScope(job(["US, UK, Remote"], "remote"), "remote")).toBe(true);
    expect(inLocationScope(job(["London, UK; Remote-Friendly, United States; San Francisco, CA"]), "remote-us")).toBe(false);
    expect(inLocationScope(job(["Atlanta, GA"]), "us")).toBe(true);
    expect(inLocationScope(job(["Atlanta, GA", "Toronto, ON"]), "us")).toBe(false);
  });
});

describe("directory location filters", () => {
  it("parses and serializes state and location scope", () => {
    const f = parseJobFilters(new URLSearchParams("state=ga&where=remote-us"));
    expect(f.state).toBe("GA");
    expect(f.where).toBe("remote-us");
    expect(serializeJobFilters(f)).toBe("state=GA&where=remote-us");
    expect(parseJobFilters(new URLSearchParams("state=XX&where=moon")).state).toBe("");
    expect(parseJobFilters(new URLSearchParams("state=constructor&where=moon")).where).toBe("");
  });
});

