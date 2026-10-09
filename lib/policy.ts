/** Labels and grouping for the U.S. AI policy tracker (content/policy). */
import type { PolicyDocumentType, PolicyStatus } from "./schema";

export const POLICY_TYPE_LABELS: Record<PolicyDocumentType, string> = {
  law: "Law",
  "executive-order": "Executive order",
  "presidential-memorandum": "Presidential memorandum",
  "omb-memorandum": "OMB memorandum",
  regulation: "Regulation",
  "agency-guidance": "Agency guidance",
  standard: "Standard",
  framework: "Framework",
  "strategy-or-plan": "Strategy or plan",
  report: "Report",
};

/** Filter groups shown on the tracker; each covers one or more document types. */
export const POLICY_FILTERS: { id: string; label: string; types: PolicyDocumentType[] }[] = [
  { id: "laws", label: "Laws and regulations", types: ["law", "regulation"] },
  { id: "presidential", label: "Executive orders and memoranda", types: ["executive-order", "presidential-memorandum"] },
  { id: "omb", label: "OMB memoranda", types: ["omb-memorandum"] },
  { id: "standards", label: "Standards and frameworks", types: ["standard", "framework"] },
  { id: "guidance", label: "Guidance, plans, and reports", types: ["agency-guidance", "strategy-or-plan", "report"] },
];

export const POLICY_STATUS_LABELS: Record<PolicyStatus, string> = {
  "in-effect": "In effect",
  revoked: "Revoked",
  superseded: "Superseded",
  rescinded: "Rescinded",
  final: "Final",
  draft: "Draft",
  unknown: "Status not stated",
};

/** Whether a status means the document no longer applies as issued. */
export const isInactive = (s: PolicyStatus) => s === "revoked" || s === "superseded" || s === "rescinded";

export const DATE_LABEL_VERBS: Record<string, string> = {
  signed: "Signed",
  enacted: "Enacted",
  issued: "Issued",
  published: "Published",
  released: "Released",
};
