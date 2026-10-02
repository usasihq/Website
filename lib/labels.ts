/** Human-readable labels for schema enums. Client-safe. */
import type {
  ArtifactKind,
  EligibilityBasis,
  EligibilityStatus,
  OrganizationRole,
  OwnershipCategory,
  ParentRelationship,
  ProductKind,
  RecordLevel,
  Sector,
} from "./schema";

export const ROLE_LABELS: Record<OrganizationRole, string> = {
  "model-developer": "Model developer",
  "research-lab": "Research lab",
  "cloud-provider": "Cloud provider",
  "compute-infrastructure": "Compute infrastructure",
  "chip-designer": "Chip designer",
  "hardware-manufacturer": "Hardware manufacturer",
  "inference-provider": "Inference provider",
  "data-platform": "Data platform",
  "enterprise-software": "Enterprise software",
  "developer-platform": "Developer platform",
  "consumer-products": "Consumer products",
  robotics: "Robotics",
  "open-source-steward": "Open-source steward",
  "nonprofit-research": "Nonprofit research",
  "data-services": "Data services",
  "university-lab": "University lab",
  "standards-body": "Standards body",
};

export const SECTOR_LABELS: Record<Sector, string> = {
  "frontier-models": "Frontier models",
  cloud: "Cloud",
  chips: "Chips",
  "open-models": "Open models",
  agents: "Agents",
  data: "Data",
  enterprise: "Enterprise",
  robotics: "Robotics",
  defense: "Defense",
  research: "Research",
  science: "Science",
};

export const OWNERSHIP_LABELS: Record<OwnershipCategory, string> = {
  "publicly-traded": "Publicly traded",
  "privately-held": "Privately held",
  nonprofit: "Nonprofit",
  "unit-of-another-organization": "Unit of another organization",
  "foundation-hosted": "Foundation-hosted",
  "public-institution": "Public institution",
  unknown: "Unknown",
};

export const RELATIONSHIP_LABELS: Record<ParentRelationship, string> = {
  subsidiary: "Subsidiary",
  division: "Division",
  "research-unit": "Research unit",
  "hosted-project": "Hosted project",
};

export const PRODUCT_KIND_LABELS: Record<ProductKind, string> = {
  "hosted-model-api": "Hosted model API",
  "assistant-app": "Assistant app",
  "cloud-platform": "Cloud platform",
  "compute-service": "Compute service",
  "inference-service": "Inference service",
  "developer-tool": "Developer tool",
  "enterprise-software": "Enterprise software",
  "data-platform": "Data platform",
  hardware: "Hardware",
  robot: "Robot",
  other: "Other",
};

export const KIND_LABELS: Record<ArtifactKind, string> = {
  model: "Model",
  dataset: "Dataset",
  framework: "Framework",
  eval: "Evaluation tool",
  runtime: "Runtime",
  "research-stack": "Research stack",
};

export const KIND_PLURAL: Record<ArtifactKind, string> = {
  model: "Models",
  dataset: "Datasets",
  framework: "Frameworks",
  eval: "Evaluation tools",
  runtime: "Runtimes",
  "research-stack": "Research stacks",
};

export const LEVEL_LABELS: Record<RecordLevel, string> = {
  family: "Model family",
  release: "Model release",
  project: "Project",
};

export const ELIGIBILITY_STATUS_LABELS: Record<EligibilityStatus, string> = {
  eligible: "Eligible",
  pending_review: "Pending review",
  excluded: "Excluded",
};

export const BASIS_LABELS: Record<EligibilityBasis, string> = {
  "us-headquarters": "U.S. headquarters",
  "us-nonprofit-or-lab": "U.S. nonprofit or lab",
  "us-control": "Documented U.S. control",
  "us-governed-project": "U.S.-governed project",
  none: "No qualifying basis",
  undetermined: "Undetermined",
};

/** Result-type label used by search across both directories. */
export type EntryType =
  | "organization"
  | "model-family"
  | "model-release"
  | "software"
  | "dataset"
  | "evaluation-tool"
  // Reference pages (search only; never directory records)
  | "hub"
  | "explainer"
  | "glossary-term"
  | "person"
  | "place";

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  organization: "Organization",
  "model-family": "Model family",
  "model-release": "Model release",
  software: "Software",
  dataset: "Dataset",
  "evaluation-tool": "Evaluation tool",
  hub: "Hub",
  explainer: "Explainer",
  "glossary-term": "Glossary",
  person: "Person",
  place: "Place",
};

/** Entry types that belong to the Open Models & Tools directory. */
export const ARTIFACT_ENTRY_TYPES: EntryType[] = ["model-family", "model-release", "software", "dataset", "evaluation-tool"];

export function entryTypeFor(kind: ArtifactKind, level: RecordLevel): EntryType {
  if (kind === "model") return level === "family" ? "model-family" : "model-release";
  if (kind === "dataset") return "dataset";
  if (kind === "eval") return "evaluation-tool";
  return "software";
}
