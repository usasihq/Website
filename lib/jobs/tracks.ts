/**
 * Job tracks: curated views into the same employer-sourced listings, for
 * readers who are not AI engineers. Each track is a transparent rule over the
 * job title (and department where the employer supplies one); the rule is
 * shown on the page so nothing is hidden or inferred.
 */
export type TrackJob = { title: string; department: string | null; employment_type: string };

export type JobTrack = {
  id: string;
  title: string;
  description: string;
  /** Plain description of the matching rule, shown to readers. */
  rule: string;
  test: (job: TrackJob) => boolean;
};

const ENGINEERING_TITLE = /\b(engineer|engineering|scientist|researcher|developer|programmer|architect)\b/i;
const NON_ENGINEERING_TITLE =
  /\b(sales|account (executive|manager|director)|marketing|communications?|recruit\w*|talent|people|human resources|hr|finance|financial|accounting|accountant|controller|tax|legal|counsel|attorney|paralegal|policy|operations|program manager|project manager|product manager|designer|design|writer|editor|content|support|success|partnerships?|business development|procurement|administrative|assistant|office|workplace|events?|community|customer|analyst|strategy|compliance|trust and safety|investigator)\b/i;
const INFRASTRUCTURE =
  /\b(data ?cent(er|re)s?|datacenter|critical facilities|facilities|electrical|electrician|mechanical|hvac|construction|site (lead|manager|operations|reliability)|technician|power|energy|cooling|substation|field (service|operations|technician))\b/i;
const CUSTOMER_FACING =
  /\b(sales|account (executive|manager|director)|customer (success|support|experience|service|engineer)|support (specialist|engineer|agent|representative|lead|manager)|operations|solutions (consultant|architect|engineer)|partnerships?|business development|go[- ]to[- ]market|gtm|revenue|deployment strategist)\b/i;
/** Engineering titles that are customer-facing by name, kept in the customer track. */
const CUSTOMER_ENGINEERING = /\b(support|solutions|customer|sales|field|forward deployed) engineer/i;
const SENIOR = /\b(senior|sr\.?|staff|principal|lead|manager|director|head|vp)\b/i;
const EARLY_CAREER = /\b(intern|internship|new grad(uate)?|early[- ]career|apprentice(ship)?|residency|fellowship|university (grad|graduate|recruiting)|graduate (program|programme|scheme)|entry[- ]level|campus|co-?op)\b/i;

export const JOB_TRACKS: JobTrack[] = [
  {
    id: "beyond-engineering",
    title: "Work in AI without being an AI engineer",
    description: "Sales, marketing, operations, legal, finance, people, design, product, policy, and support roles at organizations in the catalog.",
    rule: "Titles that name a non-engineering function (for example sales, marketing, operations, legal, finance, recruiting, design, product management, policy, or support) and do not include engineer, scientist, researcher, developer, or architect.",
    test: (j) => NON_ENGINEERING_TITLE.test(j.title) && !ENGINEERING_TITLE.test(j.title),
  },
  {
    id: "infrastructure",
    title: "Data-center and infrastructure careers",
    description: "Facilities, electrical, mechanical, construction, deployment, and technician roles behind the computing that AI runs on.",
    rule: "Titles or employer-supplied departments that mention data centers, facilities, electrical, mechanical, HVAC, construction, site operations, technicians, power, energy, cooling, or field service.",
    test: (j) => INFRASTRUCTURE.test(j.title) || (j.department !== null && INFRASTRUCTURE.test(j.department)),
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
    rule: "Listings whose employer marks them as internships, or whose titles mention intern, new grad, early career, apprentice, residency, fellowship, university or campus recruiting, entry level, or co-op. Titles with a seniority word such as senior, staff, lead, or manager are left out unless they are internships.",
    test: (j) => j.employment_type === "internship" || /\bintern(ship)?\b/i.test(j.title) || (EARLY_CAREER.test(j.title) && !SENIOR.test(j.title)),
  },
];

export const jobTrack = (id: string) => JOB_TRACKS.find((t) => t.id === id);

/**
 * Whether the employer's own title presents the posting as a general expression
 * of interest rather than a specific vacancy. Only the title is used.
 */
export const EXPRESSION_OF_INTEREST = /\b(general (application|interest)|expression of interest|talent (pool|community|network)|future opportunities|don'?t see (a|the) (role|position|job)|open application)\b/i;
export const isExpressionOfInterest = (title: string) => EXPRESSION_OF_INTEREST.test(title);
