/**
 * U.S.-dollar pay ranges read from an employer's own job description, for
 * listings whose feed gives no salary. Many employers publish a pay range only
 * in the posting text ("The base salary range for this position is $150,000
 * to $225,000 per year", "Level 1: $125,000.00 - $160,000.00/per year").
 * Results are stored with source_status "employer-description" and always
 * shown as coming from the description. Feed salaries are never replaced.
 *
 * Only what the text states is read:
 * - A range of two dollar amounts ("$X - $Y", "$X to $Y", "$X—Y USD",
 *   "$265-310K"), with a pay word (salary, pay, hourly, compensation, wage, earnings,
 *   OTE) in the 300 characters before it, or a stated unit with a pay word
 *   right after it. Single amounts ("up to $X",
 *   "$5,000 401(k) match") are skipped.
 * - The period from the text: a unit after the range ("per year", "a year",
 *   "annually", "/yr", "per hour", "hourly", "/hr") or a period word just
 *   before it ("Annual Salary:", "Hourly Range"). A range with no stated
 *   period is read as yearly only when its lower end is at least $20,000;
 *   smaller unlabelled ranges ("Salary Range $40—$55 USD") are skipped.
 * - Other currencies are skipped: amounts in €, £, or ¥, "$" followed by
 *   CAD/AUD/SGD/…, or "CA$"/"A$"-style prefixes.
 * - Amounts in millions or billions (funding, revenue) and ranges describing
 *   spend, budgets, or deals are skipped.
 * - Sanity bounds: the upper end at least the lower and at most four times it;
 *   yearly $15,000 to $2,000,000; hourly $7 to $500.
 * - A label is kept when the text names one right before the range
 *   ("Level 1:", "Zone A:", "Zone 1 Pay Range", "For Denver based hires:") or
 *   after it ("for the SES.3 level"), and "on-target earnings" when the
 *   sentence introducing the range says so.
 * At most six ranges are kept per listing, in the order the text gives them.
 */
import { inLocationScope, type GeoJob } from "./geo";

export type TextPay = {
  min: number;
  max: number;
  currency: "USD";
  period: "year" | "hour";
  label: string | null;
  source_status: "employer-description";
};

const AMOUNT = String.raw`(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?(?:\s?([kK])(?![a-zA-Z]))?`;
// "$X - $Y", "$X—Y", "$X to $Y", "$ 265-310K", "$X USD - $Y USD"; the second "$" is optional.
const RANGE = new RegExp(
  String.raw`(?<![A-Za-z])\$\s?${AMOUNT}(?:\s?USD)?\s*(?:-|–|—|\bto\b)\s*(?:USD\s*)?\$?\s?${AMOUNT}`,
  "g",
);
const PAY_WORD = /\b(?:pay|hourly|salary|salaries|compensation|wage|wages|earnings|OTE|remuneration)\b/i;
const NOT_USD = /^\s*(?:CAD|AUD|SGD|NZD|HKD|MXN|EUR|GBP|JPY|INR|CHF|ILS|BRL|TWD|KRW|CNY)\b/;
const PREFIX_NOT_USD = /(?<![A-Za-z])(?:CA|C|A|AU|S|SG|NZ|HK|MX|R|NT)$/;
const SCALE_AFTER = /^\s*(?:USD\s*)?(?:million|billion|mn|bn|[MB](?![a-z])|MM)\b/i;
const NOT_PAY_AFTER = /^\s*(?:USD\s*)?(?:\/\s*month|per month|a month)?\s*(?:in|of)\s+(?:spend|revenue|ARR|budget|budgets|deals?|quota|funding|sales|pipeline|bookings|assets)\b/i;
const UNIT_AFTER =
  /^\s*(?:USD\s*)?(?:\+\s*)?(?:\/\s*(?:per\s+)?|per\s+|an?\s+|each\s+)?(year|yr|annum|annually|annual|hour|hr|hourly)\b\.?/i;
const LEAD_HOUR = /\b(?:hourly|per hour|an hour)\b/i;
const LEAD_YEAR = /\b(?:annual|annually|yearly|per year|a year)\b/i;
const OTE = /\b(?:on[- ]target earnings|OTE)\b/i;

const num = (whole: string, cents: string | undefined, k: string | undefined) => {
  const v = Number(whole.replace(/,/g, "")) + (cents ? Number(`0.${cents}`) : 0);
  return k ? v * 1000 : v;
};

/** The label named right before a range, or null for a generic lead-in ("Pay range:", "Annual Salary:"). */
function leadLabel(lead: string): string | null {
  const t = lead.replace(/\s+/g, " ").replace(/^\s*(?:USD|annually|hourly|per (?:year|hour)|an? (?:year|hour))\b\.?/i, "");
  const zone = /\b((?:Zone|Level|Tier|Band|Grade|Region|Step)\s+[A-Z0-9][A-Za-z0-9.]{0,5})\s+(?:Base\s+)?(?:Pay|Salary|Compensation)\s+Range\s*:?\s*$/i.exec(t);
  if (zone) return zone[1];
  const hires = /\bFor\s+([A-Z][A-Za-z.,' -]{1,40}?)\s+based hires:?\s*(?:Estimated annual salary of)?\s*$/.exec(t);
  if (hires) return hires[1];
  const colon = /(?:^|[.:;)]\s|\s{2})\s*([A-Z][A-Za-z0-9.&'’ /-]{0,40}?)\s*:\s*$/.exec(` ${t}`) ?? /^\s*([A-Z][A-Za-z0-9.&'’ /-]{0,40}?)\s*:\s*$/.exec(t);
  if (!colon) return null;
  // "US Hourly Range Materials Associate:" → "Materials Associate".
  const label = colon[1].trim().replace(/^.*\b(?:Range|Rate|Pay|Salary)\s+(?=\S)/i, "");
  if (!label || label.split(" ").length > 6 || /\b(?:pay|salary|compensation|range|rate|wage|earnings|benefits|OTE|base|annual|hourly|US|USD)\b/i.test(label)) return null;
  return label;
}

export function payFromText(text: string): TextPay[] {
  const out: TextPay[] = [];
  const seen = new Set<string>();
  let previousEnd = 0;
  for (const m of text.matchAll(RANGE)) {
    const start = m.index!;
    const rangeEnd = start + m[0].length;
    const after = text.slice(rangeEnd, rangeEnd + 80);
    const unit = UNIT_AFTER.exec(after);
    // Text since the previous range (or 160 characters), for its label and the sentence that introduces it.
    const sinceLast = text.slice(Math.max(previousEnd, start - 160), start);
    previousEnd = rangeEnd + (unit ? unit[0].length : 0);
    // A pay word before the range, or a stated unit with one right after ("…/per year Your actual level and base salary…").
    if (!PAY_WORD.test(text.slice(Math.max(0, start - 300), start)) && !(unit && PAY_WORD.test(text.slice(previousEnd, previousEnd + 100)))) continue;
    if (PREFIX_NOT_USD.test(text.slice(Math.max(0, start - 4), start))) continue;
    if (NOT_USD.test(after) || SCALE_AFTER.test(after) || NOT_PAY_AFTER.test(after)) continue;
    // "$265-310K": a K on the upper end also applies to a short lower end.
    const min = num(m[1], m[2], m[3] ?? (m[6] && Number(m[1].replace(/,/g, "")) < 1000 ? m[6] : undefined));
    const max = num(m[4], m[5], m[6]);
    const intro = (sinceLast.split(/[.!?](?:\s|$)/).at(-1) ?? "").slice(-60);
    // Period: a unit right after the range, else a period word in the sentence before it.
    let period: TextPay["period"] | null = null;
    if (unit) period = /^h/i.test(unit[1]) ? "hour" : "year";
    else if (LEAD_HOUR.test(intro)) period = "hour";
    else if (LEAD_YEAR.test(intro)) period = "year";
    else if (min >= 20000) period = "year";
    if (!period) continue;
    if (!(max >= min) || max > 4 * min) continue;
    if (period === "year" && (min < 15000 || max > 2000000)) continue;
    if (period === "hour" && (min < 7 || max > 500)) continue;
    let label = leadLabel(sinceLast);
    const level = /^\s*(?:USD\s*)?for the ([A-Za-z0-9.]{1,20}) level\b/i.exec(text.slice(previousEnd, previousEnd + 60));
    if (!label && level) label = `${level[1]} level`;
    if (OTE.test(intro)) label = label ? `${label} · on-target earnings` : "On-target earnings";
    const key = `${min}|${max}|${period}|${label ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ min: Math.round(min * 100) / 100, max: Math.round(max * 100) / 100, currency: "USD", period, label, source_status: "employer-description" });
    if (out.length >= 6) break;
  }
  return out;
}

/**
 * A listing with its description's pay filled in when the feed gives none. Listings that name
 * only places outside the United States are left alone: "$" there is often another dollar.
 */
export function withDescriptionPay<T extends GeoJob & { workplace: string; salaries: unknown[] }>(job: T, text: string): T {
  if (job.salaries.length || !text || !inLocationScope(job, "us-or-unstated")) return job;
  const pay = payFromText(text);
  return pay.length ? { ...job, salaries: pay } : job;
}
