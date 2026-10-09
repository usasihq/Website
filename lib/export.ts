/**
 * Filtered downloads for the two directories: exactly the records a visitor
 * selected, as CSV or JSON, with record links and review dates so every row
 * can be traced back to its sources.
 */
import { ENTRY_TYPE_LABELS, OWNERSHIP_LABELS, ROLE_LABELS, SECTOR_LABELS } from "./labels";
import type { ArtifactListItem, OrgListItem } from "./search";

export const EXPORT_CAVEAT =
  "Each row summarizes one published catalog record as of the snapshot date. Coverage is selective and is not a ranking or a census. The record page lists every source and review date; the full sourced data is at /data/catalog.json.";

type Field = { key: string; description: string };
export type DirectoryExport = { source: string; snapshot: string; caveat: string; fields: Field[]; rows: Record<string, string | number>[] };

const join = (values: string[]) => values.filter(Boolean).join("; ");

export function artifactExport(items: ArtifactListItem[], siteUrl: string, view: string, snapshot: string): DirectoryExport {
  return {
    source: `${siteUrl}/open/${view ? `?${view}` : ""}`,
    snapshot,
    caveat: EXPORT_CAVEAT,
    fields: [
      { key: "slug", description: "Stable record identifier." },
      { key: "name", description: "Record name." },
      { key: "record_page", description: "The record's page, where every statement cites its source." },
      { key: "type", description: "Kind of record (model family, model release, software, dataset, evaluation tool)." },
      { key: "organizations", description: "Organizations linked to the record." },
      { key: "availability", description: "Recorded availability status." },
      { key: "licenses", description: "Licenses recorded on the record, with the component each covers." },
      { key: "released_at", description: "Documented release date, at the precision the evidence supports." },
      { key: "last_reviewed", description: "Date the record's evidence was last reviewed." },
    ],
    rows: items.map((i) => ({
      slug: i.slug,
      name: i.name,
      record_page: `${siteUrl}/open/${i.slug}/`,
      type: ENTRY_TYPE_LABELS[i.entryType],
      organizations: join(i.organizations.map((o) => o.name)),
      availability: i.availability,
      licenses: join(i.licenses.map((l) => `${l.label} (${l.appliesTo})`)),
      released_at: i.releasedAt ?? "",
      last_reviewed: i.lastReviewed,
    })),
  };
}

export function orgExport(items: OrgListItem[], siteUrl: string, view: string, snapshot: string): DirectoryExport {
  return {
    source: `${siteUrl}/companies/${view ? `?${view}` : ""}`,
    snapshot,
    caveat: EXPORT_CAVEAT,
    fields: [
      { key: "slug", description: "Stable record identifier." },
      { key: "name", description: "Organization name." },
      { key: "record_page", description: "The organization's page, where every statement cites its source." },
      { key: "legal_name", description: "Documented legal name, if recorded." },
      { key: "headquarters", description: "Documented headquarters, if recorded." },
      { key: "roles", description: "Organization roles recorded in the catalog." },
      { key: "sectors", description: "Sectors recorded in the catalog." },
      { key: "ownership", description: "Recorded ownership category." },
      { key: "open_artifacts", description: "Number of open artifacts in the catalog linked to the organization." },
      { key: "last_reviewed", description: "Date the record's evidence was last reviewed." },
    ],
    rows: items.map((i) => ({
      slug: i.slug,
      name: i.name,
      record_page: `${siteUrl}/companies/${i.slug}/`,
      legal_name: i.legalName ?? "",
      headquarters: i.headquarters ?? "",
      roles: join(i.roles.map((r) => ROLE_LABELS[r] ?? r)),
      sectors: join(i.sectors.map((s) => SECTOR_LABELS[s] ?? s)),
      ownership: OWNERSHIP_LABELS[i.ownership] ?? i.ownership,
      open_artifacts: i.artifactCount,
      last_reviewed: i.lastReviewed,
    })),
  };
}

/** RFC 4180 CSV; values that start with a formula character are prefixed so spreadsheets treat them as text. */
export function exportCsv(data: DirectoryExport): string {
  const keys = data.fields.map((f) => f.key);
  const esc = (v: unknown) => {
    let s = String(v ?? "");
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [keys.join(","), ...data.rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n") + "\n";
}
