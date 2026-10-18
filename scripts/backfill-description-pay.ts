/**
 * One-off: fill pay ranges stated in stored job descriptions into the current
 * snapshot (data/jobs/current.json) without a network refresh. Every later
 * `npm run jobs:refresh` does the same for each listing it reads (see
 * scripts/refresh-jobs.ts), so this is only needed once, after the pay-text
 * change lands. Listings whose feed supplies a salary are never touched.
 *
 *   npm run jobs:backfill-pay            # writes data/jobs/current.json
 *   npm run jobs:backfill-pay -- --dry   # counts only
 */
import fs from "node:fs";
import { loadCatalog } from "../lib/catalog";
import { descriptionText } from "../lib/jobs/description";
import { readDescriptions } from "../lib/jobs/descriptions-store";
import { DATA_PATH, validateDataset } from "../lib/jobs/load";
import { withDescriptionPay } from "../lib/jobs/pay-text";

const dry = process.argv.includes("--dry");
const orgs = loadCatalog().organizations;
const state = validateDataset(JSON.parse(fs.readFileSync(DATA_PATH, "utf8")), orgs);
const descriptions = readDescriptions();
let filled = 0;
const jobs = state.jobs.map((j) => {
  if (j.status === "closed" || j.salaries.length) return j;
  const d = descriptions.get(j.id);
  const next = d ? withDescriptionPay(j, descriptionText(d)) : j;
  if (next !== j) filled++;
  return next;
});
const result = validateDataset({ ...state, jobs }, orgs);
const open = result.jobs.filter((j) => j.status === "open");
const paid = open.filter((j) => j.salaries.length).length;
console.log(`jobs: pay from the description filled for ${filled} postings; ${paid} of ${open.length} open postings now show pay (${((paid / open.length) * 100).toFixed(1)}%).`);
if (!dry) {
  fs.writeFileSync(`${DATA_PATH}.tmp`, JSON.stringify(result) + "\n");
  fs.renameSync(`${DATA_PATH}.tmp`, DATA_PATH);
  console.log(`jobs: wrote ${DATA_PATH}`);
}
