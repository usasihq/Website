/**
 * Connects license guides (content/licenses) to the license entries on
 * catalog records. A record's license matches a guide by SPDX id, or by the
 * start of the license name the record gives. SPDX ids are compared exactly,
 * so "Apache-2.0 WITH LLVM-exception" never matches the plain Apache-2.0 guide.
 */
import type { Catalog } from "./catalog";
import type { Artifact, LicenseCategory, LicenseGuide, LicenseRecord } from "./schema";

export const LICENSE_CATEGORY_LABELS: Record<LicenseCategory, string> = {
  permissive: "Permissive open-source license",
  copyleft: "Copyleft open-source license",
  "model-license": "Custom model license",
  "data-license": "Data license",
  "content-license": "Content license",
  "non-commercial": "Non-commercial license",
  other: "Other license",
};

export function licenseMatches(guide: LicenseGuide, license: LicenseRecord): boolean {
  if (license.spdx) {
    if (guide.match.spdx.includes(license.spdx)) return true;
    // A record with an SPDX id only matches name prefixes when the guide has no SPDX rule of its own.
    if (guide.match.spdx.length > 0) return false;
  }
  return guide.match.name_prefixes.some((p) => license.name.startsWith(p));
}

export type LicenseUse = { artifact: Artifact; license: LicenseRecord };

/** Published records using a license, sorted by record name, one row per license entry. */
export function usesOfLicense(catalog: Catalog, guide: LicenseGuide): LicenseUse[] {
  return catalog.artifacts
    .flatMap((artifact) => artifact.licenses.filter((l) => licenseMatches(guide, l)).map((license) => ({ artifact, license })))
    .sort((a, b) => a.artifact.name.localeCompare(b.artifact.name) || a.license.applies_to.localeCompare(b.license.applies_to));
}

/** The guide for one license entry on a record, if any. */
export function guideFor(catalog: Catalog, license: LicenseRecord): LicenseGuide | undefined {
  return catalog.licenses.find((g) => licenseMatches(g, license));
}

/** License names used by published records that no guide covers yet, with how many entries use each. */
export function uncoveredLicenses(catalog: Catalog): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const a of catalog.artifacts) {
    for (const l of a.licenses) {
      if (!guideFor(catalog, l)) counts.set(l.name, (counts.get(l.name) ?? 0) + 1);
    }
  }
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
