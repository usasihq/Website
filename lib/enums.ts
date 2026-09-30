/**
 * Enum values shared by the Zod schema and client code. Kept free of
 * dependencies so client bundles do not pull in the validator.
 */
export const PUBLICATION_STATUSES = ["draft", "published", "archived"] as const;
export const ELIGIBILITY_STATUSES = ["eligible", "pending_review", "excluded"] as const;
export const ELIGIBILITY_BASES = [
  "us-headquarters",
  "us-nonprofit-or-lab",
  "us-control",
  "us-governed-project",
  "none",
  "undetermined",
] as const;

export const ORGANIZATION_ROLES = [
  "model-developer",
  "research-lab",
  "cloud-provider",
  "compute-infrastructure",
  "chip-designer",
  "hardware-manufacturer",
  "inference-provider",
  "data-platform",
  "enterprise-software",
  "developer-platform",
  "consumer-products",
  "robotics",
  "open-source-steward",
  "nonprofit-research",
  "data-services",
  "university-lab",
  "standards-body",
] as const;

export const OWNERSHIP_CATEGORIES = [
  "publicly-traded",
  "privately-held",
  "nonprofit",
  "unit-of-another-organization",
  "foundation-hosted",
  "public-institution",
  "unknown",
] as const;

export const PARENT_RELATIONSHIPS = ["subsidiary", "division", "research-unit", "hosted-project"] as const;

export const SECTORS = [
  "frontier-models",
  "cloud",
  "chips",
  "open-models",
  "agents",
  "data",
  "enterprise",
  "robotics",
  "defense",
  "research",
  "science",
] as const;

export const PRODUCT_KINDS = [
  "hosted-model-api",
  "assistant-app",
  "cloud-platform",
  "compute-service",
  "inference-service",
  "developer-tool",
  "enterprise-software",
  "data-platform",
  "hardware",
  "robot",
  "other",
] as const;

export const ARTIFACT_KINDS = ["model", "dataset", "framework", "eval", "runtime", "research-stack"] as const;
export const RECORD_LEVELS = ["family", "release", "project"] as const;
export const AVAILABILITY_STATUSES = ["public", "partial", "not_public", "unknown", "not_applicable"] as const;
