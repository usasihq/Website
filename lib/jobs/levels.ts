/**
 * Experience level and job category, read from the employer's job title only.
 * Employers rarely supply either as data, so each is a documented title rule
 * (shown to readers on the Jobs page). A title that names no level is "not
 * stated", never guessed. Client-safe: the directory filters with these.
 */

export type JobLevel = "intern" | "entry" | "senior" | "staff" | "manager" | "director" | "executive" | "not-stated";

export const JOB_LEVELS: { id: Exclude<JobLevel, "not-stated">; label: string; rule: string }[] = [
  { id: "intern", label: "Internship", rule: "intern, internship, co-op, or apprentice" },
  { id: "entry", label: "Entry level & new grad", rule: "new grad, graduate, entry level, early career, junior, associate (not associate director), resident, fellow, or a level I or 1" },
  { id: "senior", label: "Senior", rule: "senior, Sr., or a level III, when no manager, staff, or higher title is named" },
  { id: "staff", label: "Staff & principal", rule: "staff, principal, distinguished, or fellow engineer or scientist, when no director or executive title is named" },
  { id: "manager", label: "Manager & lead", rule: "manager, lead, or supervisor (people or program), when no director or executive title is named" },
  { id: "director", label: "Director", rule: "director or head of" },
  { id: "executive", label: "VP & executive", rule: "vice president, VP, chief, or president" },
];

const has = (re: RegExp) => (t: string) => re.test(t);
const LEVEL_TESTS: [JobLevel, (t: string) => boolean][] = [
  ["intern", has(/\b(intern|internship|co-?op|apprentice(ship)?)\b/i)],
  ["executive", has(/\b(vice president|svp|evp|vp|chief|president)\b/i)],
  ["director", has(/\b(director|head of|head,)\b/i)],
  ["staff", has(/\b(staff|principal|distinguished)\b|\b(fellow)\b(?=.*\b(engineer|scientist|research)\b)/i)],
  ["manager", has(/\b(manager|lead|supervisor)\b/i)],
  ["senior", has(/\b(senior|sr\.?|iii)\b/i)],
  [
    "entry",
    (t) =>
      /\b(new grad(uate)?|graduate|entry[- ]level|early[- ]career|junior|jr\.?|resident|residency|university grad|campus)\b/i.test(t) ||
      (/\bassociate\b/i.test(t) && !/\bassociate (director|general counsel|vice president|partner)\b/i.test(t) && !/\b(ii|iii|iv|2|3)\b/i.test(t)) ||
      /(\s|,)(i|1)(\s*$|[\s,)-])/i.test(` ${t} `) ||
      (/\bfellow(ship)?\b/i.test(t) && !/\b(engineer|scientist)\b/i.test(t)),
  ],
];

/** The level a title names, first match in seniority order (an intern posting is never "senior"). */
export function jobLevel(title: string): JobLevel {
  for (const [level, test] of LEVEL_TESTS) if (test(title)) return level;
  return "not-stated";
}

export type JobCategory =
  | "software"
  | "ml-research"
  | "data"
  | "infrastructure"
  | "security"
  | "hardware"
  | "product"
  | "design"
  | "solutions"
  | "sales"
  | "marketing"
  | "customer"
  | "operations"
  | "people"
  | "legal-policy"
  | "finance"
  | "facilities"
  | "other";

/** Job categories in display order. The first matching rule wins, so specific ones come first. */
export const JOB_CATEGORIES: { id: Exclude<JobCategory, "other">; label: string; re: RegExp }[] = [
  { id: "facilities", label: "Data center & facilities", re: /\b(data ?cent(er|re)|facilit(y|ies)|electrician|electrical (technician|superintendent)|critical (facilities|environment)|construction|hvac|fire protection|commissioning|site (lead|operations)|technician|mechanical (technician|superintendent)|foreman)\b/i },
  { id: "data", label: "Data & analytics", re: /\b(data (engineer|scientist|analyst|science|analytics|quality|platform|infrastructure)|analytics|business intelligence|bi (engineer|analyst)|data$)\b/i },
  { id: "security", label: "Security", re: /\b(security|secops|appsec|threat|detection (and|&) response|incident response|red team|trust (and|&) safety|safeguards|privacy engineer)\b/i },
  { id: "customer", label: "Customer success & support", re: /\b(customer (success|support|experience)|(cloud |technical )?support (engineer|specialist|agent|associate)|success (manager|lead)|escalations|onboarding|help ?desk|technical support|ai success)\b/i },
  { id: "ml-research", label: "AI, ML & research", re: /\b(machine learning|ml|ai (engineer|researcher|scientist)|research (engineer|scientist|associate|manager|lead)|researcher|scientist|applied (ai|ml|scientist)|deep learning|llm|nlp|computer vision|perception|reinforcement learning|rl|post-training|pre-training|pretraining|model (behavior|training|evaluation)|alignment|interpretability|member of technical staff|mts|economist|investigator|postdoc(toral)?)\b/i },
  { id: "hardware", label: "Hardware & silicon", re: /\b(hardware|silicon|asic|chip|soc|rtl|fpga|analog|mixed-signal|physical design|verification engineer|dft|packaging|optical|photonics|pcb|firmware|embedded|mechanical engineer|electrical engineer|robotics engineer|actuator|thermal)\b/i },
  { id: "infrastructure", label: "Infrastructure & DevOps", re: /\b(infrastructure|devops|site reliability|sre|platform engineer|cloud engineer|systems engineer|network(ing)? engineer|storage|kubernetes|hpc|compute|gpu (cluster|infrastructure)|production engineer|it engineer|it support|systems administrator)\b/i },
  { id: "product", label: "Product & program management", re: /\b(product manager|product management|product lead|group product|product owner|product staff|program manager|program management|technical program|tpm|project manager|chief of staff)\b/i },
  { id: "design", label: "Design", re: /\b(design(er)?|ux|ui|user research|brand|creative|illustrat|motion)\b/i },
  { id: "solutions", label: "Solutions & forward deployed", re: /\b(solutions? (engineer|architect|consultant)|sales engineer|forward[- ]deployed|fde|customer engineer|field engineer|partner engineer|deployment (engineer|strategist|lead)|deployed (engineer|architect)|implementation|professional services|technical account manager|applied ai architect|ai architect)\b/i },
  { id: "software", label: "Software engineering", re: /\b(software|engineer|engineering|developer|frontend|front-end|backend|back-end|full[- ]stack|mobile|ios|android|web|programmer|architect)\b/i },
  { id: "sales", label: "Sales & business development", re: /\b(account (executive|director|manager)|sales|business development|bdr|sdr|partnerships?|partner (manager|director)|alliances|go[- ]to[- ]market|gtm|revenue|deal desk|channel)\b/i },
  { id: "marketing", label: "Marketing & communications", re: /\b(marketing|communications|comms|content|community|developer relations|devrel|advocate|social media|pr manager|public relations|events?|copywriter|growth)\b/i },
  { id: "people", label: "People & recruiting", re: /\b(recruit(er|ing)|sourcer|talent|people (partner|operations|team)|hrbp|human resources|hr |benefits|compensation|total rewards|learning (and|&) development|workplace|office manager|executive assistant|culture)\b/i },
  { id: "legal-policy", label: "Legal, policy & government", re: /\b(counsel|legal|attorney|lawyer|paralegal|policy|public sector|government|federal|regulatory|compliance|ethics|governance|privacy)\b/i },
  { id: "finance", label: "Finance & accounting", re: /\b(finance|financial|accounting|accountant|controller|tax|treasury|fp&a|payroll|procurement|audit|equity|investor relations|billing)\b/i },
  { id: "operations", label: "Operations & strategy", re: /\b(operations|strategy|strategic|supply chain|supply|buyer|sourcing|logistics|warehouse|real estate|corporate development|business operations|bizops|analyst|coordinator|program|manufacturing|quality)\b/i },
];

export function jobCategory(title: string): JobCategory {
  for (const c of JOB_CATEGORIES) if (c.re.test(title)) return c.id;
  return "other";
}

/**
 * The top of a disclosed U.S.-dollar annual range, or the hourly top times
 * 2,080 hours; null when no U.S.-dollar salary is supplied. Used only for
 * sorting by pay and the "pay reaches" filter, never shown as a salary.
 */
export function annualUsdTop(salaries: { currency: string; period: string; min: number | null; max: number | null }[]): number | null {
  let best: number | null = null;
  for (const s of salaries) {
    if (s.currency !== "USD") continue;
    const top = s.max ?? s.min;
    if (top === null) continue;
    const annual = s.period === "year" ? top : s.period === "hour" ? top * 2080 : s.period === "month" ? top * 12 : s.period === "week" ? top * 52 : null;
    if (annual !== null && (best === null || annual > best)) best = annual;
  }
  return best;
}

export const PAY_THRESHOLDS = ["100000", "150000", "200000", "250000", "300000"] as const;
