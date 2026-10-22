/**
 * Google JobPosting required / recommended field coverage.
 * https://developers.google.com/search/docs/appearance/structured-data/job-posting
 */
import { GOOGLE_EMPLOYMENT } from "./employment";
import { jobPostingLd, type JobPage } from "./job-pages";

export const REQUIRED_FIELDS = ["title", "description", "datePosted", "hiringOrganization"] as const;
export const RECOMMENDED_FIELDS = [
  "employmentType",
  "identifier",
  "directApply",
  "validThrough",
  "baseSalary",
  "jobLocationType",
  "applicantLocationRequirements",
] as const;

export type FieldKey =
  | (typeof REQUIRED_FIELDS)[number]
  | (typeof RECOMMENDED_FIELDS)[number]
  | "jobLocation"
  | "hiringOrganization.logo"
  | "hiringOrganization.sameAs"
  | "hiringOrganization.url"
  | "locationEligible";

const UNIT = new Set(["HOUR", "DAY", "WEEK", "MONTH", "YEAR"]);
const EMPLOYMENT = new Set(Object.values(GOOGLE_EMPLOYMENT));

function hiringOrg(ld: Record<string, unknown>): Record<string, unknown> | null {
  const h = ld.hiringOrganization;
  return h && typeof h === "object" && !Array.isArray(h) ? (h as Record<string, unknown>) : null;
}

/** Errors that would fail Google's required JobPosting checks. */
export function jobPostingErrors(ld: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (ld["@type"] !== "JobPosting") errors.push("@type must be JobPosting");
  if (typeof ld.title !== "string" || !ld.title.trim()) errors.push("title is required");
  if (typeof ld.description !== "string" || !ld.description.trim() || ld.description === ld.title) {
    errors.push("description is required and must not equal title");
  }
  if (typeof ld.datePosted !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(ld.datePosted)) errors.push("datePosted is required (ISO 8601)");
  const org = hiringOrg(ld);
  if (!org || typeof org.name !== "string" || !org.name.trim()) errors.push("hiringOrganization.name is required");
  const remote = ld.jobLocationType === "TELECOMMUTE";
  const hasPlace = Array.isArray(ld.jobLocation) ? ld.jobLocation.length > 0 : Boolean(ld.jobLocation);
  if (remote) {
    if (!ld.applicantLocationRequirements) errors.push("applicantLocationRequirements is required for TELECOMMUTE");
  } else if (!hasPlace) {
    errors.push("jobLocation is required unless the job is TELECOMMUTE");
  }
  if (ld.employmentType !== undefined) {
    const types = Array.isArray(ld.employmentType) ? ld.employmentType : [ld.employmentType];
    if (types.some((t) => typeof t !== "string" || !EMPLOYMENT.has(t))) errors.push("employmentType must be a Google value");
  }
  if (ld.baseSalary && typeof ld.baseSalary === "object") {
    const salary = ld.baseSalary as { currency?: string; value?: { unitText?: string } };
    if (!salary.currency || !salary.value?.unitText || !UNIT.has(salary.value.unitText)) {
      errors.push("baseSalary must include currency and unitText");
    }
  }
  if (org?.logo && typeof org.logo === "string" && !/^https:\/\//.test(org.logo)) errors.push("hiringOrganization.logo must be an HTTPS URL");
  return errors;
}

export function fieldPresence(ld: Record<string, unknown>): Record<FieldKey, boolean> {
  const org = hiringOrg(ld);
  const hasPlace = Array.isArray(ld.jobLocation) ? ld.jobLocation.length > 0 : Boolean(ld.jobLocation);
  const remote = ld.jobLocationType === "TELECOMMUTE" && Boolean(ld.applicantLocationRequirements);
  return {
    title: typeof ld.title === "string" && Boolean(ld.title),
    description: typeof ld.description === "string" && Boolean(ld.description),
    datePosted: typeof ld.datePosted === "string" && Boolean(ld.datePosted),
    hiringOrganization: Boolean(org?.name),
    employmentType: Boolean(ld.employmentType),
    identifier: Boolean(ld.identifier),
    directApply: typeof ld.directApply === "boolean",
    validThrough: Boolean(ld.validThrough),
    baseSalary: Boolean(ld.baseSalary),
    jobLocationType: ld.jobLocationType === "TELECOMMUTE",
    applicantLocationRequirements: Boolean(ld.applicantLocationRequirements),
    jobLocation: hasPlace,
    "hiringOrganization.logo": typeof org?.logo === "string" && org.logo.startsWith("https://"),
    "hiringOrganization.sameAs": typeof org?.sameAs === "string" && org.sameAs.startsWith("https://"),
    "hiringOrganization.url": typeof org?.url === "string" && org.url.startsWith("https://"),
    locationEligible: hasPlace || remote,
  };
}

export type CoverageRow = { field: FieldKey; count: number; of: number; pct: number };

export function coverageTable(pages: JobPage[]): { postings: number; pages: number; invalid: number; rows: CoverageRow[] } {
  let postings = 0;
  let invalid = 0;
  const counts = new Map<FieldKey, number>();
  for (const p of pages) {
    const ld = jobPostingLd(p);
    if (!ld) continue;
    postings += 1;
    if (jobPostingErrors(ld).length) invalid += 1;
    const present = fieldPresence(ld);
    for (const [k, v] of Object.entries(present) as [FieldKey, boolean][]) {
      if (v) counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  const keys = Object.keys(fieldPresence({ "@type": "JobPosting" })) as FieldKey[];
  const rows = keys.map((field) => {
    const count = counts.get(field) ?? 0;
    return { field, count, of: postings, pct: postings ? Math.round((1000 * count) / postings) / 10 : 0 };
  });
  return { postings, pages: pages.length, invalid, rows };
}
