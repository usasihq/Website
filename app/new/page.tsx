import Link from "@/components/Link";
import { Rss } from "lucide-react";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/metadata";
import { NEW_DAYS, NEW_HREF, newThisWeek, type Tracked } from "@/lib/new-this-week";
import { asset } from "@/lib/paths";
import { changelogAnchor } from "@/lib/rss";
import type { GithubEntry } from "@/lib/github/projects";
import type { HfEntry } from "@/lib/huggingface/items";

const n = (v: number) => v.toLocaleString("en-US");
const FEED = `${NEW_HREF}feed.xml`;

export function generateMetadata() {
  const w = newThisWeek(getCatalog());
  return pageMetadata({
    title: "New this week",
    description: `What USASI added from ${formatDate(w.from)} to ${formatDate(w.to)}: catalog records, news, projects new in the GitHub and Hugging Face rankings, and new AI job listings by employer.`,
    path: NEW_HREF,
    feeds: [{ path: FEED, title: "USASI — New this week" }],
  });
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`${id}-heading`} className="max-w-4xl" data-testid={`new-${id}`}>
      <h2 id={`${id}-heading`} className="text-xl font-semibold text-text sm:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

const Day = ({ date }: { date: string }) => (
  <time dateTime={date} className="shrink-0 text-sm tabular-nums text-muted">
    {formatDate(date.slice(0, 10))}
  </time>
);

function TrackedList<T extends GithubEntry | HfEntry>({ data, noun, label }: { data: Tracked<T>; noun: string; label: (e: T) => string }) {
  if (!data.trackingSince) return <p className="mt-3 text-muted">This snapshot does not record when {noun} first appear yet.</p>;
  const since = formatDate(data.trackingSince.slice(0, 10));
  if (!data.items.length)
    return (
      <p className="mt-3 text-muted">
        None this week. Tracking started with the {since} snapshot: {noun} that enter the ranking after it are listed here with the date of the fetch that
        added them. The snapshot is refreshed about once a week.
      </p>
    );
  return (
    <>
      <p className="mt-2 text-sm text-muted">Newly in the ranking, by the date of the fetch that added them (tracked since {since}).</p>
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {data.items.map((e) => (
          <li key={e.href} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
            <Link prefetch={false} href={e.href} className="link font-medium [overflow-wrap:anywhere]">
              {"full_name" in e ? e.full_name : e.id}
            </Link>
            <span className="text-sm text-muted">{label(e)}</span>
            <Day date={e.first_seen!} />
          </li>
        ))}
      </ul>
    </>
  );
}

export default function NewThisWeekPage() {
  const catalog = getCatalog();
  const w = newThisWeek(catalog);
  return (
    <>
      <PageHeader
        eyebrow="What changed"
        title="New this week"
        description={
          <p>
            Everything USASI added in the {NEW_DAYS} days from {formatDate(w.from)} to {formatDate(w.to)}, the date this page was built. Each entry is dated
            and links to its page.{" "}
            <a href={asset(FEED)} className="link inline-flex items-center gap-1" type="application/rss+xml">
              <Rss aria-hidden="true" className="h-4 w-4" />
              RSS feed
            </a>
          </p>
        }
      />
      <div className="container-page grid gap-12 py-10">
        <Section id="catalog" title="Added to the catalog">
          {w.records.length ? (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {w.records.map((r) => (
                <li key={`${r.kind}-${r.slug}`} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                  <span>
                    <Link prefetch={false} href={r.href} className="link font-medium">
                      {r.name}
                    </Link>{" "}
                    <span className="text-sm text-muted">· {r.kind === "organization" ? "Organization" : "Open model or tool"}</span>
                    {r.note ? <span className="block text-sm text-muted">{r.note}</span> : null}
                  </span>
                  <Day date={r.date} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-muted">No organization or open model or tool was added this week.</p>
          )}
          {w.siteNotes.length ? (
            <>
              <h3 className="mt-6 text-base font-semibold text-text">Other additions: site features and people profiles</h3>
              <p className="mt-1 text-sm text-muted">As the changelog records them (profiles carry no separate &ldquo;added&rdquo; date).</p>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {w.siteNotes.map((s, i) => (
                  <li key={`${s.date}-${i}`} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                    <span className="text-[0.9375rem] text-text">{s.note}</span>
                    <Day date={s.date} />
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {w.changelog.length ? (
            <details className="mt-4">
              <summary className="min-h-11 cursor-pointer text-ice">This week&rsquo;s changelog entries ({n(w.changelog.length)})</summary>
              <ul className="mt-2 space-y-2">
                {w.changelog.map((c) => (
                  <li key={`${c.date}-${c.title}`} className="text-[0.9375rem]">
                    <Link prefetch={false} href={`/changelog/#${changelogAnchor(c)}`} className="link">
                      {c.title}
                    </Link>{" "}
                    <span className="text-sm text-muted">({formatDate(c.date)})</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </Section>

        <Section id="news" title="News">
          {w.news.length ? (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {w.news.map((item) => (
                <li key={item.slug} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                  <Link prefetch={false} href={`/news/${item.slug}/`} className="link font-medium">
                    {item.title}
                  </Link>
                  <Day date={item.published_at} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-muted">No news item was published this week.</p>
          )}
        </Section>

        <Section id="github" title="New on AI on GitHub">
          <TrackedList data={w.github} noun="projects" label={(e) => `${n((e as GithubEntry).stars)} stars`} />
        </Section>

        <Section id="huggingface" title="New on AI on Hugging Face">
          <h3 className="mt-3 text-base font-semibold text-text">Models</h3>
          <TrackedList data={w.hfModels} noun="models" label={(e) => `${n(e.likes)} likes`} />
          <h3 className="mt-6 text-base font-semibold text-text">Datasets</h3>
          <TrackedList data={w.hfDatasets} noun="datasets" label={(e) => `${n(e.likes)} likes`} />
        </Section>

        <Section id="jobs" title="New job listings, by employer">
          <p className="mt-2 text-muted">
            {w.jobs.total
              ? `${n(w.jobs.total)} current listings were first seen in employers' job feeds this week, at ${n(w.jobs.employers.length)} ${w.jobs.employers.length === 1 ? "employer" : "employers"}.`
              : "No current listing was first seen this week."}{" "}
            &ldquo;First seen&rdquo; is when USASI first read the listing, so an employer whose job board was first collected this week counts all of its listings.
          </p>
          {w.jobs.employers.length ? (
            <div className="mt-4 overflow-x-auto rounded-xl border border-line" tabIndex={0} role="region" aria-label="New job listings by employer">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Current listings first seen this week, by employer</caption>
                <thead className="bg-fog/60 text-muted">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">Employer</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">New listings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {w.jobs.employers.map((e) => (
                    <tr key={e.slug}>
                      <th scope="row" className="px-3 py-2 font-medium">
                        <Link prefetch={false} href={`/jobs/at/${e.slug}/`} className="link">
                          {e.name}
                        </Link>
                      </th>
                      <td className="px-3 py-2 text-right tabular-nums text-text">{n(e.count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          <p className="mt-3 text-sm">
            <Link prefetch={false} href="/jobs/?posted=7&sort=newest" className="link">
              Jobs posted in the last 7 days
            </Link>{" "}
            · <Link prefetch={false} href="/feeds/#job-feeds" className="link">Job feeds (RSS)</Link>
          </p>
        </Section>

        <div className="max-w-4xl">
          <NewsletterSignup />
        </div>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
