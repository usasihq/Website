import { Check, CircleHelp, CircleSlash, Minus, SquareDashed } from "lucide-react";
import { ENTRY_TYPE_LABELS, type EntryType } from "@/lib/labels";
import { AVAILABILITY_LABELS, RUBRIC_LABEL, TIER_LABELS, type ModelTier } from "@/lib/openness";
import type { AvailabilityStatus } from "@/lib/schema";

/** Monogram tile used instead of scraped logos. Decorative; the name is always adjacent. */
export function Monogram({ text, size = "md" }: { text: string; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "h-16 w-16 text-xl" : size === "sm" ? "h-9 w-9 text-[0.8125rem]" : "h-11 w-11 text-[0.9375rem]";
  return (
    <span
      aria-hidden="true"
      className={`${dims} inline-flex shrink-0 select-none items-center justify-center rounded-xl border border-[rgba(76,201,255,0.3)] bg-[linear-gradient(160deg,#0f1c3a,#081024)] font-mono font-medium tracking-[0.02em] text-ice`}
    >
      {text}
    </span>
  );
}

const AVAILABILITY_ICON: Record<AvailabilityStatus, typeof Check> = {
  public: Check,
  partial: SquareDashed,
  not_public: CircleSlash,
  unknown: CircleHelp,
  not_applicable: Minus,
};

const AVAILABILITY_TONE: Record<AvailabilityStatus, string> = {
  public: "border-[rgba(76,201,255,0.45)] text-[#c9ecff]",
  partial: "border-[rgba(183,215,255,0.35)] text-ice",
  not_public: "border-[rgba(255,77,109,0.4)] text-[#ffc2cd]",
  unknown: "border-line-strong text-muted",
  not_applicable: "border-line text-muted",
};

/** Status shown with icon AND text — never color alone. */
export function StatusBadge({ status, label }: { status: AvailabilityStatus; label?: string }) {
  const Icon = AVAILABILITY_ICON[status];
  return (
    <span className={`badge ${AVAILABILITY_TONE[status]}`}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {label ? <span className="sr-only">{label}: </span> : null}
      {AVAILABILITY_LABELS[status]}
    </span>
  );
}

export function TierBadge({ tier, withRubric = false }: { tier: ModelTier; withRubric?: boolean }) {
  const tone =
    tier === "fully-open" || tier === "open-stack" || tier === "open-weight"
      ? "border-[rgba(76,201,255,0.45)] text-[#c9ecff]"
      : tier === "weights-not-public" || tier === "restricted-weights"
        ? "border-[rgba(255,77,109,0.4)] text-[#ffc2cd]"
        : "border-line-strong text-muted";
  return (
    <span className={`badge ${tone}`}>
      <span className="sr-only">Model-disclosure tier ({RUBRIC_LABEL}): </span>
      {TIER_LABELS[tier]}
      {withRubric ? <span className="font-mono text-[0.75rem] text-muted" aria-hidden="true">· v0.1</span> : null}
    </span>
  );
}

export function EntryTypeBadge({ type }: { type: EntryType }) {
  return <span className="badge font-mono text-[0.75rem] uppercase tracking-[0.06em] text-ice">{ENTRY_TYPE_LABELS[type]}</span>;
}

export function PlainBadge({ children }: { children: React.ReactNode }) {
  return <span className="badge text-muted">{children}</span>;
}
