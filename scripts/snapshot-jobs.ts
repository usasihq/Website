/**
 * Cheap hiring-index write: count open jobs in data/jobs/current.json by
 * employer and U.S. state, upsert this ISO week, exit. No network. Used as
 * its own workflow step so a slow later source cannot skip the snapshot.
 */
import { recordHiringIndex } from "../lib/jobs/hiring-index";

const at = process.env.USASI_BUILD_AT ?? new Date().toISOString();
const week = recordHiringIndex(at);
if (!week) {
  console.log("jobs: hiring-index: no current.json yet; skipped");
  process.exit(0);
}
console.log(
  `jobs: hiring-index: week ${week.week_start} · ${week.open_count} open listings · ${week.companies.length} employers · ${week.states.length} states`,
);
