/**
 * Published editions of "The State of American AI" (content/reports/<YYYY-MM>.json)
 * and their comparison with the live catalog. Node-only (reads files, hashes
 * records); pages and scripts use it at build time.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Catalog } from "./catalog";
import { MEMORY_PAGES, memoryPageHref } from "./hardware";
import { jobsLandingData } from "./jobs/landing";
import { organizationsByState } from "./place-index";
import { stateSlug } from "./places";
import { policyHref } from "./policy";
import {
  compareFigures,
  computeFigures,
  hasChanges,
  isEdition,
  snapshotProblems,
  type FigureComparison,
  type ReportFigures,
  type ReportLinkKind,
  type ReportSnapshot,
} from "./report";
import { openHref, orgHref } from "./routes";

export const REPORTS_DIR = path.join(process.cwd(), "content", "reports");

/**
 * sha256 of everything the report reads from the catalog: published
 * organizations, Open Models & Tools records, finder configurations, policy
 * documents, and license guides. Equal digests mean equal inputs.
 */
export function catalogDigest(catalog: Catalog): string {
  const inputs = {
    organizations: catalog.organizations,
    artifacts: catalog.artifacts,
    finder: catalog.finder,
    policy: catalog.policy,
    licenses: catalog.licenses,
  };
  return crypto.createHash("sha256").update(JSON.stringify(inputs)).digest("hex");
}

export const fileDigest = (file: string) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

export function readEdition(file: string): ReportSnapshot {
  const snapshot = JSON.parse(fs.readFileSync(file, "utf8")) as ReportSnapshot;
  const expected = path.basename(file, ".json");
  const problems = snapshotProblems(snapshot);
  if (snapshot.edition !== expected) problems.push(`file name ${expected} does not match edition ${snapshot.edition}`);
  if (problems.length) throw new Error(`Report edition ${file} is inconsistent:\n  ${problems.join("\n  ")}`);
  return snapshot;
}

const cache = new Map<string, ReportSnapshot[]>();

/** Every published edition, oldest first. */
export function reportEditions(dir: string = REPORTS_DIR): ReportSnapshot[] {
  const hit = cache.get(dir);
  if (hit) return hit;
  const files = fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".json") && isEdition(f.slice(0, -5)))
        .sort()
    : [];
  const editions = files.map((f) => readEdition(path.join(dir, f)));
  cache.set(dir, editions);
  return editions;
}

export const latestEdition = (dir?: string): ReportSnapshot | undefined => reportEditions(dir).at(-1);
export const findEdition = (edition: string, dir?: string) => reportEditions(dir).find((e) => e.edition === edition);
export function previousEdition(edition: string, dir?: string): ReportSnapshot | undefined {
  const all = reportEditions(dir);
  const i = all.findIndex((e) => e.edition === edition);
  return i > 0 ? all[i - 1] : undefined;
}

const live = new WeakMap<Catalog, { figures: ReportFigures; digest: string }>();

/** The report's catalog figures computed from the live catalog (no jobs), once per catalog. */
export function liveFigures(catalog: Catalog): { figures: ReportFigures; digest: string } {
  const hit = live.get(catalog);
  if (hit) return hit;
  const result = { figures: computeFigures(catalog, null, catalog.buildAt.slice(0, 10)), digest: catalogDigest(catalog) };
  live.set(catalog, result);
  return result;
}

export type SinceEdition =
  | { status: "unchanged" }
  | { status: "edited"; comparison: FigureComparison }
  | { status: "changed"; comparison: FigureComparison };

/**
 * What has happened to the catalog since an edition's cutoff: nothing
 * ("unchanged": the same records), edits that leave every catalog figure as
 * it was ("edited"), or changed figures and records ("changed").
 */
export function sinceEdition(snapshot: ReportSnapshot, catalog: Catalog): SinceEdition {
  const { figures, digest } = liveFigures(catalog);
  if (digest === snapshot.inputs.catalog_digest) return { status: "unchanged" };
  const comparison = compareFigures(snapshot, figures);
  return hasChanges(comparison) ? { status: "changed", comparison } : { status: "edited", comparison };
}

/* ------------------------------------------------------------------ */
/* Links from an edition's rows to pages that exist in this build      */
/* ------------------------------------------------------------------ */

export type ReportHref = (link: ReportLinkKind | null, key: string) => string | null;

const KIND_FILTERS: Record<string, string> = {
  "model-family": "kind=model&level=family",
  "model-release": "kind=model&level=release",
  framework: "kind=framework",
  runtime: "kind=runtime",
  "research-stack": "kind=research-stack",
  dataset: "kind=dataset",
  eval: "kind=eval",
};

/**
 * Where a row links, resolved against this build: an edition is frozen, but a
 * page it once linked to can disappear, so a row links only to a page the site
 * builds now (and otherwise shows plain text).
 */
export function reportLinks(catalog: Catalog): ReportHref {
  const states = new Set(organizationsByState(catalog).states.map((s) => s.code));
  const licenses = new Set(catalog.licenses.map((l) => l.slug));
  const jobStates = new Map(jobsLandingData(catalog).states.map((p) => [p.state!, p.path]));
  return (link, key) => {
    switch (link) {
      case "state":
        return states.has(key) ? `/places/${stateSlug(key)}/` : null;
      case "organization":
        return catalog.isActiveOrganization(key) ? orgHref(key) : null;
      case "license":
        return licenses.has(key) ? `/licenses/${key}/` : null;
      case "memory": {
        const page = MEMORY_PAGES.find((p) => p.slug === key);
        return page ? memoryPageHref(page) : null;
      }
      case "jobs-state":
        return jobStates.get(key) ?? null;
      case "kind":
        return KIND_FILTERS[key] ? openHref(KIND_FILTERS[key]) : null;
      default:
        return null;
    }
  };
}

/** A tracked policy document's page, when it is still published. */
export const policyLink = (catalog: Catalog, slug: string) => (catalog.policy.some((d) => d.slug === slug) ? policyHref(slug) : null);
