import { describe, expect, it } from "vitest";
import { inferEmploymentType, resolveEmployment } from "@/lib/jobs/employment";
import type { Job } from "@/lib/jobs/schema";

const job = (over: Partial<Job> = {}): Job =>
  ({
    id: "acme-ai:greenhouse:acme:1",
    source_job_id: "1",
    requisition_id: null,
    organization_slug: "acme-ai",
    source_type: "greenhouse",
    source_identifier: "acme",
    source_url: "https://boards-api.greenhouse.io/v1/boards/acme/jobs",
    title: "Research Engineer",
    locations: ["San Francisco, CA"],
    countries: [],
    workplace: "on-site",
    remote: false,
    employment_type: "unknown",
    department: null,
    team: null,
    salaries: [],
    official_url: "https://job-boards.greenhouse.io/acme/jobs/1",
    apply_url: null,
    posted_at: "2026-10-01T00:00:00.000Z",
    posted_date_kind: "first-published",
    first_seen: "2026-10-02T00:00:00.000Z",
    last_seen: "2026-10-14T00:00:00.000Z",
    last_successfully_checked: "2026-10-14T00:00:00.000Z",
    status: "open",
    missing_since: null,
    missing_checks: 0,
    closed_at: null,
    ...over,
  }) as Job;

describe("inferEmploymentType", () => {
  it("maps intern / internship in the title or description", () => {
    expect(inferEmploymentType("Software Engineer Intern (Summer 2027)")).toBe("internship");
    expect(inferEmploymentType("Research Intern, Inference")).toBe("internship");
    expect(inferEmploymentType("Content Creator (Intern)")).toBe("internship");
    expect(inferEmploymentType("Student researcher", "This internship runs for 12 weeks.")).toBe("internship");
    expect(inferEmploymentType("Internal tools engineer")).toBe("full-time");
    expect(inferEmploymentType("International sales manager")).toBe("full-time");
  });

  it("maps part-time from the title or description", () => {
    expect(inferEmploymentType("Data analyst (part-time)")).toBe("part-time");
    expect(inferEmploymentType("Office coordinator", "This is a part time role based in Austin.")).toBe("part-time");
  });

  it("maps contractor from explicit contract markers, not 'contract documents'", () => {
    expect(inferEmploymentType("Senior Technical Sourcer (Contract)")).toBe("contract");
    expect(inferEmploymentType("Growth Recruiter, High Volume - Contract")).toBe("contract");
    expect(inferEmploymentType("Recruiting Coordinator (Contract)")).toBe("contract");
    expect(inferEmploymentType("Program Manager - Growth Operations, Contract")).toBe("contract");
    expect(inferEmploymentType("Physical Security Design Lead and Contract Document Specialist")).toBe("full-time");
    expect(inferEmploymentType("Contractor, Site Reliability")).toBe("contract");
    expect(inferEmploymentType("Forward deployed engineer", "This is a contract position for six months.")).toBe("contract");
  });

  it("maps temporary from title or description", () => {
    expect(inferEmploymentType("Warehouse associate (Temporary)")).toBe("temporary");
    expect(inferEmploymentType("Seasonal coordinator", "This is a temporary assignment through March.")).toBe("temporary");
  });

  it("maps FULL_TIME only for an explicit mention or a standard salaried role", () => {
    expect(inferEmploymentType("Research Engineer")).toBe("full-time");
    expect(inferEmploymentType("Senior Director, AI")).toBe("full-time");
    expect(inferEmploymentType("Staff Robotics Software Engineer")).toBe("full-time");
    expect(inferEmploymentType("Accountant III")).toBe("full-time");
    expect(inferEmploymentType("Young Investigator, Robotics")).toBe("full-time");
    expect(inferEmploymentType("Customer Success")).toBe("full-time");
    expect(inferEmploymentType("Business Development Representative")).toBe("full-time");
    expect(inferEmploymentType("Product Management, Research")).toBe("full-time");
    expect(inferEmploymentType("Mystery posting")).toBeNull();
    expect(inferEmploymentType("Intelligent Robots & Systems Conference (IROS 2026)")).toBeNull();
    expect(inferEmploymentType("Join us", "We will be in touch.")).toBeNull();
    expect(inferEmploymentType("Community member", "This is a full-time role on the research team.")).toBe("full-time");
  });

  it("prefers intern / part-time / contract over a salaried-looking title", () => {
    expect(inferEmploymentType("Software Engineer Intern")).toBe("internship");
    expect(inferEmploymentType("Software Engineer (Part-Time)")).toBe("part-time");
    expect(inferEmploymentType("Software Engineer (Contract)")).toBe("contract");
  });
});

describe("resolveEmployment", () => {
  it("uses the feed value when the employer supplied one", () => {
    const r = resolveEmployment(job({ employment_type: "part-time", title: "Research Engineer" }));
    expect(r).toEqual({ type: "part-time", google: "PART_TIME", source: "feed", label: "Part-time" });
  });

  it("infers from the title when the feed is unknown", () => {
    const intern = resolveEmployment(job({ title: "Electrical Engineering Intern [Fall 2026]" }));
    expect(intern?.type).toBe("internship");
    expect(intern?.source).toBe("inferred");
    expect(intern?.google).toBe("INTERN");
    const ft = resolveEmployment(job({ title: "Staff Firmware Engineer" }));
    expect(ft).toMatchObject({ type: "full-time", source: "inferred", google: "FULL_TIME" });
  });

  it("treats a yearly salary as a salaried role when the title is otherwise unclear", () => {
    const r = resolveEmployment(
      job({
        title: "Mystery posting",
        salaries: [{ min: 180000, max: 220000, currency: "USD", period: "year", label: null, source_status: "employer-provided" }],
      }),
    );
    expect(r).toMatchObject({ type: "full-time", source: "inferred" });
  });

  it("returns null when nothing can be said without guessing", () => {
    expect(resolveEmployment(job({ title: "Opportunity", employment_type: "unknown" }))).toBeNull();
  });
});
