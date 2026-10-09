import { describe, expect, it } from "vitest";
import { isExpressionOfInterest, jobTrack } from "@/lib/jobs/tracks";

const job = (title: string, department: string | null = null, employment_type = "full-time") => ({ title, department, employment_type });
const inTrack = (id: string, j: ReturnType<typeof job>) => jobTrack(id)!.test(j);

describe("job tracks", () => {
  it("beyond engineering excludes engineering titles", () => {
    expect(inTrack("beyond-engineering", job("Enterprise Account Executive"))).toBe(true);
    expect(inTrack("beyond-engineering", job("Product Designer"))).toBe(true);
    expect(inTrack("beyond-engineering", job("Senior Software Engineer, Marketing Platform"))).toBe(false);
  });

  it("infrastructure uses titles and supplied departments", () => {
    expect(inTrack("infrastructure", job("Critical Facilities Technician"))).toBe(true);
    expect(inTrack("infrastructure", job("Program Lead", "Data Center Business"))).toBe(true);
    expect(inTrack("infrastructure", job("AI Deployment Manager - Japan"))).toBe(false);
  });

  it("customer track keeps customer-facing engineers only", () => {
    expect(inTrack("customer-and-operations", job("Senior Support Engineer"))).toBe(true);
    expect(inTrack("customer-and-operations", job("Staff Network Production Engineer, Operations"))).toBe(false);
  });

  it("early career leaves out senior titles unless they are internships", () => {
    expect(inTrack("early-career", job("Software Engineer, New Grad"))).toBe(true);
    expect(inTrack("early-career", job("Research Intern, Inference"))).toBe(true);
    expect(inTrack("early-career", job("Anything", null, "internship"))).toBe(true);
    expect(inTrack("early-career", job("Senior Early Career Recruiter"))).toBe(false);
  });

  it("flags expressions of interest from the title only", () => {
    expect(isExpressionOfInterest("Talent Community (General Application)")).toBe(true);
    expect(isExpressionOfInterest("[Expression of Interest] Research Manager")).toBe(true);
    expect(isExpressionOfInterest("Research Manager")).toBe(false);
  });
});
