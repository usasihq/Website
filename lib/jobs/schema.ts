import { z } from "zod";

/** No URL supplied by a feed is ever fetched. Feed endpoints are code-owned. */
export function safeJobUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return value.length <= 2048 && u.protocol === "https:" && !u.username && !u.password && !u.port &&
      /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(u.hostname) &&
      !/(^|\.)(localhost|local|internal|test|invalid)$/.test(u.hostname) && !/[\u0000-\u0020\\]/.test(value);
  } catch { return false; }
}
export const JobUrl = z.string().refine(safeJobUrl, "Expected a public HTTPS URL without credentials, port, or unsafe characters");
const text = (max = 240) => z.string().trim().min(1).max(max).refine(v => !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v), "Expected plain text");
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const instant = z.iso.datetime({ offset: true });
const identifier = z.string().regex(/^[A-Za-z0-9_-]{1,100}$/);
export const Careers = z.object({
  url: JobUrl,
  enabled: z.boolean(),
  source: z.discriminatedUnion("type", [
    z.object({ type: z.literal("greenhouse"), identifier }).strict(),
    z.object({ type: z.literal("ashby"), identifier }).strict(),
    z.object({ type: z.literal("manual"), note: text(400) }).strict(),
    z.object({ type: z.literal("unsupported"), note: text(400) }).strict(),
  ]),
  // Extra employer-owned posting hosts require an editorial change, never feed input.
  posting_hosts: z.array(z.string().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/)).max(5).default([]),
  source_ids: z.array(z.string().min(1)).min(1),
  reviewed_at: z.iso.date(),
}).strict().superRefine((c, ctx) => {
  if (c.enabled && (c.source.type === "manual" || c.source.type === "unsupported")) {
    ctx.addIssue({ code: "custom", path: ["enabled"], message: "Manual/unsupported sources cannot enable automated collection" });
  }
});
export type Careers = z.infer<typeof Careers>;
export const Salary = z.object({
  min: z.number().finite().nonnegative().nullable(), max: z.number().finite().nonnegative().nullable(),
  currency: z.string().regex(/^[A-Z]{3}$/), period: z.enum(["hour", "day", "week", "month", "year"]),
  label: text(160).nullable(), source_status: z.literal("employer-provided"),
}).strict().refine(v => (v.min !== null || v.max !== null) && (v.min === null || v.max === null || v.min <= v.max), "Invalid salary range");
export const Job = z.object({
  id: z.string().regex(/^[a-z0-9-]+:(greenhouse|ashby):[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$/),
  source_job_id: identifier, requisition_id: text(100).nullable(), organization_slug: slug,
  source_type: z.enum(["greenhouse", "ashby"]), source_identifier: identifier, source_url: JobUrl,
  title: text(), locations: z.array(text()).max(50), countries: z.array(text(100)).max(50),
  workplace: z.enum(["remote", "hybrid", "on-site", "unknown"]), remote: z.boolean().nullable(),
  employment_type: z.enum(["full-time", "part-time", "contract", "temporary", "internship", "unknown"]),
  department: text().nullable(), team: text().nullable(),
  // No inferred categories, skills, seniority or description copies.
  salaries: z.array(Salary).max(30), official_url: JobUrl, apply_url: JobUrl.nullable(),
  posted_at: instant.nullable(), posted_date_kind: z.enum(["first-published", "last-published"]).nullable(),
  first_seen: instant, last_seen: instant, last_successfully_checked: instant,
  status: z.enum(["open", "possibly_closed", "closed"]), missing_since: instant.nullable(),
  missing_checks: z.number().int().nonnegative(), closed_at: instant.nullable(),
}).strict();
export type Job = z.infer<typeof Job>;
export type NormalizedJob = Omit<Job, "first_seen" | "last_seen" | "last_successfully_checked" | "status" | "missing_since" | "missing_checks" | "closed_at">;
export const FeedHealth = z.object({
  organization_slug: slug, source_type: z.enum(["greenhouse", "ashby"]), source_identifier: identifier,
  last_attempted: instant, last_successful: instant.nullable(),
  result: z.enum(["ok", "network", "http", "rate-limited", "payload", "unsafe-url", "anomaly"]),
  consecutive_failures: z.number().int().nonnegative(), current_count: z.number().int().nonnegative(),
  // Anomaly acceptance requires the same canonical result on a later check.
  pending_digest: z.string().regex(/^[a-f0-9]{64}$/).nullable(), pending_since: instant.nullable(),
}).strict();
export type FeedHealth = z.infer<typeof FeedHealth>;
export const Dataset = z.object({ version: z.literal(1), jobs: z.array(Job).max(100000), feeds: z.array(FeedHealth).max(1000) }).strict();
export type Dataset = z.infer<typeof Dataset>;
export const EMPTY_DATASET: Dataset = { version: 1, jobs: [], feeds: [] };
