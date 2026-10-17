/**
 * Workplace type for listings whose feed leaves it unknown, from what the
 * employer states elsewhere in the posting. Only explicit sentences about the
 * role count ("This is a fully remote position", "This is a hybrid role based
 * in Austin", "three days a week in the office", "This is an onsite
 * position"); benefit lists ("hybrid work model"), duties ("hybrid events"),
 * and company slogans ("remote-first") do not. A description that states more
 * than one kind, or none, stays unknown. Each pattern was checked against
 * listings whose feed does give the workplace (October 2026).
 */
export type TextWorkplace = "remote" | "hybrid" | "on-site";

const REMOTE = [
  /\bthis is an? (?:fully |100% )remote (?:role|position|job|opportunity)\b/i,
  /\bthis (?:role|position|job) is (?:fully |100% )remote\b/i,
];
const HYBRID = [
  /\bthis is a hybrid (?:position|role|job) (?:based|located|in|out of|at)\b/i,
  /\b(?:[1-4]|one|two|three|four) days (?:a|per|each) week (?:in|at|from) (?:the |our |an? )?(?:office|hub)\b/i,
];
const ONSITE = [
  /\bthis is an? (?:fully |100% )?(?:on[- ]?site|in[- ]office|in[- ]person) (?:role|position|job)\b/i,
  /\bthis (?:role|position|job) is (?:fully |100% )?(?:on[- ]?site|in[- ]office|in[- ]person)\b/i,
  /\b(?:5|five) days (?:a|per) week (?:in|at|on) (?:the |our )?(?:office|site)\b/i,
];

export function workplaceFromText(text: string): TextWorkplace | null {
  const hits = new Set<TextWorkplace>();
  if (REMOTE.some((r) => r.test(text))) hits.add("remote");
  if (HYBRID.some((r) => r.test(text))) hits.add("hybrid");
  if (ONSITE.some((r) => r.test(text))) hits.add("on-site");
  return hits.size === 1 ? [...hits][0] : null;
}

/** Every location the employer gives is a remote one ("Remote", "Remote - US", "Remote, Canada"). */
export const allLocationsRemote = (locations: string[]) => locations.length > 0 && locations.every((l) => /\bremote\b/i.test(l));

/** Workday's own remote-type field: "Remote", "Hybrid", "Office - Flexible" (in office some days), "On-site". */
export function workplaceFromWorkdayType(value: string | null | undefined): TextWorkplace | null {
  if (!value) return null;
  if (/remote/i.test(value)) return "remote";
  if (/hybrid|flexible/i.test(value)) return "hybrid";
  if (/on[- ]?site|office/i.test(value)) return "on-site";
  return null;
}
