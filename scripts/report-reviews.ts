/**
 * npm run report:reviews [-- --max-age 180]
 *
 * Lists records whose evidence review is due: last_reviewed older than
 * --max-age days (default 180), missing review dates, stale product reviews,
 * and pending eligibility decisions. Read-only: it flags editorial work and
 * never changes review dates or facts.
 */
import { readRawContent, todayIso } from "../lib/content-loader";
import { daysBetween } from "../lib/dates";
import { validateContent } from "../lib/validate";

const args = process.argv.slice(2);
const maxAge = Number(args[args.indexOf("--max-age") + 1]) || 180;
const today = todayIso();
const content = validateContent(readRawContent(), { today });

const rows: Array<{ age: number | null; type: string; slug: string; status: string; note: string }> = [];
for (const [type, list] of [
  ["organization", content.organizations],
  ["artifact", content.artifacts],
] as const) {
  for (const r of list) {
    const age = r.last_reviewed ? daysBetween(r.last_reviewed, today) : null;
    if (age === null || age > maxAge) rows.push({ age, type, slug: r.slug, status: r.publication_status, note: age === null ? "never reviewed" : `reviewed ${r.last_reviewed}` });
    if (r.eligibility.status === "pending_review") rows.push({ age, type, slug: r.slug, status: r.publication_status, note: "eligibility pending review" });
    if ("products" in r) {
      for (const p of r.products) {
        const pAge = daysBetween(p.last_reviewed, today);
        if (pAge > maxAge) rows.push({ age: pAge, type: "product", slug: `${r.slug}#${p.id}`, status: r.publication_status, note: `product reviewed ${p.last_reviewed}` });
      }
    }
  }
}

rows.sort((a, b) => (b.age ?? Infinity) - (a.age ?? Infinity));
console.log(`Review report — ${today}, threshold ${maxAge} days\n`);
if (rows.length === 0) console.log("No records are due for review.");
for (const r of rows) console.log(`${String(r.age ?? "—").padStart(5)}d  ${r.type.padEnd(12)} ${r.slug.padEnd(42)} ${r.status.padEnd(9)} ${r.note}`);
console.log(`\n${content.organizations.length + content.artifacts.length} records checked; ${rows.length} item(s) flagged.`);
