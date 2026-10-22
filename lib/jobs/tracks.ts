/**
 * Job tracks: curated views into the same employer-sourced listings, for
 * readers who are not AI engineers. Each track is a transparent rule over the
 * job title (and the department or team where the employer supplies one); the
 * rule is shown on the page so nothing is hidden or inferred. The Jobs landing
 * pages (/jobs/no-programming/, /jobs/data-center-infrastructure/,
 * /jobs/entry-level/, /jobs/internships/, /jobs/fellowships/) use these same
 * rules, so their "see all" links to /jobs/?track=… show exactly the same listings.
 */
export type TrackJob = { title: string; department: string | null; team?: string | null; employment_type: string };

export type JobTrack = {
  id: string;
  title: string;
  description: string;
  /** Plain description of the matching rule, shown to readers. */
  rule: string;
  test: (job: TrackJob) => boolean;
};

/* ------------------------------------------------------------------ */
/* Work that does not list programming as the core of the job           */
/* ------------------------------------------------------------------ */

/** Titles that name a technical role outright. */
const TECHNICAL_ROLE =
  /\b(engineers?|developers?(?!\s+(platform|experience|marketing|relations|tools?|productivity|velocity|ecosystem|programs?|community|advocacy|success|portal|products?|education))|programmers?|scientists?|researchers?|architects?|member of (the )?technical staff|mts|swe|sde|hackers?|builders?|tech leads?|(young|predoctoral) investigators?)\b/i;
/** Technical work named in the main part of a title ("Software …", "Machine Learning …", "Engineering Manager"). */
const TECHNICAL_FIELD =
  /\b(software|sw|engineering|machine learning|ml|deep learning|applied ai|architecture|data science|data analyst|data analytics|analytics|devops|sre|site reliability|firmware|embedded|full[- ]?stack|front[- ]?end|back[- ]?end|kernels?|compilers?|cuda|gpu programming|rtl|asic|fpga|verification|silicon|physical design|dft|dv|pd|technical staff|coding|programming|inference|post-training|pre-training|interpretability|alignment|hardware)\b|(?<!\b(marketing|market|policy|user|ux|customer|competitive) )\bresearch\b/i;
/** Functions that are not programming work. */
const FUNCTION_WORDS = [
  "sales", "account (executive|manager|director|associate|lead|strategist|partner)s?", "business development", "partnerships?",
  "partner (manager|success|marketing|development|operations)", "alliances?", "channel", "go[- ]to[- ]market", "gtm", "revenue",
  "deal desk", "pricing", "marketing", "marketer", "brand", "content", "social media", "events?", "community", "communications", "comms",
  "public relations", "pr", "media relations", "editor(ial)?", "writer", "copywriter", "creative", "policy", "government",
  "global affairs", "external affairs", "public affairs", "regulatory", "legal", "counsel", "attorney", "lawyer", "paralegal",
  "compliance", "enforcement", "contracts?", "trust (and|&) safety", "investigat\\w*", "audit\\w*", "finance", "financial", "fp&a", "accounting",
  "accountant", "accounts? (payable|receivable)", "account management", "bd", "controller", "controllership", "tax", "treasury", "payroll", "procurement", "purchasing", "sourcing", "buyer",
  "investor relations", "corporate development", "capital markets", "recruit\\w*", "sourcer", "talent", "people", "hr", "hrbp",
  "human resources", "benefits", "compensation", "total rewards", "learning (and|&) development", "employee \\w+", "workplace",
  "office", "executive assistant", "executive business partner", "assistant", "administrat\\w*", "receptionist", "facilities",
  "facility", "real estate", "operations", "ops", "chief of staff", "strategy", "strategist", "program manager", "project manager",
  "program management", "project management", "product manager", "product management", "product marketing", "designer", "design",
  "customer \\w+", "client \\w+", "support", "success", "implementation", "onboarding", "enablement", "consultant", "technician",
  "electrician", "construction", "inspector", "planner", "planning", "logistics", "supply chain", "warehouse", "inventory",
  "coordinator", "health (and|&) safety", "hse", "ehs", "security officer", "physical security", "corporate security",
];
const FUNCTION = new RegExp(`\\b(${FUNCTION_WORDS.join("|")})\\b`, "i");
/** The main part of a title ends with a non-programming function ("Engineering Recruiter", "Developer Marketing Manager"). */
const ENDS_WITH_FUNCTION = new RegExp(
  `\\b(${FUNCTION_WORDS.join("|")})( (manager|lead|director|head|specialist|partner|coordinator|associate|executive|representative|analyst|officer|intern|internship|i|ii|iii|iv))*$`,
  "i",
);
const GENERIC_ROLE = /^(senior |sr\.? |staff |principal |lead |global |regional |area |group |managing |associate |vice president|vp|svp|evp|head|director|manager|lead|chief|\s)+$/i;

/** The part of a title before its first qualifier: "Technical Recruiter, Engineering" → "Technical Recruiter". */
export function mainTitle(title: string): string {
  const parts = title.split(/\s*(?:,|\s[-–—|:]\s|\(|\[|\])\s*/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return title;
  // "Manager, Data Center Operations Accounting": a bare seniority word takes the next part with it.
  return GENERIC_ROLE.test(parts[0]) && parts[1] ? `${parts[0]} ${parts[1]}` : parts[0];
}

/** True when a title names a non-programming function and no programming role. */
export function isNonProgrammingTitle(title: string): boolean {
  if (TECHNICAL_ROLE.test(title)) return false;
  const main = mainTitle(title).replace(/[^\p{L}\p{N}&+ ]+/gu, " ").replace(/\s+/g, " ").trim();
  if (TECHNICAL_FIELD.test(main) && !ENDS_WITH_FUNCTION.test(main)) return false;
  return FUNCTION.test(title);
}

/* ------------------------------------------------------------------ */
/* Data centers and physical computing infrastructure                   */
/* ------------------------------------------------------------------ */

const DATA_CENTER = new RegExp(
  `\\b(${[
    "data ?cent(er|re)s?", "datacent(er|re)s?", "dc (construction|operations|ops|infrastructure|design)", "critical (facility|facilities|environments?)",
    "mission[- ]critical", "colocation", "powered land", "substations?", "switchgear", "power (distribution|infrastructure|systems?|production|generation|plants?|procurement|delivery|and cooling|& cooling)",
    "transmission (and|&) distribution", "(low|medium|high)[- ]voltage", "electrical (infrastructure|maintenance)", "physical infrastructure", "facilities maintenance", "facility operations",
    "energy (market|scheduling|procurement|development|infrastructure|portfolio|and infrastructure|& infrastructure)", "utility contracts", "grid interconnection",
    "liquid cooling", "cooling", "hvac", "mep", "commissioning", "building controls", "construction", "electricians?", "racks", "rack (power|design|integration|infrastructure|systems?|deployment)",
    "server (lifecycle|fleet|infrastructure)", "fleet (operations|delivery|engineering)", "capacity (delivery|planning|planner|deployment|manager|management|strategy)",
    "gpu capacity", "site (selection|acquisition|development|operations)", "digital infrastructure", "facilities (engineer|engineering|technician|technical|operations|manager)",
    "network deployment", "fiber",
  ].join("|")})\\b`,
  "i",
);
/** Selling to an industry is not working in it: "Account Executive, Construction", "Energy & Utilities Sales". */
const INDUSTRY_SALES = /\b(account (executive|manager|director)|sales|business development)\b.*\b(construction|energy|utilities)\b|\b(construction|energy|utilities)\b.*\b(sales|account (executive|manager|director))\b/i;

export function isDataCenterJob(j: TrackJob): boolean {
  if (DATA_CENTER.test(j.title)) return !(INDUSTRY_SALES.test(j.title) && !/data ?cent|datacent/i.test(j.title));
  // The most specific grouping the employer gives: a department can be company-wide ("Data Center Business" for every role).
  const group = j.team || j.department;
  return Boolean(group && DATA_CENTER.test(group));
}

/* ------------------------------------------------------------------ */
/* Entry level                                                          */
/* ------------------------------------------------------------------ */

const INTERN = /\bintern(s|ship|ships)?\b/i;
/** Program names that also appear in recruiter titles ("University Recruiter"), so they don't count for recruiting roles. */
const PROGRAM =
  /\b((new|recent|college|new college|university|mba|phd) grad(uate)?s?|graduate (program|programme|scheme|rotation)|early[- ]career|apprentice(ship)?s?|residency|(ai|ml|research) residents?|fellowships?|fellows program|co-?op|students?|trainees?|campus|university)\b/i;
const ENTRY_WORDS = /\b(entry[- ]level|junior|jr\.?)\b/i;
const DEVELOPMENT_REP = /\b(sales|business) development representatives?\b|\b(sdr|bdr)\b/i;
/** "Associate" only where it names an entry-level rung: "Associate Product Manager", "Account Associate" — never "Associate General Counsel". */
const ASSOCIATE_ENTRY =
  /\bassociate ((software|hardware|construction|solutions|data|product|technical|program|project|field|systems|network|mechanical|electrical) )?(engineer|product manager|program manager|project manager|designer|account executive|consultant|recruiter|analyst)\b|\b(account|sales|operations|support|customer success|customer support|recruiting|people|marketing) associate\b/i;
/** Level I ("Mechanical Engineer I"), not "I/II" or "II". */
const LEVEL_ONE = /\b(?:engineer|technician|analyst|specialist|associate|developer|scientist|accountant|coordinator|representative|planner|designer|recruiter) (I)\b(?![/I])/i;
const isLevelOne = (title: string) => LEVEL_ONE.exec(title)?.[1] === "I";
const SENIOR = /\b(senior|sr\.?|staff|principal|lead|leader|manager|director|head|vp|vice president|chief|executive|distinguished|technical fellow|ii|iii|iv)\b/i;
const RECRUITING = /\b(recruit\w*|sourcer|talent|university relations|programs? (manager|lead|coordinator|partner|specialist))\b/i;
const PROGRAM_TEAM = /\b(early[- ]career|new grads?|interns?|internships?|emerging talent|campus)\b/i;

/** Internship by the employer's employment type or a whole-word “intern” in the title. */
export function isInternshipJob(j: TrackJob): boolean {
  return j.employment_type === "internship" || INTERN.test(j.title);
}

/** Internship listings whose title names 2027 (typically “Summer 2027 Intern”). */
export function isSummer2027Internship(j: TrackJob): boolean {
  return isInternshipJob(j) && /\b2027\b/.test(j.title);
}

/* ------------------------------------------------------------------ */
/* Fellowships and postdocs                                             */
/* ------------------------------------------------------------------ */

/** Program names: “fellowship”, “fellows program”, “postdoc”, “postdoctoral”. */
const FELLOWSHIP_PROGRAM =
  /\b(fellowships?|fellows program|post[- ]?docs?|post[- ]?doctoral)\b/i;
/** “Fellow” / “Fellows” as a role word, not a fragment of another word. */
const FELLOW_WORD = /\bfellows?\b/i;
/** Senior honorifics and lab-rank titles that are not application-season fellow roles. */
const FELLOW_HONORIFIC =
  /\b(technical|distinguished|corporate|principal|staff|senior|ibm|microsoft) fellows?\b/i;
/** Titles that hire for or administer a fellowship rather than being one. */
const FELLOWSHIP_ADMIN =
  /\b(recruit\w*|sourcer|talent|university relations|programs? (manager|lead|coordinator|partner|specialist)|coordinator)\b/i;

/**
 * A fellowship, fellows program, fellow role, or postdoc, from the employer’s
 * title only. Honorifics such as “Technical Fellow” and recruiter titles are
 * left out so a stray “Fellow” in an unrelated title does not match.
 */
export function isFellowshipJob(j: TrackJob): boolean {
  if (FELLOWSHIP_ADMIN.test(j.title)) return false;
  if (FELLOWSHIP_PROGRAM.test(j.title)) return true;
  return FELLOW_WORD.test(j.title) && !FELLOW_HONORIFIC.test(j.title);
}

export function isEntryLevelJob(j: TrackJob): boolean {
  if (isInternshipJob(j)) return true;
  const recruiting = RECRUITING.test(j.title);
  const associate = ASSOCIATE_ENTRY.exec(j.title)?.[0];
  const signal =
    (PROGRAM.test(j.title) && !recruiting) ||
    ENTRY_WORDS.test(j.title) ||
    DEVELOPMENT_REP.test(j.title) ||
    Boolean(associate) ||
    isLevelOne(j.title) ||
    (!recruiting && [j.department, j.team].some((v) => v !== null && v !== undefined && PROGRAM_TEAM.test(v)));
  // Seniority words rule a title out, except inside the entry-level phrase itself ("Associate Product Manager").
  const rest = (associate ? j.title.replace(associate, " ") : j.title).replace(/\bmember of (the )?technical staff\b/i, " ");
  return signal && !SENIOR.test(rest);
}

/* ------------------------------------------------------------------ */

const ENGINEERING_TITLE = /\b(engineer|engineering|scientist|researcher|developer|programmer|architect)\b/i;
const CUSTOMER_FACING =
  /\b(sales|account (executive|manager|director)|customer (success|support|experience|service|engineer)|support (specialist|engineer|agent|representative|lead|manager)|operations|solutions (consultant|architect|engineer)|partnerships?|business development|go[- ]to[- ]market|gtm|revenue|deployment strategist)\b/i;
/** Engineering titles that are customer-facing by name, kept in the customer track. */
const CUSTOMER_ENGINEERING = /\b(support|solutions|customer|sales|field|forward deployed) engineer/i;

export const NO_PROGRAMMING_RULE =
  "Titles that name a function other than programming: sales and partnerships, marketing and communications, policy and legal, finance and accounting, recruiting and people, operations, facilities and technicians, customer success and support, program, project, and product management, design, and writing. Titles that say engineer, developer, programmer, scientist, researcher, architect, or member of technical staff are left out, even where the work may involve little code. So are titles whose main part names technical work such as software, machine learning, research, hardware, or engineering, so “Infrastructure Software Engineer” and “Engineering Manager” are out, while “Technical Recruiter, Engineering” and “Engineering Program Manager” are in.";
export const DATA_CENTER_RULE =
  "Titles, or the employer-supplied team (or department, when no team is given), that name data centers, critical facilities, power distribution, generation, or power systems, low-, medium-, or high-voltage and electrical infrastructure work, energy markets and development, cooling, HVAC, MEP, commissioning, building controls, construction, electricians, facilities maintenance, physical infrastructure, racks and server fleets, capacity delivery and planning, site selection or site operations, digital infrastructure, facilities engineering, network deployment, or fiber. Software infrastructure is left out unless the title or team names one of these (so “Infrastructure Software Engineer” is not included), and so are sales roles that sell to the energy or construction industries.";
export const ENTRY_LEVEL_RULE =
  "Listings the employer marks as internships, and titles that say intern, new grad, recent or university graduate, early career, entry level, junior, apprentice, residency, fellowship or fellows program, co-op, student, trainee, campus, sales or business development representative, level I (for example “Mechanical Engineer I”), or “associate” where it names an entry rung (“Associate Product Manager”, “Account Associate”; never “Associate General Counsel” or “Associate Director”). Titles with a seniority word such as senior, staff, lead, manager, director, or II are left out unless they are internships, and recruiter titles such as “University Recruiter” are left out because they hire for early-career programs rather than being one.";
export const INTERNSHIP_RULE =
  "Listings the employer marks as internships, and titles that say intern or internship as a whole word. New-graduate, apprentice, and other early-career titles that do not say intern are on the entry-level page.";
export const SUMMER_2027_RULE =
  "Internship listings whose title names 2027 (for example “Summer 2027 Intern” or “2027 Internship”). Matching is on the title and the employer’s employment type only.";
export const FELLOWSHIP_RULE =
  "Titles that name a fellowship or fellows program, a fellow role (for example “Research Fellow”, “AI Fellow”, or “Legal Fellow”), or a postdoc or postdoctoral position, as a whole word. Senior honorifics such as Technical Fellow or Distinguished Fellow are left out, and so are recruiter, coordinator, and program-manager titles that hire for fellowships rather than being one.";

export const JOB_TRACKS: JobTrack[] = [
  {
    id: "beyond-engineering",
    title: "Work in AI without being an AI engineer",
    description: "Sales, marketing, operations, legal, finance, people, design, product, policy, and support roles at organizations in the catalog.",
    rule: NO_PROGRAMMING_RULE,
    test: (j) => isNonProgrammingTitle(j.title),
  },
  {
    id: "infrastructure",
    title: "Data-center and infrastructure careers",
    description: "Facilities, electrical, mechanical, construction, deployment, and technician roles behind the computing that AI runs on.",
    rule: DATA_CENTER_RULE,
    test: isDataCenterJob,
  },
  {
    id: "customer-and-operations",
    title: "Customer support, operations, and sales",
    description: "Roles that work with customers and keep the business running, including customer-facing technical roles.",
    rule: "Titles that mention sales, accounts, customer success or support, operations, solutions roles, partnerships, business development, go-to-market, or revenue. Engineering titles are left out unless they are customer-facing by name, such as support, solutions, or sales engineer.",
    test: (j) => CUSTOMER_FACING.test(j.title) && (!ENGINEERING_TITLE.test(j.title) || CUSTOMER_ENGINEERING.test(j.title)),
  },
  {
    id: "early-career",
    title: "Internships and early-career roles",
    description: "Internships, new-graduate roles, apprenticeships, residencies, fellowships, and other entry points.",
    rule: ENTRY_LEVEL_RULE,
    test: isEntryLevelJob,
  },
  {
    id: "internships",
    title: "Internships",
    description: "Open internships at AI companies and labs, matched on the employer’s title or employment type.",
    rule: INTERNSHIP_RULE,
    test: isInternshipJob,
  },
  {
    id: "summer-2027",
    title: "Summer 2027 internships",
    description: "Internship listings whose title names 2027.",
    rule: SUMMER_2027_RULE,
    test: isSummer2027Internship,
  },
  {
    id: "fellowships",
    title: "Fellowships and postdocs",
    description: "Open fellowships, fellows programs, and postdoctoral roles at AI companies and labs, matched on the employer’s title.",
    rule: FELLOWSHIP_RULE,
    test: isFellowshipJob,
  },
];

export const jobTrack = (id: string) => JOB_TRACKS.find((t) => t.id === id);

/**
 * Whether the employer's own title presents the posting as a general expression
 * of interest rather than a specific vacancy. Only the title is used.
 */
export const EXPRESSION_OF_INTEREST = /\b(general (application|interest)|expression of interest|express your interest|talent (pool|community|network)|future opportunities|don'?t see (a|the) (role|position|job)|open application)\b/i;
export const isExpressionOfInterest = (title: string) => EXPRESSION_OF_INTEREST.test(title);
