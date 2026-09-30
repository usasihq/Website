import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Person } from "@/lib/schema";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export function InitialsTile({ initials, size = "md" }: { initials: string; size?: "md" | "lg" }) {
  return (
    <span
      aria-hidden="true"
      className={`${size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-[0.875rem]"} inline-flex shrink-0 select-none items-center justify-center rounded-full border border-[rgba(183,215,255,0.3)] bg-[radial-gradient(circle_at_30%_25%,#16264a,#070d1d)] font-mono text-ice`}
    >
      {initials.toUpperCase()}
    </span>
  );
}

/**
 * A quiet homepage strip for the month's Local corner. Intentionally small:
 * it sits after the editorial sections and links to the full profiles.
 */
export function LocalCornerStrip({ month, people }: { month: string; people: Person[] }) {
  if (people.length === 0) return null;
  return (
    <section aria-labelledby="local-corner-heading" className="border-t border-line py-12">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Local corner · {monthLabel(month)}</p>
            <h2 id="local-corner-heading" className="mt-1 text-xl font-semibold text-text">
              People behind local AI
            </h2>
            <p className="mt-1 max-w-2xl text-[0.9375rem] text-muted">
              A small, rotating look at people whose public work helps others run AI models on their own hardware.
            </p>
          </div>
          <Link prefetch={false} href="/local/" className="link inline-flex items-center gap-1 text-[0.9375rem]">
            Read their profiles <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {people.map((p) => (
            <li key={p.slug}>
              <Link
                prefetch={false}
                href={`/local/#${p.slug}`}
                className="flex h-full items-start gap-3 rounded-xl border border-line bg-[rgba(8,14,30,0.6)] p-3 hover:border-line-strong"
              >
                <InitialsTile initials={p.initials} />
                <span className="min-w-0">
                  <span className="block font-medium leading-snug text-text">{p.name}</span>
                  <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{p.headline}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
