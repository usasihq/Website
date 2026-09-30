/**
 * Rubric reference tables rendered from lib/openness.ts, so the methodology
 * page can never drift from the rules the site actually applies.
 */
import { KIND_LABELS } from "@/lib/labels";
import {
  AVAILABILITY_DESCRIPTIONS,
  CHECKLISTS,
  OSI_APPROVED_SPDX,
  RUBRIC_LABEL,
  TIER_DESCRIPTIONS,
  TIER_LABELS,
  type ModelTier,
} from "@/lib/openness";
import type { ArtifactKind, AvailabilityStatus } from "@/lib/schema";
import { StatusBadge, TierBadge } from "./Badges";

const GROUPS: Array<{ label: string; kinds: ArtifactKind[] }> = [
  { label: "Model releases", kinds: ["model"] },
  { label: "Frameworks and runtimes", kinds: ["framework", "runtime"] },
  { label: "Datasets", kinds: ["dataset"] },
  { label: "Evaluation tools", kinds: ["eval"] },
  { label: "Research stacks", kinds: ["research-stack"] },
];

export function StatusLegend() {
  const statuses: AvailabilityStatus[] = ["public", "partial", "not_public", "unknown", "not_applicable"];
  return (
    <ul className="grid gap-3 font-sans sm:grid-cols-2" style={{ listStyle: "none", paddingLeft: 0 }}>
      {statuses.map((s) => (
        <li key={s} className="flex items-start gap-3 text-[0.9375rem]" style={{ marginTop: 0 }}>
          <span className="shrink-0">
            <StatusBadge status={s} />
          </span>
          <span className="text-muted">{AVAILABILITY_DESCRIPTIONS[s]}</span>
        </li>
      ))}
    </ul>
  );
}

export function ChecklistTables() {
  return (
    <div className="grid gap-6 font-sans">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <h3>{g.label}</h3>
          <table>
            <caption className="sr-only">
              {RUBRIC_LABEL} checklist for {g.kinds.map((k) => KIND_LABELS[k].toLowerCase()).join(" and ")}
            </caption>
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Question</th>
              </tr>
            </thead>
            <tbody>
              {CHECKLISTS[g.kinds[0]].map((d) => (
                <tr key={d.key}>
                  <th scope="row">{d.label}</th>
                  <td>{d.question}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export function TierTable() {
  const tiers: ModelTier[] = ["open-weight", "open-stack", "fully-open", "restricted-weights", "weights-not-public", "unknown"];
  return (
    <div className="font-sans">
      <table>
        <caption className="sr-only">{RUBRIC_LABEL} model-disclosure tiers</caption>
        <thead>
          <tr>
            <th scope="col">Tier</th>
            <th scope="col">Requirement</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((t) => (
            <tr key={t}>
              <th scope="row">
                <TierBadge tier={t} />
                <span className="sr-only">{TIER_LABELS[t]}</span>
              </th>
              <td>{TIER_DESCRIPTIONS[t]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[0.9375rem] text-muted">
        Software licenses on the rubric’s OSI-approved list: {[...OSI_APPROVED_SPDX].join(", ")}. Data and documentation rights are assessed separately. License identifiers alone do not establish system openness; the highest tier requires a sourced review of permissions and completeness.
      </p>
    </div>
  );
}
