import { describe, expect, it } from "vitest";
import { Catalog } from "@/lib/catalog";
import { computeTier, isOsiApproved, licenseCaveats, meetsTier, tierSatisfies } from "@/lib/openness";
import { validateContent } from "@/lib/validate";
import { fixtureContent, TODAY } from "../fixtures/content";

const catalog = new Catalog(validateContent(fixtureContent(), { today: TODAY }));
const a = (slug: string) => catalog.artifact(slug)!;

describe("openness rubric v0.1", () => {
  it("computes tiers only for model releases", () => {
    expect(computeTier(a("fixture-family"))).toBeNull();
    expect(computeTier(a("fixture-tool"))).toBeNull();
    expect(computeTier(a("fixture-dataset"))).toBeNull();
  });

  it("assigns each release the tier its checklist and licenses support", () => {
    expect(computeTier(a("fixture-fully-open"))).toBe("fully-open");
    expect(computeTier(a("fixture-open-stack"))).toBe("open-stack");
    expect(computeTier(a("fixture-open-weight"))).toBe("open-weight");
    expect(computeTier(a("fixture-closed-weights"))).toBe("weights-not-public");
    expect(computeTier(a("fixture-unknown-weights"))).toBe("unknown");
  });

  it("does not award fully open when any license is not OSI-approved", () => {
    const release = { ...a("fixture-fully-open"), licenses: [{ ...a("fixture-fully-open").licenses[0], spdx: null, name: "Custom" }] };
    expect(computeTier(release)).toBe("open-stack");
  });

  it("treats tiers as cumulative (overlapping) categories", () => {
    expect(meetsTier(a("fixture-fully-open"), "open-weight")).toBe(true);
    expect(meetsTier(a("fixture-fully-open"), "open-stack")).toBe(true);
    expect(meetsTier(a("fixture-open-stack"), "fully-open")).toBe(false);
    expect(meetsTier(a("fixture-closed-weights"), "open-weight")).toBe(false);
    expect(tierSatisfies("open-stack", "open-weight")).toBe(true);
    expect(tierSatisfies("unknown", "unknown")).toBe(true);
    expect(tierSatisfies("open-weight", "unknown")).toBe(false);
  });

  it("shows a license caveat for open weights under a non-OSI license", () => {
    expect(licenseCaveats(a("fixture-open-weight"))).toHaveLength(1);
    expect(licenseCaveats(a("fixture-fully-open"))).toHaveLength(0);
  });

  it("recognizes only listed SPDX identifiers as OSI-approved", () => {
    expect(isOsiApproved("Apache-2.0")).toBe(true);
    expect(isOsiApproved("MIT")).toBe(true);
    expect(isOsiApproved("CC-BY-NC-4.0")).toBe(false);
    expect(isOsiApproved(null)).toBe(false);
  });
});
