import { describe, expect, it } from "vitest";
import { parseComparison, serializeComparison } from "@/components/ModelComparison";

describe("comparison URL state", () => {
  it("round-trips selection order and details, omitting defaults", () => {
    const state = { orgs: ["openai", "ai2"], detail: true };
    expect(parseComparison(new URLSearchParams(serializeComparison(state)))).toEqual(state);
    expect(serializeComparison({ orgs: [], detail: false })).toBe("");
  });
  it("rejects malformed values, deduplicates organizations and caps selections", () => {
    expect(parseComparison(new URLSearchParams("orgs=openai,openai,<script>,ai2,meta,google,apple&detail=yes")))
      .toEqual({ orgs: ["openai", "ai2", "meta", "google"], detail: false });
  });
});
