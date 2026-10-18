import Link from "@/components/Link";
import { Star } from "lucide-react";
import { formatDate } from "@/lib/dates";
import { licenseLabel, type GithubListItem } from "@/lib/github/directory";
import { heroHue } from "@/lib/github/hero";

const nf = (v: number) => v.toLocaleString("en-US");

/**
 * One ranked project. Descriptions are third-party text from GitHub and are
 * rendered as plain text only. The rank tile takes the hue of the project's
 * hero image, so the list and the page belong together.
 */
export function GithubRow({ item, level = 2 }: { item: GithubListItem; level?: 2 | 3 }) {
  const hue = heroHue(item.fullName);
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <article className="card card-link relative flex gap-3 p-4 sm:gap-4 sm:p-5">
      <span
        aria-hidden="true"
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${item.rank >= 1000 ? "text-[0.6875rem]" : "text-sm"} font-semibold tabular-nums text-[#1b2a38] sm:h-12 sm:w-12`}
        style={{ background: `linear-gradient(135deg, hsl(${hue} 65% 94%), hsl(${(hue + 40) % 360} 70% 84%))`, boxShadow: `inset 0 0 0 1px hsl(${hue} 40% 78%)` }}
      >
        {item.rank.toLocaleString("en-US")}
      </span>
      <div className="min-w-0 flex-1">
        <Heading className="text-[1.0625rem] font-semibold leading-snug text-text [overflow-wrap:anywhere]">
          <span className="sr-only">Rank {nf(item.rank)}: </span>
          <Link prefetch={false} href={`/github/${item.slug}/`} className="after:absolute after:inset-0 after:content-['']">
            <span className="font-normal text-muted">{item.owner}/</span>
            {item.name}
          </Link>
        </Heading>
        {item.description ? <p className="mt-1 line-clamp-2 text-[0.9375rem] text-body [overflow-wrap:anywhere]">{item.description}</p> : null}
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1 font-medium text-text">
            <Star aria-hidden="true" className="h-3.5 w-3.5 text-tone-amber" />
            {nf(item.stars)}
            <span className="sr-only"> stars</span>
          </span>
          {item.language ? <span>{item.language}</span> : null}
          <span>{licenseLabel(item.license)}</span>
          <span>Last push {formatDate(item.pushedAt)}</span>
        </p>
      </div>
    </article>
  );
}

export function GithubRows({ items, start }: { items: GithubListItem[]; start?: number }) {
  return (
    <ol className="mt-4 grid gap-3" start={start} data-testid="github-list">
      {items.map((item) => (
        <li key={item.slug}>
          <GithubRow item={item} />
        </li>
      ))}
    </ol>
  );
}

/** Links to every page of the ranking, so each project is reachable without JavaScript. */
export function GithubPagination({ current, count, total, pageSize }: { current: number; count: number; total: number; pageSize: number }) {
  if (count <= 1) return null;
  const href = (n: number) => (n <= 1 ? "/github/" : `/github/page/${n}/`);
  return (
    <nav aria-label="Ranking pages" className="mt-8">
      <p className="meta">All {nf(total)} projects, {pageSize} per page:</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {Array.from({ length: count }, (_, i) => i + 1).map((n) => {
          const from = (n - 1) * pageSize + 1;
          const to = Math.min(n * pageSize, total);
          return (
            <li key={n}>
              <Link
                prefetch={false}
                href={href(n)}
                aria-current={n === current ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full border px-4 text-[0.9375rem] tabular-nums ${n === current ? "border-cyan bg-cyan/10 text-text" : "border-line text-muted hover:border-line-strong hover:text-text"}`}
              >
                #{nf(from)}–{nf(to)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
