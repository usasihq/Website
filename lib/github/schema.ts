/**
 * AI on GitHub (/github/): the most-starred open-source AI projects, from the
 * public GitHub REST search API. Only factual repository fields are stored.
 * Descriptions are third-party text and are rendered as plain text only.
 */
import { z } from "../zod";

const plain = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((v) => !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v), "Expected plain text");

const httpsUrl = z
  .string()
  .url()
  .max(400)
  .refine((v) => v.startsWith("https://"), "Expected an https URL");

/** GitHub logins and repository names: letters, digits, '-', '_', '.' */
const ghName = z.string().regex(/^[A-Za-z0-9._-]{1,100}$/, "Expected a GitHub login or repository name");

export const GithubProject = z
  .object({
    id: z.number().int().positive(),
    full_name: z.string().regex(/^[A-Za-z0-9._-]{1,100}\/[A-Za-z0-9._-]{1,100}$/),
    owner: ghName,
    owner_type: z.enum(["User", "Organization"]),
    name: ghName,
    /** Third-party text, plain only (control characters rejected; React escapes it). */
    description: z
      .string()
      .trim()
      .max(300)
      .refine((v) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v), "Expected plain text"),
    html_url: httpsUrl.refine((v) => v.startsWith("https://github.com/"), "Expected a github.com URL"),
    homepage: httpsUrl.nullable(),
    stars: z.number().int().nonnegative(),
    forks: z.number().int().nonnegative(),
    open_issues: z.number().int().nonnegative(),
    language: plain(60).min(1).nullable(),
    license_spdx: plain(80).min(1).nullable(),
    license_name: plain(120).min(1).nullable(),
    topics: z.array(z.string().regex(/^[a-z0-9][a-z0-9-]{0,49}$/)).max(20),
    created_at: z.iso.datetime(),
    pushed_at: z.iso.datetime(),
    default_branch: plain(100).min(1),
  })
  .strict();
export type GithubProject = z.infer<typeof GithubProject>;

export const GithubExclusionCounts = z.record(z.string(), z.number().int().nonnegative());

export const GithubDataset = z
  .object({
    fetched_at: z.iso.datetime({ offset: true }),
    source: z.literal("https://api.github.com/search/repositories"),
    queries: z.array(z.string().min(1)).min(1),
    min_stars: z.number().int().positive(),
    /** Unique repositories returned by the queries, before filtering. */
    fetched_count: z.number().int().nonnegative(),
    excluded: GithubExclusionCounts,
    projects: z.array(GithubProject),
  })
  .strict();
export type GithubDataset = z.infer<typeof GithubDataset>;

export const DenylistEntry = z
  .object({
    full_name: z.string().regex(/^[A-Za-z0-9._-]{1,100}\/[A-Za-z0-9._-]{1,100}$/),
    reason: z.enum(["list", "education", "prompts", "deepfake", "non-ai", "other"]),
    note: z.string().trim().min(3).max(200),
  })
  .strict();
export const Denylist = z.object({ entries: z.array(DenylistEntry) }).strict();
export type DenylistEntry = z.infer<typeof DenylistEntry>;

/** Check ordering, uniqueness, and per-record schema. Returns problems (empty = valid). */
export function checkGithubDataset(raw: unknown): string[] {
  const parsed = GithubDataset.safeParse(raw);
  if (!parsed.success) {
    return parsed.error.issues.slice(0, 20).map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`);
  }
  const problems: string[] = [];
  const seenIds = new Set<number>();
  const seenNames = new Set<string>();
  const { projects } = parsed.data;
  projects.forEach((p, i) => {
    if (seenIds.has(p.id)) problems.push(`projects.${i}: duplicate id ${p.id}`);
    seenIds.add(p.id);
    const key = p.full_name.toLowerCase();
    if (seenNames.has(key)) problems.push(`projects.${i}: duplicate full_name ${p.full_name}`);
    seenNames.add(key);
    if (`${p.owner}/${p.name}` !== p.full_name) problems.push(`projects.${i}: full_name does not match owner/name`);
    if (p.stars < parsed.data.min_stars) problems.push(`projects.${i}: ${p.full_name} is below min_stars`);
    const prev = projects[i - 1];
    if (prev && (prev.stars < p.stars || (prev.stars === p.stars && prev.full_name.localeCompare(p.full_name) > 0))) {
      problems.push(`projects.${i}: not sorted by stars desc, then full_name`);
    }
  });
  return problems;
}

export const IncludeEntry = z
  .object({
    full_name: z.string().regex(/^[A-Za-z0-9._-]{1,100}\/[A-Za-z0-9._-]{1,100}$/),
    reason: z.string().trim().min(3).max(160),
  })
  .strict();
export const Includes = z.object({ entries: z.array(IncludeEntry) }).strict();
export type IncludeEntry = z.infer<typeof IncludeEntry>;
