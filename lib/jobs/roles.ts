/**
 * Jobs by role: reusable, data-driven title matchers for pages at
 * /jobs/role/<slug>/. Each role is a config entry (slug, display name, intro,
 * include/exclude title patterns). Later roles (AI account executive, AI
 * security, AI product manager, …) are new entries here; only Forward Deployed
 * Engineer ships today.
 *
 * Matching is on the employer-supplied title only — never the description —
 * and the same test powers the landing page, the /jobs/?role= directory
 * filter, and the unit tests.
 */
export type TitlePattern = {
  /** Plain description of what this pattern matches, shown in the page rule. */
  label: string;
  /** Regular-expression source, tested against the job title. */
  pattern: string;
  /** Defaults to case-insensitive. */
  flags?: string;
};

export type JobRole = {
  slug: string;
  name: string;
  h1: string;
  intro: string;
  /** Reader-facing description of the matching rule. */
  rule: string;
  include: TitlePattern[];
  exclude: TitlePattern[];
};

export type CompiledJobRole = JobRole & {
  includeRe: RegExp[];
  excludeRe: RegExp[];
  test: (title: string) => boolean;
};

function compile(patterns: TitlePattern[]): RegExp[] {
  return patterns.map((p) => new RegExp(p.pattern, p.flags ?? "i"));
}

function compileRole(role: JobRole): CompiledJobRole {
  const includeRe = compile(role.include);
  const excludeRe = compile(role.exclude);
  return {
    ...role,
    includeRe,
    excludeRe,
    test: (title: string) => includeRe.some((re) => re.test(title)) && !excludeRe.some((re) => re.test(title)),
  };
}

/** True when `title` matches the role's include patterns and none of its excludes. */
export function titleMatchesRole(title: string, role: Pick<JobRole, "include" | "exclude">): boolean {
  const includeRe = compile(role.include);
  const excludeRe = compile(role.exclude);
  return includeRe.some((re) => re.test(title)) && !excludeRe.some((re) => re.test(title));
}

const FDE: JobRole = {
  slug: "forward-deployed-engineer",
  name: "Forward Deployed Engineer",
  h1: "Forward Deployed Engineer jobs",
  intro:
    "Open positions at AI companies and labs in the USASI catalog whose titles name Forward Deployed Engineer work: “Forward Deployed”, “Forward-Deployed”, or FDE as a whole word. Titles, locations, and employers are shown as the employer supplies them. Apply with the employer; USASI does not collect applications.",
  rule:
    "A listing counts when its title contains “Forward Deployed” or “Forward-Deployed” (a space or any usual dash between the words), or the letters FDE as a whole word, so “Forward Deployed Engineer (FDE)” and “Senior FDE” count, and “CFDE” does not. Matching is on the title only, not the job description. Titles such as “Deployed Engineer” or “Partner Deployed Engineer” that do not say Forward Deployed and do not contain a whole-word FDE are left out.",
  include: [
    {
      label: "“Forward Deployed” or “Forward-Deployed” (space or dash between the words)",
      pattern: String.raw`forward[\s\-_–—]+deployed`,
      flags: "i",
    },
    {
      label: "FDE as a whole word (not inside another acronym)",
      // Case-sensitive letters so random lowercase tokens are ignored; word boundaries
      // are alphanumeric, so “(FDE)”, “FDE,”, and “FDE - SF” match and “CFDE” does not.
      pattern: String.raw`(?<![A-Za-z0-9])FDE(?![A-Za-z0-9])`,
      flags: "",
    },
  ],
  // Reserved for later roles and for documented false positives. FDE's include
  // patterns are already specific; “Deployed Engineer” without “Forward” never matches.
  exclude: [],
};

/** Shipped role pages. Add a config object here to publish another role. */
export const JOB_ROLES: CompiledJobRole[] = [FDE].map(compileRole);

export const ROLE_SLUGS = JOB_ROLES.map((r) => r.slug);

export const jobRole = (slug: string) => JOB_ROLES.find((r) => r.slug === slug);
