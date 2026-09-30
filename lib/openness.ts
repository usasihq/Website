/**
 * USASI openness rubric v0.2.
 *
 * Type-specific public-materials checklists and the model-disclosure tiers.
 * These are USASI editorial categories, not an external certification.
 * OPENNESS.md is the human-readable specification of the same rules; keep
 * them in sync and bump RUBRIC_VERSION on any substantive change.
 *
 * Client-safe: no Node-only imports.
 */
import type { Artifact, ArtifactKind, AvailabilityStatus, ChecklistItem } from "./schema";

export const RUBRIC_VERSION = "0.2";
export const RUBRIC_LABEL = `USASI rubric v${RUBRIC_VERSION}`;

export interface ChecklistDefinition {
  key: string;
  label: string;
  question: string;
}

const MODEL_CHECKLIST: ChecklistDefinition[] = [
  { key: "weights", label: "Weights", question: "Can the general public download the model parameters for this release?" },
  { key: "inference_code", label: "Inference code", question: "Is code for running the model published?" },
  { key: "training_code", label: "Training code", question: "Is the code used to train the model published?" },
  {
    key: "training_data_information",
    label: "Training-data information",
    question:
      "Does the information cover provenance, scope, acquisition, selection, labeling, processing, and where data or alternatives can be obtained? Access alone does not establish completeness.",
  },
  { key: "training_data_access", label: "Training-data access", question: "Can the training data be obtained? This is independent of information completeness and reuse rights; original unshareable data need not be downloadable." },
  { key: "training_pipeline", label: "Complete training pipeline", question: "Is the complete base-training and preprocessing pipeline published, including configuration? Fine-tuning code or an inference SDK alone is insufficient." },
  { key: "legacy_training_data_information", label: "Legacy data assessment (v0.1)", question: "Historical assessment combining download access and disclosure. Preserved for traceability; excluded from the v0.2 tier calculation. See the new separate assessments above." },
  { key: "training_recipe", label: "Training recipe", question: "Are the training configuration and procedure documented in enough detail to follow?" },
  {
    key: "evaluation_materials",
    label: "Evaluation materials",
    question: "Public = evaluation code or prompts that let others re-run the evaluations are published. Partial = results only.",
  },
];

const SOFTWARE_CHECKLIST: ChecklistDefinition[] = [
  { key: "source_code", label: "Source code", question: "Is the source code publicly readable?" },
  { key: "documentation", label: "Documentation", question: "Is user documentation published?" },
  { key: "installation", label: "Installation", question: "Are installation instructions or packages publicly available?" },
  { key: "supported_platforms", label: "Supported platforms", question: "Are supported operating systems or hardware documented?" },
  { key: "release_status", label: "Release status", question: "Are versioned releases published?" },
];

export const CHECKLISTS: Record<ArtifactKind, ChecklistDefinition[]> = {
  model: MODEL_CHECKLIST,
  framework: SOFTWARE_CHECKLIST,
  runtime: SOFTWARE_CHECKLIST,
  dataset: [
    { key: "access", label: "Access", question: "Can the data be obtained, and on what terms?" },
    { key: "provenance", label: "Provenance", question: "Are the data's origins documented?" },
    { key: "documentation", label: "Documentation", question: "Is there a datasheet, card, or equivalent documentation?" },
    { key: "licensing", label: "Licensing", question: "Are the licensing terms stated?" },
    { key: "stated_limitations", label: "Stated limitations", question: "Does the documentation state known limitations or risks?" },
  ],
  eval: [
    { key: "code", label: "Code", question: "Is the evaluation code published?" },
    { key: "tasks_data", label: "Tasks / data", question: "Are the tasks or test data available?" },
    { key: "methodology", label: "Methodology", question: "Is the method for scoring described?" },
    { key: "reproducibility_instructions", label: "Reproducibility", question: "Are instructions for reproducing results published?" },
    { key: "limitations", label: "Limitations", question: "Are known limitations documented?" },
  ],
  "research-stack": [
    { key: "source_code", label: "Source code", question: "Is the source code publicly readable?" },
    { key: "documentation", label: "Documentation", question: "Is user documentation published?" },
    { key: "training_code", label: "Training code", question: "Does it include code for training models?" },
    { key: "data_information", label: "Data information", question: "Are the data it expects or ships with documented?" },
    { key: "reproducibility_instructions", label: "Reproducibility", question: "Are instructions for reproducing reported results published?" },
  ],
};

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  public: "Public",
  partial: "Partial",
  not_public: "Not public",
  unknown: "Unknown",
  not_applicable: "Not applicable",
};

export const AVAILABILITY_DESCRIPTIONS: Record<AvailabilityStatus, string> = {
  public: "Documented as available to the general public. Access conditions and license terms may still apply.",
  partial: "Some of it is available, or access requires approval or is otherwise restricted.",
  not_public: "Documented as not publicly available.",
  unknown: "Not yet assessed, or the evidence is insufficient.",
  not_applicable: "Does not apply to this kind of artifact.",
};

export function checklistFor(artifact: Pick<Artifact, "kind" | "checklist">): Array<ChecklistDefinition & { item: ChecklistItem }> {
  return CHECKLISTS[artifact.kind].map((definition) => ({
    ...definition,
    item: artifact.checklist[definition.key] ?? { status: "unknown", note: null, source_ids: [] },
  }));
}

export function checklistStatus(artifact: Pick<Artifact, "checklist">, key: string): AvailabilityStatus {
  return artifact.checklist[key]?.status ?? "unknown";
}

/**
 * SPDX identifiers the rubric treats as OSI-approved open source licenses.
 * Deliberately short: a license missing from this list is not treated as
 * OSI-approved until an editor adds it with a source in OPENNESS.md.
 */
export const OSI_APPROVED_SPDX = new Set([
  "Apache-2.0",
  "MIT",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "MPL-2.0",
  "ISC",
  "GPL-2.0-only",
  "GPL-2.0-or-later",
  "GPL-3.0-only",
  "GPL-3.0-or-later",
  "LGPL-2.1-only",
  "LGPL-2.1-or-later",
  "LGPL-3.0-only",
  "LGPL-3.0-or-later",
  "AGPL-3.0-only",
  "AGPL-3.0-or-later",
  "EPL-2.0",
]);

export function isOsiApproved(spdx: string | null | undefined): boolean {
  return Boolean(spdx && OSI_APPROVED_SPDX.has(spdx));
}

/* ------------------------------------------------------------------ */
/* Model-disclosure tiers (model releases only)                        */
/* ------------------------------------------------------------------ */

export type ModelTier = "fully-open" | "open-stack" | "open-weight" | "restricted-weights" | "weights-not-public" | "unknown";

/** Cumulative tiers, from least to most inclusive requirements. */
export const CUMULATIVE_TIERS = ["open-weight", "open-stack", "fully-open"] as const;
export type CumulativeTier = (typeof CUMULATIVE_TIERS)[number];

export const TIER_LABELS: Record<ModelTier, string> = {
  "fully-open": "Open system (reviewed)",
  "open-stack": "Open-stack",
  "open-weight": "Open-weight",
  "restricted-weights": "Restricted weights",
  "weights-not-public": "Weights not public",
  unknown: "Unknown",
};

export const TIER_DESCRIPTIONS: Record<ModelTier, string> = {
  "open-weight":
    "The model parameters for this release can be downloaded by the public. License terms may still restrict use, redistribution, or commercial use.",
  "open-stack":
    "Open-weight, plus published inference code, training code, and training recipe, and at least documented training-data composition.",
  "fully-open":
    "Open-stack with complete data information and training pipeline, plus an explicit sourced review of parameter, code, and data-information reuse rights. A USASI assessment, not OSI certification; original training data need not all be downloadable.",
  "restricted-weights":
    "The weights can be obtained only by request, with approval, or by some users — for example a gated download that the publisher reviews. Not counted as open-weight.",
  "weights-not-public": "The weights for this release are documented as not publicly available.",
  unknown: "The availability of the weights has not been assessed, or the evidence is insufficient.",
};

type TierInput = Pick<Artifact, "kind" | "record_level" | "checklist" | "licenses"> & Partial<Pick<Artifact, "system_openness_review">>;

function licensesFor(artifact: TierInput, target: "weights" | "code") {
  return artifact.licenses.filter(
    (l) => l.applies_to === target || l.applies_to === "weights-and-code" || l.applies_to === "all",
  );
}

/** Returns null for anything that is not a model release. */
export function computeTier(artifact: TierInput): ModelTier | null {
  if (artifact.kind !== "model" || artifact.record_level !== "release") return null;
  const s = (key: string) => checklistStatus(artifact, key);

  if (s("weights") === "unknown") return "unknown";
  if (s("weights") === "partial") return "restricted-weights";
  if (s("weights") !== "public") return "weights-not-public";

  const openStack =
    s("inference_code") === "public" &&
    s("training_code") === "public" &&
    s("training_recipe") === "public" &&
    (s("training_data_information") === "public" || s("training_data_information") === "partial");
  if (!openStack) return "open-weight";

  // Availability and software-license identifiers alone cannot establish an
  // open AI system. A release-specific rights/completeness review is mandatory.
  const review = artifact.system_openness_review;
  const complete = s("training_data_information") === "public" && s("training_pipeline") === "public";
  return complete && review?.status === "verified" && Object.values(review.permissions).every(value => value === "qualifying") ? "fully-open" : "open-stack";
}

/** Whether a release satisfies a cumulative tier (fully open ⊂ open-stack ⊂ open-weight). */
export function meetsTier(artifact: TierInput, tier: CumulativeTier): boolean {
  const actual = computeTier(artifact);
  if (!actual || !(CUMULATIVE_TIERS as readonly string[]).includes(actual)) return false;
  return CUMULATIVE_TIERS.indexOf(actual as CumulativeTier) >= CUMULATIVE_TIERS.indexOf(tier);
}

/** Tier filter values: cumulative tiers, or an exact non-open state. */
export const TIER_FILTERS = ["open-weight", "open-stack", "fully-open", "restricted-weights", "weights-not-public", "unknown"] as const;
export type TierFilter = (typeof TIER_FILTERS)[number];

export function tierSatisfies(actual: ModelTier | null, filter: TierFilter): boolean {
  if (!actual) return false;
  if (!(CUMULATIVE_TIERS as readonly string[]).includes(filter)) return actual === filter;
  if (!(CUMULATIVE_TIERS as readonly string[]).includes(actual)) return false;
  return CUMULATIVE_TIERS.indexOf(actual as CumulativeTier) >= CUMULATIVE_TIERS.indexOf(filter as CumulativeTier);
}

/** Caveats shown next to an open-weight label so it is never read as "unrestricted". */
export function licenseCaveats(artifact: TierInput): string[] {
  const caveats: string[] = [];
  const weightLicenses = licensesFor(artifact, "weights");
  if (weightLicenses.length === 0) {
    caveats.push("No license for the weights is recorded in this catalog.");
  } else if (weightLicenses.some((l) => !isOsiApproved(l.spdx))) {
    caveats.push("The weights are under a license that is not on the rubric's OSI-approved list. Read its terms before use.");
  }
  return caveats;
}

/** Open data/content licenses are not called OSI-approved software licenses. */
export const OPEN_DATA_SPDX = new Set(["CC0-1.0", "CC-BY-4.0", "CC-BY-SA-4.0", "ODC-By-1.0", "ODbL-1.0", "PDDL-1.0"]);
export function componentRights(licenses: Artifact["licenses"], component: "weights" | "code" | "data" | "documentation"): "qualifying-license" | "review-required" | "unknown" {
  const relevant = licenses.filter(l => l.applies_to === component || l.applies_to === "all" || (l.applies_to === "weights-and-code" && (component === "weights" || component === "code")));
  if (!relevant.length || relevant.some(l => !l.spdx || !l.reviewed_at)) return "unknown";
  // Multiple records may be cumulative or alternatives; do not guess which.
  if (new Set(relevant.map(l => l.spdx)).size > 1) return "review-required";
  return relevant.every(l => isOsiApproved(l.spdx) || ((component === "data" || component === "documentation") && OPEN_DATA_SPDX.has(l.spdx!))) ? "qualifying-license" : "review-required";
}
