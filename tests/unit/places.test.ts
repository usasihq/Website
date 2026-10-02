import { describe, expect, it } from "vitest";
import { stateFromHeadquarters, stateFromSlug, stateSlug } from "@/lib/places";

describe("headquarters states", () => {
  it("reads the state only from the sourced headquarters label", () => {
    expect(stateFromHeadquarters("Santa Clara, California", "US")).toBe("CA");
    expect(stateFromHeadquarters("Boston area, Massachusetts", "US")).toBe("MA");
    expect(stateFromHeadquarters("Massachusetts", "US")).toBe("MA");
    expect(stateFromHeadquarters("Washington, D.C.", "US")).toBe("DC");
    expect(stateFromHeadquarters("Oakland, California (principal executive office; no formal headquarters)", "US")).toBe("CA");
  });
  it("leaves unclear labels unknown instead of guessing", () => {
    expect(stateFromHeadquarters("United States (city not stated; legal mailing address is a P.O. box in Mountain View, California)", "US")).toBeNull();
    expect(stateFromHeadquarters("Paris, France", "FR")).toBeNull();
    expect(stateFromHeadquarters("Springfield", "US")).toBeNull();
    expect(stateFromHeadquarters(null, "US")).toBeNull();
  });
  it("round-trips state slugs", () => {
    expect(stateSlug("NY")).toBe("new-york");
    expect(stateFromSlug("district-of-columbia")).toBe("DC");
  });
});
