/**
 * Employment type for job pages and schema.org JobPosting.
 *
 * The feed value is used when the employer supplied one. Otherwise the title
 * and description are scanned with conservative whole-word rules. FULL_TIME is
 * inferred only when the posting is clearly a standard salaried role — never
 * as a default for leftover listings.
 */
import { descriptionText, type Description } from "./description";
import type { Job } from "./schema";

export const KNOWN_EMPLOYMENT = ["full-time", "part-time", "contract", "temporary", "internship"] as const;
export type KnownEmployment = (typeof KNOWN_EMPLOYMENT)[number];

export const EMPLOYMENT_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  temporary: "Temporary",
  internship: "Internship",
  unknown: "Not stated",
};

/** Google JobPosting employmentType values (case-sensitive). */
export const GOOGLE_EMPLOYMENT: Record<KnownEmployment, string> = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  contract: "CONTRACTOR",
  temporary: "TEMPORARY",
  internship: "INTERN",
};

export type EmploymentResolution = {
  type: KnownEmployment;
  google: string;
  source: "feed" | "inferred";
  label: string;
};

const INTERN = /\bintern(?:s|ship|ships)?\b/i;
const PART_TIME = /\bpart[-\s]?time\b/i;
/** "(Contract)", trailing "Contract", or the word "contractor" — not "contract documents". */
const TITLE_CONTRACT =
  /\(\s*contract(?:or|ing|ed)?\s*\)|\bcontractors?\b|[-–—|:]\s*contract(?:or|ing)?\s*$|,\s*contract(?:or|ing)?\s*$/i;
const DESC_CONTRACT =
  /\b(?:this is a |as a )?(?:contract(?:or|ing)?|freelance(?:r)?s?)\s+(?:position|role|job|engagement|assignment|basis|employment)\b|\b(?:position|role|job) is (?:a )?(?:contract|freelance)\b|\bcontractors?\b|\bfreelance(?:r|rs)?\b/i;
const TITLE_TEMPORARY =
  /\(\s*temp(?:orary)?\s*\)|\btemporar(?:y|ily)\b|[-–—|:]\s*temp(?:orary)?\s*$|,\s*temp(?:orary)?\s*$/i;
const DESC_TEMPORARY =
  /\btemporar(?:y|ily)\s+(?:position|role|job|assignment|employment|worker|staff|basis)\b|\btemp(?:orary)?[-\s](?:role|position|job|assignment|employment|worker|staff)\b/i;
const EXPLICIT_FULL = /\bfull[-\s]?time\b|\bpermanent (?:position|role|job|employee|employment)\b/i;
/** Common salaried role nouns. Used only after intern / part-time / contract / temporary are ruled out. */
const SALARIED_ROLE =
  /\b(engineers?|engineering|scientists?|researchers?|managers?|directors?|analysts?|specialists?|designers?|operators?|recruiters?|accountants?|accounting|technicians?|coordinators?|officers?|counsels?|attorneys?|lawyers?|developers?|programmers?|architects?|planners?|planning|buyers?|controllers?|writers?|editors?|producers?|associates?|executives?|presidents?|chiefs?|fellows?|consultants?|advis(?:or|er)s?|strategists?|marketers?|mechanics?|electricians?|inspectors?|partners?|heads?|leads?|sourcers?|vice[-\s]?presidents?|vp|program managers?|product managers?|project managers?|account executives?|data scientists?|research scientists?|investigators?|administrators?|representatives?|economists?|advocates?|customer success|business development|product management|program management|project management)\b/i;

function haystack(title: string, description: string): string {
  return `${title}\n${description}`;
}

/**
 * Infer an employment type from the employer's title and description text.
 * Returns null when nothing can be said without guessing.
 */
export function inferEmploymentType(title: string, description = ""): KnownEmployment | null {
  const t = title.trim();
  const d = description.trim();
  const both = haystack(t, d);
  if (INTERN.test(both)) return "internship";
  if (PART_TIME.test(both)) return "part-time";
  if (TITLE_CONTRACT.test(t) || DESC_CONTRACT.test(d)) return "contract";
  if (TITLE_TEMPORARY.test(t) || DESC_TEMPORARY.test(d)) return "temporary";
  if (EXPLICIT_FULL.test(both)) return "full-time";
  if (SALARIED_ROLE.test(t)) return "full-time";
  return null;
}

export function feedEmployment(value: string | null | undefined): KnownEmployment | null {
  if (!value || value === "unknown") return null;
  return (KNOWN_EMPLOYMENT as readonly string[]).includes(value) ? (value as KnownEmployment) : null;
}

export function resolveEmployment(
  job: Pick<Job, "employment_type" | "title" | "salaries">,
  description?: Description | string | null,
): EmploymentResolution | null {
  const fromFeed = feedEmployment(job.employment_type);
  if (fromFeed) {
    return { type: fromFeed, google: GOOGLE_EMPLOYMENT[fromFeed], source: "feed", label: EMPLOYMENT_LABELS[fromFeed] };
  }
  const text = !description ? "" : typeof description === "string" ? description : descriptionText(description);
  let inferred = inferEmploymentType(job.title, text);
  // A stated yearly salary is a strong signal of a standard salaried role when
  // the title/description did not name another type.
  if (!inferred && job.salaries.some((s) => s.period === "year" && (s.min !== null || s.max !== null))) {
    inferred = "full-time";
  }
  if (!inferred) return null;
  return { type: inferred, google: GOOGLE_EMPLOYMENT[inferred], source: "inferred", label: EMPLOYMENT_LABELS[inferred] };
}
