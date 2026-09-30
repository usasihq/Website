import fs from "node:fs";
import path from "node:path";
import { Dataset, type Careers } from "./schema";
import type { Organization } from "../schema";
import { endpoint, postingUrl } from "./security";
import { jobSourceKey, sourceKey } from "./reconcile";
export const DATA_PATH = path.join(process.cwd(), "data/jobs/current.json");
export function validateDataset(input: unknown, organizations: Organization[]): Dataset {
  const data = Dataset.parse(input);
  const orgs = new Map(organizations.filter(o => o.publication_status === "published" && o.eligibility.status === "eligible").map(o => [o.slug, o]));
  const ids = new Set<string>(); const feeds = new Set<string>();
  const configFor = (slug: string): Careers => {
    const c = orgs.get(slug)?.careers;
    if (!c?.enabled || !["greenhouse", "ashby"].includes(c.source.type)) throw new Error(`Jobs: ${slug} is not a published eligible organization with enabled source`);
    return c;
  };
  for (const f of data.feeds) {
    const c = configFor(f.organization_slug), key = jobSourceKey(f);
    if (key !== sourceKey(f.organization_slug, c) || feeds.has(key)) throw new Error(`Jobs: duplicate or mismatched feed ${key}`);
    if (f.last_successful && Date.parse(f.last_successful) > Date.parse(f.last_attempted)) throw new Error(`Jobs: invalid feed dates ${key}`);
    const matching = data.jobs.filter(j => jobSourceKey(j) === key);
    if (f.current_count !== matching.filter(j => j.status === "open").length) throw new Error(`Jobs: inconsistent feed count ${key}`);
    if (matching.some(j => !f.last_successful || Date.parse(j.last_seen) > Date.parse(f.last_successful))) throw new Error(`Jobs: job observation after feed verification ${key}`);
    feeds.add(key);
  }
  for (const j of data.jobs) {
    const c = configFor(j.organization_slug), key = jobSourceKey(j);
    if (key !== sourceKey(j.organization_slug, c) || !feeds.has(key) || j.id !== `${key}:${j.source_job_id}` || ids.has(j.id)) throw new Error(`Jobs: duplicate or mismatched job ${j.id}`);
    if (j.source_url !== endpoint(c) || postingUrl(j.official_url, c) !== j.official_url || (j.apply_url && postingUrl(j.apply_url, c) !== j.apply_url)) throw new Error(`Jobs: invalid destination for ${j.id}`);
    if (Date.parse(j.first_seen) > Date.parse(j.last_seen) || Date.parse(j.last_seen) > Date.parse(j.last_successfully_checked)) throw new Error(`Jobs: invalid verification dates for ${j.id}`);
    if ((j.status === "open") !== (j.missing_since === null && j.missing_checks === 0) || (j.status === "closed") !== (j.closed_at !== null)) throw new Error(`Jobs: inconsistent status for ${j.id}`);
    ids.add(j.id);
  }
  return data;
}
export function readJobs(organizations: Organization[]): Dataset {
  // Missing/corrupted data is a build error, never silently interpreted as zero jobs.
  return validateDataset(JSON.parse(fs.readFileSync(DATA_PATH, "utf8")), organizations);
}
