/**
 * Two derived sections for record pages:
 * - what the catalog does not know (from fields that are empty or Unknown), and
 * - related reference pages (hubs, headquarters state, explainers).
 * Both are computed from structured fields only; nothing is inferred from prose.
 */
import type { Catalog } from "./catalog";
import { EXPLAINERS } from "./learn";
import { checklistFor } from "./openness";
import { stateFromHeadquarters, stateSlug, US_STATES } from "./places";
import type { Artifact, Organization } from "./schema";

export type RelatedLink = { href: string; label: string; note: string };

export function organizationUnknowns(o: Organization, artifactCount: number): string[] {
  const out: string[] = [];
  if (!o.legal_name) out.push("Legal name: not documented in the sources reviewed for this record.");
  if (!o.founded) out.push("Founding date: not documented in the sources reviewed.");
  if (!o.headquarters) out.push("Headquarters: not documented in the sources reviewed.");
  else if (o.headquarters.country === "US" && !stateFromHeadquarters(o.headquarters.label, o.headquarters.country)) {
    out.push("Headquarters state: the documented headquarters does not name a state.");
  }
  if (!o.careers && !o.hiring_url) out.push("Official careers page: not verified by this catalog.");
  else if (o.careers && !o.careers.enabled) out.push("Job listings: automated collection is not configured; only the official careers link is shown.");
  if (o.products.length === 0) out.push("Products: none documented in this record.");
  if (!o.openness_summary) out.push("Openness: no summary has been assessed for this organization.");
  if (artifactCount === 0) out.push("Open artifacts: none from this organization are in the catalog yet.");
  return out;
}

export function artifactUnknowns(a: Artifact): string[] {
  const out: string[] = [];
  if (a.record_level === "family") return out;
  if (!a.released_at && a.record_level === "release") out.push("Release date: not documented in the sources reviewed.");
  if (a.availability.status === "unknown") out.push("Availability: unknown.");
  if (a.licenses.length === 0) out.push("License: none recorded for this entry.");
  for (const { label, item } of checklistFor(a)) if (item.status === "unknown") out.push(`${label}: unknown.`);
  return out;
}

const HUB_BY_SECTOR: Record<string, string> = { science: "science", agents: "agents", chips: "chips-and-compute", cloud: "chips-and-compute" };
const HUB_BY_ROLE: Record<string, string> = {
  "chip-designer": "chips-and-compute",
  "compute-infrastructure": "chips-and-compute",
  "cloud-provider": "chips-and-compute",
  "hardware-manufacturer": "chips-and-compute",
  "open-source-steward": "open-source-foundations",
};
const EXPLAINERS_BY_KIND: Record<string, string[]> = {
  model: ["open-weight-vs-open-source", "how-to-read-a-model-card", "training-data-disclosures", "inference-hardware"],
  runtime: ["hosted-or-local", "inference-hardware"],
  framework: ["how-the-ecosystem-fits-together", "agents-and-robotics"],
  dataset: ["training-data-disclosures"],
  eval: ["reading-evaluations"],
  "research-stack": ["open-weight-vs-open-source", "training-data-disclosures"],
};

function hubLinks(catalog: Catalog, slugs: Set<string>): RelatedLink[] {
  return [...slugs]
    .map((s) => catalog.hub(s))
    .filter((h) => h !== undefined)
    .map((h) => ({ href: `/hubs/${h.slug}/`, label: h.title, note: "Hub" }));
}

function explainerLinks(slugs: string[]): RelatedLink[] {
  return slugs
    .map((s) => EXPLAINERS.find((e) => e.slug === s))
    .filter((e) => e !== undefined)
    .map((e) => ({ href: `/learn/${e.slug}/`, label: e.title, note: "Explainer" }));
}

export function organizationRelated(catalog: Catalog, o: Organization): RelatedLink[] {
  const hubs = new Set(catalog.hubsForOrganization(o.slug).map((h) => h.slug));
  for (const s of o.sectors) if (HUB_BY_SECTOR[s]) hubs.add(HUB_BY_SECTOR[s]);
  for (const r of o.organization_roles) if (HUB_BY_ROLE[r]) hubs.add(HUB_BY_ROLE[r]);
  const links = hubLinks(catalog, hubs);
  const code = stateFromHeadquarters(o.headquarters?.label, o.headquarters?.country);
  if (code) links.push({ href: `/places/${stateSlug(code)}/`, label: `Organizations headquartered in ${US_STATES[code]}`, note: "Place" });
  const ex = ["how-the-ecosystem-fits-together"];
  if (o.organization_roles.includes("model-developer")) ex.push("open-weight-vs-open-source");
  if (o.organization_roles.some((r) => ["chip-designer", "compute-infrastructure", "cloud-provider"].includes(r))) ex.push("infrastructure-and-energy-claims");
  return [...links, ...explainerLinks(ex)];
}

export function artifactRelated(catalog: Catalog, a: Artifact): RelatedLink[] {
  const hubs = new Set(catalog.hubsForArtifact(a.slug).map((h) => h.slug));
  if (a.kind === "runtime") hubs.add("local-ai");
  return [...hubLinks(catalog, hubs), ...explainerLinks(EXPLAINERS_BY_KIND[a.kind] ?? [])];
}
