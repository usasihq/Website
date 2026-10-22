/**
 * Prints JobPosting field coverage for the current snapshot.
 * Uses stored descriptions when present; otherwise a stub so location /
 * employer / employment fields can still be scored (labelled in the output).
 */
import { loadCatalog } from "../lib/catalog";
import { coverageTable } from "../lib/jobs/job-posting-coverage";
import { jobPages, jobPostingLd, type JobPage } from "../lib/jobs/job-pages";
import { GOOGLE_EMPLOYMENT } from "../lib/jobs/employment";
import type { Description } from "../lib/jobs/description";
import path from "node:path";

const stub: Description = [{ type: "p", runs: [{ t: "The employer describes responsibilities, qualifications, and how to apply." }] }];

const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });
const pages = jobPages(catalog);
const withDesc = pages.filter((p) => p.description);
const scored = pages.map((p) => (p.description ? p : { ...p, description: stub }));
const after = coverageTable(scored);

function beforeEmployment(p: JobPage): boolean {
  return Boolean(GOOGLE_EMPLOYMENT[p.job.employment_type as keyof typeof GOOGLE_EMPLOYMENT]);
}

const qualify = scored.filter((p) => jobPostingLd(p));
const beforeEmp = qualify.filter(beforeEmployment).length;
const row = (label: string, count: number, of: number) =>
  `${label.padEnd(36)} ${String(count).padStart(5)} / ${String(of).padStart(5)}  ${of ? ((100 * count) / of).toFixed(1) : "0.0"}%`;

console.log(`pages=${pages.length} withStoredDescription=${withDesc.length} jobPosting=${after.postings} invalid=${after.invalid}`);
console.log("field                              after          (stubbed description when missing)");
for (const r of after.rows) console.log(row(r.field, r.count, r.of));
console.log(row("employmentType before (feed only)", beforeEmp, qualify.length));
console.log(row("hiringOrganization.logo before", 0, qualify.length));
