import Link from "next/link";
import { companiesHref, openHref } from "@/lib/routes";
import {
  DEFAULT_ARTIFACT_FILTERS,
  DEFAULT_ORG_FILTERS,
  filterArtifacts,
  filterOrganizations,
  serializeArtifactFilters,
  serializeOrgFilters,
  type ArtifactFilters,
  type ArtifactListItem,
  type OrgFilters,
  type OrgListItem,
} from "@/lib/search";

/**
 * Preset directory views as plain links (they work without JavaScript and are
 * shareable). Each shows how many records it contains; empty views are hidden.
 */
const ORG_VIEWS: Array<{ label: string; filters: Partial<OrgFilters> }> = [
  { label: "Model developers", filters: { role: "model-developer" } },
  { label: "Chip designers", filters: { role: "chip-designer" } },
  { label: "Cloud and compute", filters: { sector: "cloud" } },
  { label: "Open-source stewards", filters: { role: "open-source-steward" } },
  { label: "University labs", filters: { role: "university-lab" } },
  { label: "Nonprofits", filters: { ownership: "nonprofit" } },
  { label: "Robotics", filters: { sector: "robotics" } },
  { label: "Science", filters: { sector: "science" } },
  { label: "Most open-artifact records", filters: { open: true, sort: "artifacts" } },
];

const ARTIFACT_VIEWS: Array<{ label: string; filters: Partial<ArtifactFilters> }> = [
  { label: "Model releases", filters: { kind: "model", level: "release" } },
  { label: "Open-weight releases", filters: { kind: "model", level: "release", tier: "open-weight" } },
  { label: "Open-stack and open system (reviewed)", filters: { kind: "model", level: "release", tier: "open-stack" } },
  { label: "Frameworks", filters: { kind: "framework" } },
  { label: "Runtimes", filters: { kind: "runtime" } },
  { label: "Datasets", filters: { kind: "dataset" } },
  { label: "Benchmarks and evals", filters: { kind: "eval" } },
  { label: "Newest documented releases", filters: { sort: "released" } },
];

function Chips({ items, label }: { items: Array<{ label: string; href: string; count: number | null }>; label: string }) {
  return (
    <nav aria-label={label} className="mt-6">
      <ul className="flex flex-wrap gap-2">
        {items.map((v) => (
          <li key={v.href}>
            <Link
              prefetch={false}
              href={v.href}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-[rgba(11,18,36,0.7)] px-3.5 text-[0.9375rem] text-text hover:border-cyan"
            >
              {v.label}
              {v.count !== null ? <span className="font-mono text-[0.8125rem] text-muted">{v.count}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function OrgQuickViews({ items }: { items: OrgListItem[] }) {
  const views = ORG_VIEWS.map((v) => {
    const f = { ...DEFAULT_ORG_FILTERS, ...v.filters };
    return { label: v.label, href: companiesHref(serializeOrgFilters(f)), count: filterOrganizations(items, f).length };
  }).filter((v) => v.count > 0);
  return <Chips items={views.map((v) => (v.label.startsWith("Most") ? { ...v, count: null } : v))} label="Quick views of organizations" />;
}

export function ArtifactQuickViews({ items }: { items: ArtifactListItem[] }) {
  const views = ARTIFACT_VIEWS.map((v) => {
    const f = { ...DEFAULT_ARTIFACT_FILTERS, ...v.filters };
    return { label: v.label, href: openHref(serializeArtifactFilters(f)), count: filterArtifacts(items, f).length };
  }).filter((v) => v.count > 0);
  return <Chips items={views.map((v) => (v.label.startsWith("Newest") ? { ...v, count: null } : v))} label="Quick views of open models and tools" />;
}
