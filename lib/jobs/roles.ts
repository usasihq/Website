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

/**
 * A title-only role: `words` are the phrases listed in the reader-facing rule,
 * `include` the patterns that implement them, and `exclude` titles that name
 * the phrase but are another job (for example a recruiter for that role).
 */
function titleRole(slug: string, name: string, words: string, include: string[], exclude: string[] = [], excludeNote = ""): JobRole {
  return {
    slug,
    name,
    h1: `${name} jobs`,
    intro: `Open ${name} positions at AI companies and labs in the USASI catalog, matched on the employer's job title. Titles, locations, and employers are shown as the employer supplies them. Apply with the employer; USASI does not collect applications.`,
    rule: `A listing counts when its title contains ${words}.${excludeNote ? ` ${excludeNote}` : ""} Matching is on the title only, not the job description, so listings with unusual titles may be missed.`,
    include: include.map((pattern) => ({ label: pattern, pattern, flags: "i" })),
    exclude: exclude.map((pattern) => ({ label: pattern, pattern, flags: "i" })),
  };
}
const NOT_RECRUITING = String.raw`\b(recruit(er|ing)|sourcer|talent)\b`;
const NOT_MANAGEMENT = String.raw`\b(manager|director|head of|vice president|vp)\b`;

const ROLES: JobRole[] = [
  titleRole("software-engineer", "Software Engineer", "“software engineer”, “software developer”, SWE, or a full-stack, backend, frontend, mobile, iOS, or Android engineer",
    [String.raw`\bsoftware (engineer|developer|development engineer)\b`, String.raw`(?<![A-Za-z])SWE(?![A-Za-z])`, String.raw`\b(full[- ]?stack|back[- ]?end|front[- ]?end|mobile|ios|android) (software )?engineer\b`],
    [NOT_RECRUITING, NOT_MANAGEMENT], "Engineering managers, directors, and recruiters are left out."),
  titleRole("machine-learning-engineer", "Machine Learning Engineer", "“machine learning engineer”, “ML engineer”, MLE, “AI engineer”, or “applied AI/ML engineer”",
    [String.raw`\b(machine learning|ml|ai|applied (ai|ml)) engineer\b`, String.raw`(?<![A-Za-z])MLE(?![A-Za-z])`, String.raw`\bmachine learning (software|research|infrastructure|systems|platform) engineer\b`],
    [NOT_RECRUITING, NOT_MANAGEMENT], "Managers, directors, and recruiters are left out."),
  titleRole("research-scientist", "Research Scientist and Research Engineer", "“research scientist”, “research engineer”, “researcher”, or “applied, AI, or ML scientist”",
    [String.raw`\bresearch (scientist|engineer)\b`, String.raw`\bresearcher\b`, String.raw`\b(applied|ai|ml|machine learning) scientist\b`],
    [NOT_RECRUITING, String.raw`\b(director|head of|vice president|vp)\b`, String.raw`\buser research`], "Directors, recruiters, and user researchers are left out."),
  titleRole("data-scientist", "Data Scientist and Analyst", "“data scientist”, “data science”, “data analyst”, or “analytics engineer”",
    [String.raw`\bdata (scientist|science|analyst)\b`, String.raw`\banalytics engineer\b`],
    [NOT_RECRUITING, String.raw`\b(director|head of|vice president|vp)\b`], "Directors and recruiters are left out."),
  titleRole("product-manager", "Product Manager", "“product manager”, “product management”, or “product lead”",
    [String.raw`\bproduct (manager|management|lead)\b`],
    [NOT_RECRUITING, String.raw`\bproduct marketing\b`], "Product marketing and recruiting roles are left out."),
  titleRole("technical-program-manager", "Technical Program Manager", "“technical program manager”, TPM, or “program manager”",
    [String.raw`\b(technical )?program manag(er|ement)\b`, String.raw`(?<![A-Za-z])TPM(?![A-Za-z])`],
    [NOT_RECRUITING], "Recruiting roles are left out."),
  titleRole("solutions-engineer", "Solutions Engineer and Architect", "“solutions engineer”, “solutions architect”, “sales engineer”, or “customer engineer”",
    [String.raw`\bsolutions? (engineer|architect|consultant)\b`, String.raw`\b(sales|customer|pre-?sales) engineer\b`],
    [NOT_RECRUITING, String.raw`\b(director|head of|vice president|vp)\b`], "Directors and recruiters are left out."),
  titleRole("account-executive", "Account Executive", "“account executive”, AE, or “account director”",
    [String.raw`\baccount (executive|director)\b`, String.raw`(?<![A-Za-z])AE(?![A-Za-z])`],
    [NOT_RECRUITING], "Recruiting roles are left out."),
  titleRole("security-engineer", "Security Engineer", "“security engineer”, “security researcher”, “application security”, “offensive security”, or “detection engineer”",
    [String.raw`\bsecurity (engineer|researcher|architect|analyst)\b`, String.raw`\b(application|offensive|product|cloud|infrastructure|network) security\b`, String.raw`\bdetection (and response )?engineer\b`, String.raw`\b(appsec|red team)\b`],
    [NOT_RECRUITING, String.raw`\b(director|head of|vice president|vp)\b`], "Directors and recruiters are left out."),
  titleRole("infrastructure-engineer", "Infrastructure, SRE, and DevOps Engineer", "“site reliability”, SRE, DevOps, or an infrastructure, platform, production, or systems engineer",
    [String.raw`\bsite reliability\b`, String.raw`(?<![A-Za-z])SRE(?![A-Za-z])`, String.raw`\bdevops\b`, String.raw`\b(infrastructure|platform|production|systems|cloud|network(ing)?) engineer\b`],
    [NOT_RECRUITING, NOT_MANAGEMENT], "Managers, directors, and recruiters are left out."),
  titleRole("hardware-engineer", "Hardware and Silicon Engineer", "“hardware engineer”, ASIC, silicon, RTL, FPGA, “physical design”, “design verification”, or an analog, electrical, or firmware engineer",
    [String.raw`\bhardware (engineer|design)\b`, String.raw`\b(asic|silicon|rtl|fpga|soc)\b`, String.raw`\b(physical design|design verification|verification engineer)\b`, String.raw`\b(analog|mixed-signal|electrical|firmware|embedded) (design )?engineer\b`],
    [NOT_RECRUITING, String.raw`\b(director|head of|vice president|vp)\b`], "Directors and recruiters are left out."),
  titleRole("data-center-technician", "Data Center and Facilities", "“data center”, “critical facilities”, “electrician”, or a data-center, facilities, site, or hardware technician",
    [String.raw`\bdata ?cent(er|re)\b`, String.raw`\bcritical (facilities|environment)\b`, String.raw`\belectrician\b`, String.raw`\b(facilities|site|hardware|field|network|electrical|mechanical) technician\b`],
    [NOT_RECRUITING], "Recruiting roles are left out."),
  titleRole("designer", "Product Designer", "“product designer”, “UX designer”, “UI designer”, “design engineer”, or “brand designer”",
    [String.raw`\b(product|ux|ui|visual|brand|interaction|graphic|motion|web) designer\b`, String.raw`\bdesign engineer\b`, String.raw`\buser experience\b`],
    [NOT_RECRUITING, String.raw`\b(asic|silicon|chip|physical design|mechanical|hardware)\b`], "Chip, mechanical, and hardware design roles are left out."),
  titleRole("recruiter", "Recruiter", "“recruiter”, “recruiting”, “sourcer”, or “talent acquisition”",
    [String.raw`\brecruit(er|ing)\b`, String.raw`\bsourcer\b`, String.raw`\btalent acquisition\b`]),
];

/** Shipped role pages. Add a config object here to publish another role. */
export const JOB_ROLES: CompiledJobRole[] = [FDE, ...ROLES].map(compileRole);

export const ROLE_SLUGS = JOB_ROLES.map((r) => r.slug);

export const jobRole = (slug: string) => JOB_ROLES.find((r) => r.slug === slug);
