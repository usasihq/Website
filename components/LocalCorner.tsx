import Link from "@/components/Link";
import { ArrowRight } from "lucide-react";
import type { Leader, Person } from "@/lib/schema";

export function InitialsTile({ initials, size = "md" }: { initials: string; size?: "md" | "lg" }) {
  return (
    <span
      aria-hidden="true"
      className={`${size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-[0.875rem]"} inline-flex shrink-0 select-none items-center justify-center rounded-full border border-ice/30 bg-[radial-gradient(circle_at_30%_25%,var(--panel-deep-a),var(--panel-deep-b))] font-mono text-ice`}
    >
      {initials.toUpperCase()}
    </span>
  );
}

/**
 * A quiet homepage strip listing everyone on the standing People Behind Local SI
 * list as compact links to their profile pages.
 */
/** How many names the homepage strip shows before linking to the full list. */
export const STRIP_LIMIT = 12;

export function LocalCornerStrip({ people: everyone }: { people: Person[] }) {
  const people = everyone.filter((p) => p.groups.includes("local"));
  if (people.length === 0) return null;
  const shown = people.slice(0, STRIP_LIMIT);
  return (
    <section aria-labelledby="local-corner-heading" className="border-t border-line py-12">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Local corner</p>
            <h2 id="local-corner-heading" className="mt-1 text-xl font-semibold text-text">
              People behind local SI
            </h2>
            <p className="mt-1 max-w-2xl text-[0.9375rem] text-muted">
              People whose public work helps others run AI models on their own hardware.
            </p>
          </div>
          <Link prefetch={false} href="/local/" className="link inline-flex items-center gap-1 text-[0.9375rem]">
            Read their profiles <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
        <ul className="mt-6 flex flex-wrap gap-2">
          {shown.map((p) => (
            <li key={p.slug}>
              <Link
                prefetch={false}
                href={`/people/${p.slug}/`}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-surface/60 py-1 pl-1 pr-3.5 text-[0.9375rem] text-text hover:border-line-strong"
              >
                <InitialsTile initials={p.initials} />
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
        {people.length > shown.length ? (
          <p className="mt-4">
            <Link prefetch={false} href="/local/" className="link text-[0.9375rem]">
              See all {people.length} people
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}

/** Homepage strip for People Behind Big SI: leaders of large AI organizations, linking to full profiles. */
export function BigSiStrip({ leaders }: { leaders: Leader[] }) {
  if (leaders.length === 0) return null;
  return (
    <section aria-labelledby="big-si-heading" className="border-t border-line py-12">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">People</p>
            <h2 id="big-si-heading" className="mt-1 text-xl font-semibold text-text">
              People Behind Big SI
            </h2>
            <p className="mt-1 max-w-2xl text-[0.9375rem] text-muted">
              The founders, chief executives, and builders behind the companies shaping AI, and what they have built.
            </p>
          </div>
          <Link prefetch={false} href="/big-si/" className="link inline-flex items-center gap-1 text-[0.9375rem]">
            Read their profiles <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
        <ul className="mt-6 flex flex-wrap gap-2">
          {leaders.map((l) => (
            <li key={l.slug}>
              <Link
                prefetch={false}
                href={`/big-si/${l.slug}/`}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-surface/60 py-1 pl-1 pr-3.5 text-[0.9375rem] text-text hover:border-line-strong"
              >
                <InitialsTile initials={l.initials} />
                {l.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
