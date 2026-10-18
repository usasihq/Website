import { loadCatalog } from "../lib/catalog";
import { HIRING_INDEX_PATH, readHiringIndex } from "../lib/jobs/hiring-index";
import { readJobs } from "../lib/jobs/load";
import fs from "node:fs";
const data = readJobs(loadCatalog().organizations);
console.log(`jobs: ${data.jobs.length} validated records, ${data.feeds.length} sources`);
if (fs.existsSync(HIRING_INDEX_PATH)) {
  const index = readHiringIndex();
  const week = index.weeks.at(-1);
  console.log(`jobs: hiring-index ${index.weeks.length} week(s)${week ? `, latest ${week.week_start} (${week.open_count} open)` : ""}`);
}
