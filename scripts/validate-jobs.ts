import { loadCatalog } from "../lib/catalog";
import { readJobs } from "../lib/jobs/load";
const data = readJobs(loadCatalog().organizations);
console.log(`jobs: ${data.jobs.length} validated records, ${data.feeds.length} sources`);
