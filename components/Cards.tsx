import Link from "@/components/Link";
import { formatDate } from "@/lib/dates";
import { KIND_LABELS, RELATIONSHIP_LABELS, ROLE_LABELS, SECTOR_LABELS } from "@/lib/labels";
import { artifactHref, orgHref } from "@/lib/routes";
import type { ArtifactListItem, OrgListItem } from "@/lib/search";
import { EntryTypeBadge, Monogram, StatusBadge, TierBadge } from "./Badges";

export function OrgCard({ item, headingLevel = 3 }: { item: OrgListItem; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="card card-link relative flex h-full flex-col p-5" data-slug={item.slug}>
      <div className="flex items-start gap-4">
        <Monogram text={item.logoText} />
        <div className="min-w-0">
          <Heading className="text-lg font-semibold leading-snug text-text">
            <Link prefetch={false} href={orgHref(item.slug)} className="after:absolute after:inset-0 after:rounded-[0.875rem] after:content-['']">
              {item.name}
            </Link>
          </Heading>
          <p className="mt-0.5 text-[0.9375rem] text-muted">
            {item.roles.slice(0, 2).map((r) => ROLE_LABELS[r]).join(" · ")}
            {item.headquarters ? ` · ${item.headquarters}` : ""}
          </p>
        </div>
      </div>
      {item.parent ? (
        <p className="mt-3 text-sm text-ice">
          {item.parent.relationship ? RELATIONSHIP_LABELS[item.parent.relationship] : "Part"} of {item.parent.name ?? "an organization not listed in this catalog"}
        </p>
      ) : null}
      <p className="mt-3 line-clamp-3 text-[0.9375rem] text-body-2">{item.summary}</p>
      {item.sectors.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Sectors">
          {item.sectors.map((s) => (
            <li key={s} className="badge text-muted">
              {SECTOR_LABELS[s]}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-auto pt-4">
        <p className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-line pt-3 text-xs text-muted">
          <span>
            <span className="font-medium text-text tabular-nums">{item.artifactCount}</span> open artifact record{item.artifactCount === 1 ? "" : "s"}
          </span>
          <span>Reviewed {formatDate(item.lastReviewed)}</span>
        </p>
      </div>
    </article>
  );
}

export function ArtifactCard({ item, headingLevel = 3 }: { item: ArtifactListItem; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const licenseText = item.licenses.map((l) => l.label).filter((v, i, a) => a.indexOf(v) === i).join(", ");
  return (
    <article className="card card-link relative flex h-full flex-col p-5" data-slug={item.slug}>
      <div className="flex flex-wrap items-center gap-2">
        <EntryTypeBadge type={item.entryType} />
        {item.kind !== "model" ? <span className="text-sm text-muted">{KIND_LABELS[item.kind]}</span> : null}
      </div>
      <Heading className="mt-3 text-lg font-semibold leading-snug text-text">
        <Link prefetch={false} href={artifactHref(item.slug)} className="after:absolute after:inset-0 after:rounded-[0.875rem] after:content-['']">
          {item.name}
        </Link>
      </Heading>
      <p className="mt-0.5 text-[0.9375rem] text-muted">
        {item.maintainers.join(", ")}
        {item.familyName ? ` · ${item.familyName} family` : ""}
      </p>
      <p className="mt-3 line-clamp-3 text-[0.9375rem] text-body-2">{item.summary}</p>
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {item.level !== "family" ? <StatusBadge status={item.availability} label="Availability" /> : null}
        {item.tier ? <TierBadge tier={item.tier} withRubric /> : null}
        {item.level === "family" ? (
          <span className="badge text-muted">
            {item.releaseCount} release record{item.releaseCount === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>
      <div className="mt-auto pt-4">
        <p className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-line pt-3 text-xs text-muted">
          <span className="min-w-0">
            {licenseText ? <span className="text-text">{licenseText}</span> : null}
            {licenseText && item.releasedAt ? " · " : ""}
            {item.releasedAt ? `Released ${formatDate(item.releasedAt)}` : ""}
          </span>
          <span>Reviewed {formatDate(item.lastReviewed)}</span>
        </p>
      </div>
    </article>
  );
}
