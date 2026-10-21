import { describe, expect, it } from "vitest";
import { isDataCenterJob, isEntryLevelJob, isExpressionOfInterest, isInternshipJob, isNonProgrammingTitle, isSummer2027Internship, jobTrack, mainTitle } from "@/lib/jobs/tracks";

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

  it("internships match intern titles or employment type, and summer-2027 needs 2027 in the title", () => {
    expect(isInternshipJob(job("Research Intern, Inference"))).toBe(true);
    expect(isInternshipJob(job("Software Engineer", null, "internship"))).toBe(true);
    expect(isInternshipJob(job("Software Engineer, New Grad"))).toBe(false);
    expect(inTrack("internships", job("Summer 2027 Intern"))).toBe(true);
    expect(isSummer2027Internship(job("Summer 2027 Intern"))).toBe(true);
    expect(isSummer2027Internship(job("Research Intern"))).toBe(false);
    expect(inTrack("summer-2027", job("Fall 2027 Internship"))).toBe(true);
  });

  it("flags expressions of interest from the title only", () => {
    expect(isExpressionOfInterest("Talent Community (General Application)")).toBe(true);
    expect(isExpressionOfInterest("[Expression of Interest] Research Manager")).toBe(true);
    expect(isExpressionOfInterest("Research Manager")).toBe(false);
  });
});

const t = (title: string, department: string | null = null, team: string | null = null, employment_type = "full-time") => ({ title, department, team, employment_type });

describe("jobs that don't require programming", () => {
  it.each([
    "Enterprise Account Executive",
    "Technical Recruiter, Engineering",
    "Engineering Program Manager",
    "Technical Program Manager, Infrastructure",
    "Product Marketing Manager, Developer Platform",
    "Product Designer, Claude Developer Platform",
    "Associate General Counsel, Privacy Compliance",
    "Senior Manager, Infrastructure Lease Accounting",
    "Data Center Technician - Dalton, GA",
    "Journeyman Electrician",
    "Customer Success Manager, Public Sector",
    "Head of Policy Design, Societal Harms",
    "Senior Manager, Marketing Research & Intelligence",
    "Accounts Payable Specialist",
  ])("includes %s", (title) => expect(isNonProgrammingTitle(title)).toBe(true));

  it.each([
    "Infrastructure Software Engineer",
    "Senior Software Engineer, Marketing Platform",
    "Engineering Manager, Data Infrastructure",
    "Solutions Engineer",
    "Enterprise Sales Engineer",
    "Member of Technical Staff, Early Career",
    "Research Scientist, Interpretability",
    "Applied AI Architect, Partnerships",
    "Machine Learning Fellow - Human Frontier Collective",
    "Data Analyst, User Operations",
    "Young Investigator, Climate Modeling",
    "Tech Lead, Deployment & Operations — Custom Infrastructure",
    "Developer Advocate",
    "Research Lead, Policy Communications",
  ])("leaves out %s", (title) => expect(isNonProgrammingTitle(title)).toBe(false));
});

describe("data-center and infrastructure jobs", () => {
  it.each([
    t("Data Center Technician - Quincy, WA"),
    t("Critical Facilities Technician"),
    t("Construction Manager - MEP"),
    t("Staff Commissioning Engineer, Electrical"),
    t("Senior GPU Capacity Planner"),
    t("Global Category Manager, Fiber"),
    t("Medium Voltage Electrician (Service & Repair)"),
    t("Program Lead", "Data Center Business"),
    t("Project Manager", "Data Center Operations (DIG)", "Data Center Program Management (DIG)"),
    t("Enterprise Account Executive, Data Center Solutions"),
  ])("includes %o", (job) => expect(isDataCenterJob(job)).toBe(true));

  it.each([
    t("Infrastructure Software Engineer"),
    t("Staff Infrastructure Engineer, Cluster Infrastructure"),
    t("Site Reliability Engineer"),
    t("Policy Manager, Washington DC"),
    t("Enterprise Account Executive, Energy & Utilities"),
    t("Account Executive, Construction"),
    t("Power Integrity Engineer"),
    t("Senior Electrical Engineer - Power"),
    t("AI Deployment Manager - Japan"),
    t("Staff Product Manager - Billing", "Data Center Business", "Product Management"),
  ])("leaves out %o", (job) => expect(isDataCenterJob(job)).toBe(false));
});

describe("entry-level jobs", () => {
  it.each([
    t("Software Engineer, New Grad"),
    t("Research Intern, Inference (Summer 2027)"),
    t("Anything at all", null, null, "internship"),
    t("Associate Product Manager"),
    t("Account Associate - EMEA"),
    t("Associate Construction Engineer - Power Infrastructure"),
    t("Technical Recruiter (Entry Level)"),
    t("Member of Technical Staff, Early Career"),
    t("Anthropic Fellows Program, AI Safety & Security"),
    t("Base Labs Fellowship"),
    t("AI Residency Program"),
    t("Mechanical Engineer I"),
    t("Sales Development Representative - New York"),
    t("Spring 2027 Business Operations Internship/Co-op"),
    t("CoDesign & NextGen - New College Grad"),
  ])("includes %o", (job) => expect(isEntryLevelJob(job)).toBe(true));

  it.each([
    t("Associate General Counsel, Product & Regulatory"),
    t("Associate Director, Partnerships"),
    t("Senior Associate, SEC Reporting & Technical Accounting"),
    t("Research Associate II, Horns Lab"),
    t("Corporate Development Associate"),
    t("Senior Early Career Recruiter"),
    t("University Recruiter", "Operations", "Recruiting"),
    t("Campus Program Recruiter"),
    t("Internal Communications Manager, Tech"),
    t("Head of Internal Audit"),
    t("Director, US International Tax"),
    t("Resident Solutions Architect"),
    t("Technical Fellow"),
    t("Medical Fellow - Human Frontier Collective (US)"),
    t("Robotics Software Engineer I/II"),
    t("Commissioning Engineer II"),
    t("Manager, BDR - SAARC"),
    t("Sales Development Manager, Enterprise (AMER)"),
    t("Junior/Senior/Staff Software Engineer, Inference"),
  ])("leaves out %o", (job) => expect(isEntryLevelJob(job)).toBe(false));
});

describe("title parts", () => {
  it("separates the main title from its qualifiers", () => {
    expect(mainTitle("Technical Recruiter, Engineering")).toBe("Technical Recruiter");
    expect(mainTitle("Manager, Data Center Operations Accounting")).toBe("Manager Data Center Operations Accounting");
    expect(mainTitle("Deployed Engineer (Early Career- SF)")).toBe("Deployed Engineer");
  });
  it("recognizes the employer's own expression-of-interest wording", () => {
    expect(isExpressionOfInterest("Data Center Technician – Express Your Interest")).toBe(true);
  });
});
