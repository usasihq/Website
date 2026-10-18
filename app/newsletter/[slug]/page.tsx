import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { InlineText } from "@/components/InlineText";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Breadcrumbs } from "@/components/PageHeader";
import { ExternalLink } from "@/components/ExternalLink";
import { ShareCite } from "@/components/ShareCite";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/metadata";
import { cardImage } from "@/lib/page-cards";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCatalog().newsletter.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const issue = getCatalog().newsletterIssue(slug);
  if (!issue) return {};
  return pageMetadata({
    title: issue.subject,
    description: issue.preview,
    path: `/newsletter/${issue.slug}/`,
    image: cardImage(getCatalog(), `/newsletter/${issue.slug}/`),
    feeds: [{ path: "/newsletter/feed.xml", title: "The USASI weekly" }],
  });
}

export default async function NewsletterIssuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const issue = catalog.newsletterIssue(slug);
  if (!issue) notFound();
  const newer = catalog.newsletter.find((n) => n.number === issue.number + 1);
  const older = catalog.newsletter.find((n) => n.number === issue.number - 1);
  return (
    <>
      <article>
        <header className="border-b border-line bg-[linear-gradient(180deg,var(--hero-tint),transparent)]">
          <div className="container-page pb-10 pt-10 sm:pt-12">
            <Breadcrumbs items={[{ href: "/newsletter/", label: "The USASI weekly" }]} current={{ href: `/newsletter/${issue.slug}/`, label: issue.subject }} />
            <p className="eyebrow">The USASI weekly · Issue {issue.number}</p>
            <h1 className="mt-2 max-w-4xl text-3xl font-semibold text-text sm:text-4xl">{issue.subject}</h1>
            <p className="mt-3 max-w-3xl text-lg text-muted">{issue.preview}</p>
            <p className="meta mt-4">
              Emailed <time dateTime={issue.sent_at}>{formatDate(issue.sent_at)}</time> · Covers{" "}
              <time dateTime={issue.covers.from}>{formatDate(issue.covers.from)}</time> to <time dateTime={issue.covers.to}>{formatDate(issue.covers.to)}</time>
            </p>
          </div>
        </header>
        <div className="container-page grid gap-10 py-10">
          <div className="max-w-3xl space-y-4 text-[1.0625rem] leading-relaxed text-body">
            {issue.intro.map((t, i) => (
              <p key={i}>
                <InlineText text={t} />
              </p>
            ))}
            {issue.sections.map((s, si) => (
              <section key={si} aria-labelledby={`section-${si}`} className="pt-4">
                <h2 id={`section-${si}`} className="text-xl font-semibold text-text">
                  {s.heading}
                </h2>
                {s.intro ? (
                  <p className="mt-3">
                    <InlineText text={s.intro} />
                  </p>
                ) : null}
                {s.items.length ? (
                  <ul className="mt-3 list-disc space-y-2 pl-6 marker:text-cyan">
                    {s.items.map((t, i) => (
                      <li key={i}>
                        <InlineText text={t} />
                      </li>
                    ))}
                  </ul>
                ) : null}
                {s.note ? (
                  <p className="mt-3">
                    <InlineText text={s.note} />
                  </p>
                ) : null}
              </section>
            ))}
            {issue.closing.map((t, i) => (
              <p key={i} className="pt-2">
                <InlineText text={t} />
              </p>
            ))}
          </div>
          <p className="max-w-3xl text-[0.9375rem] text-muted">
            This is the issue as it was emailed, with links pointing to this site. Pages it links to may have been updated since; each shows its
            own review date.
            {issue.web_url ? (
              <>
                {" "}
                <ExternalLink href={issue.web_url}>The emailed version on beehiiv</ExternalLink>.
              </>
            ) : null}
          </p>
          <NewsletterSignup />
          <nav aria-label="More issues" className="flex flex-wrap justify-between gap-4 border-t border-line pt-6 text-[0.9375rem]">
            {older ? (
              <Link prefetch={false} href={`/newsletter/${older.slug}/`} className="link">
                ← Issue {older.number}
              </Link>
            ) : (
              <span />
            )}
            <Link prefetch={false} href="/newsletter/#issues" className="link">
              All issues
            </Link>
            {newer ? (
              <Link prefetch={false} href={`/newsletter/${newer.slug}/`} className="link">
                Issue {newer.number} →
              </Link>
            ) : (
              <span />
            )}
          </nav>
          <ShareCite path={`/newsletter/${issue.slug}/`} title={issue.subject} date={issue.sent_at} citeKey={`newsletter_${issue.slug}`} feed="/newsletter/feed.xml" />
        </div>
      </article>
      <SupportPanel variant="compact" />
    </>
  );
}
