/** Labels and grouping for the U.S. AI policy tracker (content/policy). */
import type { PolicyDocument, PolicyDocumentType, PolicyStatus } from "./schema";

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

/* ------------------------------------------------------------------ */
/* Per-document pages (/policy/<slug>/)                                */
/* ------------------------------------------------------------------ */

type PolicyNameFields = Pick<PolicyDocument, "slug" | "title" | "short_title" | "document_type" | "identifier">;

/** Every published policy document has a page here; /policy/#<slug> stays as its tracker anchor. */
export const policyHref = (slug: string) => `/policy/${slug}/`;
export const policyAnchorHref = (slug: string) => `/policy/#${slug}`;

/** "EO 14434" → "Executive Order 14434"; other identifiers unchanged. */
export function longIdentifier(d: Pick<PolicyDocument, "identifier" | "document_type">): string | null {
  if (!d.identifier) return null;
  if (d.document_type === "executive-order") return d.identifier.replace(/^EO\s+/, "Executive Order ");
  if (d.document_type === "omb-memorandum" && /^M-\d/.test(d.identifier)) return `OMB Memorandum ${d.identifier}`;
  return d.identifier;
}

/** The page heading: the document's name with its identifier. */
export function policyHeading(d: PolicyNameFields): string {
  const id = longIdentifier(d);
  if (!id) return d.title;
  if (d.document_type === "law") return `${d.short_title ?? d.title} (${id})`;
  if (d.document_type === "executive-order" || d.document_type === "omb-memorandum") return `${id}: ${d.title}`;
  // NIST's own citation style: "NIST AI 100-1, Artificial Intelligence Risk Management Framework (AI RMF 1.0)".
  return `${id}, ${d.title}`;
}

/** A short name for titles and links: "Executive Order 14434", "TAKE IT DOWN Act", "AI RMF 1.0 (NIST AI 100-1)". */
export function policyShortName(d: PolicyNameFields): string {
  const id = longIdentifier(d);
  if (d.document_type === "executive-order" || d.document_type === "omb-memorandum") return id ?? d.short_title ?? d.title;
  const name = d.short_title ?? d.title;
  return id && d.document_type !== "law" && `${name} (${id})`.length <= 44 ? `${name} (${id})` : name;
}

const LEGAL_TYPES: PolicyDocumentType[] = ["law", "executive-order", "presidential-memorandum", "omb-memorandum", "regulation"];
/** Whether schema.org Legislation describes this kind of document (laws, orders, memoranda, regulations). */
export const isLegislation = (d: Pick<PolicyDocument, "document_type">) => LEGAL_TYPES.includes(d.document_type);

/** Page title, about 60 characters or fewer before the site name is added. */
export function policyPageTitle(d: PolicyNameFields, max = 60): string {
  const name = policyShortName(d);
  const suffixes = isLegislation(d) ? [": summary, key provisions & sources", ": summary & sources"] : [": summary, status & sources", ": summary & sources"];
  for (const s of suffixes) if (`${name}${s}`.length <= max) return `${name}${s}`;
  return name;
}

/** Sentences of a recorded summary, for listing its provisions one per line. Never splits "U.S." or "15 U.S.C. 9401". */
export function summarySentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[a-z0-9)"'”’][.!?])\s+(?=[A-Z"“])/)
    .filter(Boolean);
}

/** Names a document goes by in other records' text: title, short title, identifier, and "Executive Order N". */
function aliases(d: PolicyNameFields): string[] {
  const out = [d.title, d.short_title, d.identifier, d.document_type === "executive-order" ? longIdentifier(d) : null];
  return [...new Set(out.filter((a): a is string => Boolean(a && a.length >= 6)))];
}
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function mentions(text: string, d: PolicyNameFields): boolean {
  return aliases(d).some((a) => new RegExp(`(?<![A-Za-z0-9-])${escapeRe(a)}(?![A-Za-z0-9])`).test(text));
}
const recordText = (d: PolicyDocument) => `${d.summary.text} ${d.status_note?.text ?? ""}`;

export type PolicyRelation = { doc: PolicyDocument; relation: string };

/**
 * Other tracked documents connected to this one by what the records already
 * say: replacement (superseded_by, both ways) and mentions by name or
 * identifier in either record's summary or status note.
 */
export function relatedPolicies(d: PolicyDocument, all: PolicyDocument[]): PolicyRelation[] {
  const out: PolicyRelation[] = [];
  const seen = new Set<string>([d.slug]);
  const add = (doc: PolicyDocument | undefined, relation: string) => {
    if (!doc || seen.has(doc.slug)) return;
    seen.add(doc.slug);
    out.push({ doc, relation });
  };
  add(all.find((x) => x.slug === d.superseded_by), "Replaced by");
  for (const x of all) if (x.superseded_by === d.slug) add(x, "Replaces");
  const own = recordText(d);
  for (const x of all) if (x.slug !== d.slug && mentions(own, x)) add(x, "Named in this record");
  for (const x of all) if (x.slug !== d.slug && mentions(recordText(x), d)) add(x, "Names this document");
  return out;
}

/** The tracker filter group a document belongs to (for "more like this" links). */
export const policyFilterFor = (d: Pick<PolicyDocument, "document_type">) => POLICY_FILTERS.find((g) => g.types.includes(d.document_type));
