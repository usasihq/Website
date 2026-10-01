import { z } from "../zod";
import type { Careers, NormalizedJob, Job } from "./schema";
import { Salary } from "./schema";
import { endpoint, FeedError, postingUrl } from "./security";
const short = z.string().max(1000);
const id = z.union([z.number().int().nonnegative(), z.string().regex(/^[A-Za-z0-9_-]{1,100}$/)]);
const greenhouse = z.object({ jobs: z.array(z.object({
  id, internal_job_id: id.nullable(), title: short, absolute_url: z.string(),
  location: z.object({ name: short }).optional(), requisition_id: short.nullable().optional(),
  first_published: z.string().nullable().optional(),
  metadata: z.array(z.object({ name: short, value: z.unknown() })).nullable().optional(),
  departments: z.array(z.object({ name: short })).optional(),
})).max(20000), meta: z.object({ total: z.number().int().nonnegative() }) });
const salaryComponent = z.object({ compensationType: z.string(), interval: z.string(), currencyCode: z.string().nullable(),
  minValue: z.number().nullable(), maxValue: z.number().nullable() });
const ashby = z.object({ apiVersion: z.literal("1"), jobs: z.array(z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/).optional(), title: short, jobUrl: z.string(), applyUrl: z.string().optional(),
  isListed: z.boolean(), location: short.optional(),
  secondaryLocations: z.array(z.object({ location: short, address: z.object({ addressCountry: short.optional() }).optional() })).max(50).optional(),
  address: z.object({ postalAddress: z.object({ addressCountry: short.optional() }).optional() }).nullable().optional(),
  department: short.optional(), team: short.optional(), isRemote: z.boolean().nullable().optional(), workplaceType: short.nullable().optional(),
  employmentType: short.optional(), publishedAt: z.string().nullable().optional(),
  shouldDisplayCompensationOnJobPostings: z.boolean().optional(),
  compensation: z.object({ compensationTiers: z.array(z.object({ title: short.nullable().optional(), components: z.array(salaryComponent) })).optional() }).nullable().optional(),
})).max(20000) });
/** Feed text is displayed only as React text nodes. Strip tags, never render source HTML. */
export function plain(value: string | undefined | null): string | null {
  if (!value) return null;
  const s = value.replace(/<[^>]*>/g, " ").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
  if (s.length > 240) throw new FeedError("payload");
  return s || null;
}
function date(value?: string | null): string | null {
  if (!value) return null;
  if (!z.iso.datetime({ offset: true }).safeParse(value).success || !Number.isFinite(Date.parse(value))) throw new FeedError("payload");
  return new Date(value).toISOString();
}
const uniq = (v: Array<string | null | undefined>) => [...new Set(v.filter((x): x is string => Boolean(x)))].sort();
function base(org: string, c: Careers, sourceId: string, title: string, url: string): NormalizedJob {
  if (c.source.type !== "ashby" && c.source.type !== "greenhouse") throw new FeedError("payload");
  return { id: `${org}:${c.source.type}:${c.source.identifier}:${sourceId}`, source_job_id: sourceId,
    organization_slug: org, source_type: c.source.type, source_identifier: c.source.identifier, source_url: endpoint(c),
    title: plain(title) ?? "", official_url: postingUrl(url, c), apply_url: null, requisition_id: null,
    locations: [], countries: [], workplace: "unknown", remote: null, employment_type: "unknown", department: null,
    team: null, salaries: [], posted_at: null, posted_date_kind: null };
}
export interface JobSourceAdapter { normalize(payload: unknown, org: string, config: Careers): NormalizedJob[] }
export const adapters: Record<"greenhouse" | "ashby", JobSourceAdapter> = {
  greenhouse: { normalize(payload, org, c) {
    const data = greenhouse.parse(payload);
    if (data.jobs.length !== data.meta.total) throw new FeedError("payload");
    // Prospect/talent-pool posts have no actual internal job ID.
    return data.jobs.filter(r => r.internal_job_id !== null).map(r => {
      const j = base(org, c, String(r.id), r.title, r.absolute_url);
      const workplace = r.metadata?.find(m => m.name === "Location Type")?.value;
      const mapped = typeof workplace === "string" ? ({ "Remote": "remote", "Hybrid": "hybrid", "On-Site": "on-site", "On-site": "on-site" } as const)[workplace as "Remote"] : undefined;
      return { ...j, locations: uniq([plain(r.location?.name)]), requisition_id: plain(r.requisition_id),
        department: plain(r.departments?.map(d => d.name).join(" / ")), workplace: mapped ?? "unknown",
        remote: mapped === "remote" ? true : mapped ? false : null,
        posted_at: date(r.first_published), posted_date_kind: r.first_published ? "first-published" : null };
    });
  } },
  ashby: { normalize(payload, org, c) {
    return ashby.parse(payload).jobs.filter(r => r.isListed).map(r => {
      const url = postingUrl(r.jobUrl, c);
      const sourceId = r.id ?? new URL(url).pathname.split("/").filter(Boolean).at(-1)!;
      const j = base(org, c, sourceId, r.title, url);
      const workplace = ({ Remote: "remote", Hybrid: "hybrid", OnSite: "on-site" } as const)[r.workplaceType as "Remote"] ?? "unknown";
      const employment = ({ FullTime: "full-time", PartTime: "part-time", Contract: "contract", Temporary: "temporary", Intern: "internship" } as const)[r.employmentType as "FullTime"] ?? "unknown";
      const salaries: Job["salaries"] = [];
      if (r.shouldDisplayCompensationOnJobPostings !== false) for (const tier of r.compensation?.compensationTiers ?? []) {
        for (const s of tier.components) {
          if (s.compensationType !== "Salary") continue;
          const period = ({ "1 HOUR": "hour", "1 DAY": "day", "1 WEEK": "week", "1 MONTH": "month", "1 YEAR": "year" } as const)[s.interval as "1 YEAR"];
          if (!period || !s.currencyCode || (s.minValue === null && s.maxValue === null)) continue;
          salaries.push(Salary.parse({ min: s.minValue, max: s.maxValue, currency: s.currencyCode, period,
            label: plain(tier.title), source_status: "employer-provided" }));
        }
      }
      return { ...j, apply_url: r.applyUrl ? postingUrl(r.applyUrl, c) : null,
        locations: uniq([plain(r.location), ...(r.secondaryLocations ?? []).map(l => plain(l.location))]),
        countries: uniq([plain(r.address?.postalAddress?.addressCountry), ...(r.secondaryLocations ?? []).map(l => plain(l.address?.addressCountry))]),
        workplace, remote: r.isRemote ?? (workplace === "remote" ? true : workplace !== "unknown" ? false : null),
        employment_type: employment, department: plain(r.department), team: plain(r.team), salaries,
        posted_at: date(r.publishedAt), posted_date_kind: r.publishedAt ? "last-published" : null };
    });
  } },
};
