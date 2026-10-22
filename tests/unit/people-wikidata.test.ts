import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import { schoolsFromAffiliations, schoolsFromPersonText, schoolsFromWikidataEducation } from "@/lib/people-schools";
import {
  commonsImageFromMetadata,
  corroborations,
  decideMatch,
  foldName,
  isFreeCommonsLicense,
  namesOverlap,
  PeopleWikidataDataset,
  personFactsFrom,
  personNameMatches,
  stripAttributionHtml,
  type WikidataCandidate,
} from "@/lib/people-wikidata";

const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });

const human = (over: Partial<WikidataCandidate> & Pick<WikidataCandidate, "qid" | "label">): WikidataCandidate => ({
  aliases: [],
  instanceOf: ["Q5"],
  employers: [],
  educatedAt: [],
  occupations: [],
  fields: [],
  notableWork: [],
  github: null,
  websites: [],
  image: null,
  wikipedia: null,
  ...over,
});

describe("Wikidata name matching", () => {
  it("allows a dropped middle initial and rejects a different family name", () => {
    expect(personNameMatches("Alexei A. Efros", "Alexei Efros")).toBe(true);
    expect(personNameMatches("Andrej Karpathy", "Andrej Karpathy")).toBe(true);
    expect(personNameMatches("Andrej Karpathy", "Andrew Karpathy")).toBe(false);
    expect(personNameMatches("Sam Altman", "Samuel Altman")).toBe(false);
  });

  it("treats OpenAI / Meta employer aliases as the same organization", () => {
    expect(namesOverlap("OpenAI", "OpenAI")).toBe(true);
    expect(namesOverlap("Meta", "Facebook AI Research")).toBe(true);
    expect(namesOverlap("Google DeepMind", "DeepMind")).toBe(true);
    expect(namesOverlap("OpenAI", "Anthropic")).toBe(false);
  });
});

describe("high-confidence Wikidata decisions", () => {
  const karpathy = catalog.person("andrej-karpathy")!;
  const facts = personFactsFrom(karpathy, schoolsFromPersonText(karpathy).map((s) => s.name));

  it("accepts a unique human whose employer matches the profile", () => {
    const decision = decideMatch(facts, [
      human({ qid: "Q23823664", label: "Andrej Karpathy", employers: ["OpenAI", "Tesla"], educatedAt: [{ qid: "Q41506", name: "Stanford University" }] }),
    ]);
    expect(decision.status).toBe("matched");
    if (decision.status === "matched") {
      expect(decision.candidate.qid).toBe("Q23823664");
      expect(decision.reasons.some((r) => r.startsWith("employer:") || r.startsWith("education:"))).toBe(true);
    }
  });

  it("treats the same QID listed twice as one person", () => {
    const one = human({ qid: "Q56037405", label: "Andrej Karpathy", employers: ["OpenAI"], github: "karpathy" });
    const decision = decideMatch(facts, [one, { ...one }]);
    expect(decision.status).toBe("matched");
    if (decision.status === "matched") expect(decision.candidate.qid).toBe("Q56037405");
  });

  it("skips two qualifying humans as ambiguous", () => {
    const decision = decideMatch(facts, [
      human({ qid: "Q1", label: "Andrej Karpathy", employers: ["OpenAI"] }),
      human({ qid: "Q2", label: "Andrej Karpathy", employers: ["Tesla"] }),
    ]);
    expect(decision.status).toBe("ambiguous");
  });

  it("does not match a name-only hit with no corroborating fact", () => {
    const decision = decideMatch(facts, [human({ qid: "Q9", label: "Andrej Karpathy", employers: ["A different lab"] })]);
    expect(decision.status).toBe("unmatched");
  });

  it("matches a handle via GitHub even when the English label differs", () => {
    const person = {
      slug: "thebloke",
      name: "TheBloke",
      affiliations: [{ name: "Independent", role: "Maintainer" }],
      work: ["GPTQ"],
      github: "TheBloke",
      websites: [],
      handles: ["TheBloke"],
      schoolNames: [],
    };
    const decision = decideMatch(person, [human({ qid: "Q123", label: "Tom Jobbins", aliases: ["TheBloke"], github: "TheBloke" })]);
    expect(decision.status).toBe("matched");
    if (decision.status === "matched") expect(decision.reasons).toContain("github:TheBloke");
  });

  it("records an employer corroboration from the profile", () => {
    const reasons = corroborations(facts, human({ qid: "Q23823664", label: "Andrej Karpathy", employers: ["OpenAI"] }));
    expect(reasons.some((r) => r.startsWith("employer:"))).toBe(true);
  });
});

describe("Commons licenses", () => {
  it("allows CC BY, CC BY-SA, CC0, and public domain, and rejects the rest", () => {
    expect(isFreeCommonsLicense("CC BY-SA 4.0")).toBe(true);
    expect(isFreeCommonsLicense("CC BY 2.0")).toBe(true);
    expect(isFreeCommonsLicense("CC0")).toBe(true);
    expect(isFreeCommonsLicense("Public domain")).toBe(true);
    expect(isFreeCommonsLicense("CC BY-NC 4.0")).toBe(false);
    expect(isFreeCommonsLicense("CC BY-ND 3.0")).toBe(false);
    expect(isFreeCommonsLicense("Fair use")).toBe(false);
    expect(isFreeCommonsLicense("")).toBe(false);
    expect(isFreeCommonsLicense(undefined)).toBe(false);
  });

  it("builds a credited image only for a free Commons file", () => {
    const ok = commonsImageFromMetadata(
      "File:Andrej Karpathy.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Andrej_Karpathy.jpg/400px-Andrej_Karpathy.jpg",
      { LicenseShortName: { value: "CC BY-SA 4.0" }, LicenseUrl: { value: "https://creativecommons.org/licenses/by-sa/4.0" }, Artist: { value: "<a href=\"https://example.org\">Jane Doe</a>" } },
    );
    expect(ok).toEqual({
      title: "File:Andrej Karpathy.jpg",
      commons_url: "https://commons.wikimedia.org/wiki/File:Andrej_Karpathy.jpg",
      thumb_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Andrej_Karpathy.jpg/400px-Andrej_Karpathy.jpg",
      license: "CC BY-SA 4.0",
      license_url: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "Jane Doe",
    });
    expect(
      commonsImageFromMetadata("File:x.jpg", "https://upload.wikimedia.org/wikipedia/commons/x.jpg", { LicenseShortName: { value: "Fair use" } }),
    ).toBeNull();
    expect(stripAttributionHtml("A &amp; B<br>C")).toBe("A & B, C");
  });
});

describe("school extraction from bios", () => {
  it("reads Karpathy's Stanford PhD and ignores an MIT license", () => {
    const p = catalog.person("andrej-karpathy")!;
    expect(schoolsFromPersonText(p).map((s) => s.slug)).toContain("stanford-university");
    expect(schoolsFromPersonText(p).some((s) => s.slug === "stanford-university" && s.kind === "education")).toBe(true);
    expect(schoolsFromPersonText(p).map((s) => s.slug)).not.toContain("mit");
  });

  it("reads Andrew Ng's Stanford affiliation from the sourced role", () => {
    const p = catalog.person("andrew-ng")!;
    expect(schoolsFromAffiliations(p).map((s) => s.slug)).toContain("stanford-university");
  });

  it("does not treat a passing collaboration mention as a school", () => {
    const text = {
      headline: "Founder working with a lab at another school",
      bio: { text: "The Terminal-Bench paper was posted with a group at Stanford.", source_ids: ["x"], reviewed_at: "2026-10-01" },
      sections: [],
      timeline: [],
    };
    expect(schoolsFromPersonText(text)).toEqual([]);
  });

  it("maps a Wikidata P69 QID onto the school catalog", () => {
    expect(schoolsFromWikidataEducation([{ qid: "Q41506", name: "Stanford University" }])).toEqual([
      { slug: "stanford-university", name: "Stanford University", kind: "education", evidence: "wikidata-p69" },
    ]);
  });
});

describe("checked-in Wikidata dataset", () => {
  it("parses the committed file when present and keeps counts consistent", () => {
    const file = path.join(process.cwd(), "data/people/wikidata.json");
    if (!fs.existsSync(file)) return;
    const data = PeopleWikidataDataset.parse(JSON.parse(fs.readFileSync(file, "utf8")));
    expect(data.matched).toBe(data.people.filter((p) => p.qid).length);
    expect(data.photos).toBe(data.people.filter((p) => p.image).length);
    expect(data.ambiguous).toBe(data.skipped.filter((s) => s.reason === "ambiguous").length);
    expect(data.people.every((p) => catalog.person(p.slug))).toBe(true);
    expect(new Set(data.people.map((p) => p.slug)).size).toBe(data.people.length);
    expect(foldName("Andrej Karpathy")).toBe("andrej karpathy");
  });
});
