import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { JOB_ROLES, jobRole, titleMatchesRole, type JobRole } from "@/lib/jobs/roles";

const fde = jobRole("forward-deployed-engineer")!;

describe("job role config", () => {
  it("ships only Forward Deployed Engineer today, with include/exclude patterns", () => {
    expect(JOB_ROLES.map((r) => r.slug)).toEqual(["forward-deployed-engineer"]);
    expect(fde.name).toBe("Forward Deployed Engineer");
    expect(fde.include.length).toBeGreaterThan(0);
    expect(Array.isArray(fde.exclude)).toBe(true);
  });
});

describe("Forward Deployed Engineer title matcher", () => {
  it.each([
    "Forward Deployed Engineer",
    "Forward-Deployed Engineer",
    "Forward–Deployed Software Engineer",
    "Senior Forward Deployed Engineer, AI Agents",
    "Founding Forward Deployed Engineer",
    "Sr Staff ML Forward Deployed Engineer, Enterprise GenAI",
    "Forward Deployed Engineer (FDE) - SF",
    "Staff Full-Stack Software Engineer, (Forward Deployed), GPS",
    "Senior Full-Stack Software Engineer, (Forward deployed), GPS",
    "Manager, Forward Deployed Engineering",
    "Platform Engineering Manager, Forward Deployed Engineering (FDE)",
    "Senior FDE",
    "FDE",
    "Strategy & Operations, FDE",
    "Deployment Lead (DL), FDE - Tokyo",
  ])("includes %s", (title) => {
    expect(fde.test(title)).toBe(true);
    expect(titleMatchesRole(title, fde)).toBe(true);
  });

  it.each([
    "Deployed Engineer",
    "Deployed Engineer (NYC)",
    "Partner Deployed Engineer",
    "Partner Deployed Engineer - Europe",
    "Software Engineer",
    "Forward Engineer",
    "Deployed Product Manager",
    "CFDE Engineer",
    "AFDE",
    "fde",
    "forwarddeployed engineer",
  ])("leaves out %s", (title) => {
    expect(fde.test(title)).toBe(false);
  });

  it("honors exclude patterns when a role defines them", () => {
    const role: JobRole = {
      slug: "example",
      name: "Example",
      h1: "Example",
      intro: "",
      rule: "",
      include: [{ label: "forward deployed", pattern: String.raw`forward[\s\-]+deployed` }],
      exclude: [{ label: "product manager", pattern: String.raw`\bproduct manager\b` }],
    };
    expect(titleMatchesRole("Forward Deployed Engineer", role)).toBe(true);
    expect(titleMatchesRole("Forward Deployed Product Manager", role)).toBe(false);
  });
});

describe("matcher against the committed jobs snapshot", () => {
  const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data/jobs/current.json"), "utf8")) as {
    jobs: { title: string; organization_slug: string; status: string }[];
  };
  const open = data.jobs.filter((j) => j.status === "open");
  const matched = open.filter((j) => fde.test(j.title));

  it("matches only titles that contain Forward Deployed/Forward-Deployed or a whole-word FDE", () => {
    expect(matched.length).toBeGreaterThan(0);
    for (const j of matched) {
      const forward = /forward[\s\-_–—]+deployed/i.test(j.title);
      const fdeWord = /(?<![A-Za-z0-9])FDE(?![A-Za-z0-9])/.test(j.title);
      expect(forward || fdeWord, j.title).toBe(true);
    }
  });

  it("does not treat Deployed Engineer without Forward or FDE as this role", () => {
    const deployed = open.filter((j) => /\bdeployed engineer\b/i.test(j.title) && !fde.test(j.title));
    expect(deployed.length).toBeGreaterThan(0);
    for (const j of deployed) {
      expect(j.title).not.toMatch(/forward[\s\-_–—]+deployed/i);
      expect(j.title).not.toMatch(/(?<![A-Za-z0-9])FDE(?![A-Za-z0-9])/);
    }
  });
});
