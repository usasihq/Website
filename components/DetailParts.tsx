import { Archive, CalendarCheck } from "lucide-react";
import { formatDate } from "@/lib/dates";
import { BASIS_LABELS, ELIGIBILITY_STATUS_LABELS } from "@/lib/labels";
import type { Claim, Eligibility, Source } from "@/lib/schema";
import { SourceRefs } from "./Sources";

export function ClaimText({ claim, sources, className = "" }: { claim: Claim; sources: Source[]; className?: string }) {
  return (
    <p className={className}>
      {claim.text}
      <SourceRefs ids={claim.source_ids} sources={sources} />
    </p>
  );
}

export function FactList({ facts }: { facts: Array<{ label: string; value: React.ReactNode } | null> }) {
  const rows = facts.filter(Boolean) as Array<{ label: string; value: React.ReactNode }>;
  return (
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {rows.map((f) => (
        <div key={f.label} className="min-w-0 border-t border-line pt-3">
          <dt className="eyebrow text-[0.75rem]">{f.label}</dt>
          <dd className="mt-1 break-words text-[0.9375rem] text-text">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ArchivedNotice({ note }: { note: string }) {
  return (
    <div className="border-b border-[rgba(255,77,109,0.35)] bg-[rgba(255,77,109,0.07)]" role="note" data-testid="archived-notice">
      <div className="container-page flex gap-3 py-4 text-[0.9375rem]">
        <Archive aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#ffc2cd]" />
        <p>
          <strong className="font-semibold text-text">Archived — historical record.</strong> This entry is kept for reference and is excluded from
          directories, search, counts, and exports. {note}
        </p>
      </div>
    </div>
  );
}

export function EligibilityBlock({ eligibility, sources }: { eligibility: Eligibility; sources: Source[] }) {
  return (
    <div className="card p-5">
      <p className="text-[0.9375rem]">
        <span className="font-semibold text-text">{ELIGIBILITY_STATUS_LABELS[eligibility.status]}</span>
        <span className="text-muted"> · basis: {BASIS_LABELS[eligibility.basis]}</span>
      </p>
      <p className="mt-2 text-[0.9375rem] text-[#d5def2]">
        {eligibility.explanation}
        <SourceRefs ids={eligibility.source_ids} sources={sources} />
      </p>
      <p className="meta mt-3 text-[0.8125rem]">Assessed {formatDate(eligibility.assessed_at)}</p>
    </div>
  );
}

export function ReviewDates({ lastReviewed, updatedAt, releasedAt }: { lastReviewed: string | null; updatedAt: string; releasedAt?: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.9375rem]">
      <span className="inline-flex items-center gap-2">
        <CalendarCheck aria-hidden="true" className="h-4 w-4 text-cyan" />
        <span className="text-muted">Last reviewed</span>
        <time className="meta text-text" dateTime={lastReviewed ?? undefined}>
          {formatDate(lastReviewed)}
        </time>
      </span>
      <span>
        <span className="text-muted">Entry updated </span>
        <time className="meta text-text" dateTime={updatedAt}>
          {formatDate(updatedAt)}
        </time>
      </span>
      {releasedAt !== undefined ? (
        <span>
          <span className="text-muted">Documented release </span>
          <span className="meta text-text">{releasedAt ? formatDate(releasedAt) : "Unknown"}</span>
        </span>
      ) : null}
    </div>
  );
}
