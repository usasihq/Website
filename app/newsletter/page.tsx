import Link from "@/components/Link";
import { Mail, Rss } from "lucide-react";
import Content from "@/content/pages/newsletter.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/metadata";
import { asset } from "@/lib/paths";
import { siteConfig } from "@/lib/site-config";

export const metadata = pageMetadata({
  title: "The USASI weekly",
  description:
    "A weekly email summing up new catalog records, releases, license changes, corrections, and new explainers, each linked to its sourced page.",
  path: "/newsletter/",
  feeds: [{ path: "/newsletter/feed.xml", title: "The USASI weekly" }],
});

export default function NewsletterPage() {
  const { heading, description, provider, url } = siteConfig.newsletter;
  const issues = getCatalog().newsletter;
  return (
    <EditorialPage
      eyebrow="Weekly email"
      title={heading}
      description={<p>{description}</p>}
      headerExtra={
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          {url ? (
            <a href={url} className="btn btn-primary self-start" rel="noopener noreferrer" data-testid="newsletter-subscribe">
              <Mail aria-hidden="true" className="h-4 w-4" />
              Subscribe{provider ? ` on ${provider}` : ""}
              <span className="sr-only"> (external site)</span>
            </a>
          ) : (
            <p className="self-start rounded-lg border border-dashed border-line-strong px-3 py-2 text-[0.9375rem] text-ice">
              The weekly email is coming soon.
            </p>
          )}
          <a href={asset("/news/feed.xml")} className="link inline-flex items-center gap-1 text-[0.9375rem]" type="application/rss+xml">
            <Rss aria-hidden="true" className="h-4 w-4" /> RSS feed, no signup
          </a>
          <Link prefetch={false} href="/feeds/" className="link text-[0.9375rem]">
            All feeds
          </Link>
        </div>
      }
      aside={
        <section id="issues" aria-labelledby="issues-heading" className="mt-12 max-w-3xl scroll-mt-28">
          <h2 id="issues-heading" className="text-2xl font-semibold text-text">
            Past issues
          </h2>
          {issues.length === 0 ? (
            <p className="mt-3 text-muted">No issues have been sent yet.</p>
          ) : (
            <ol className="mt-4 divide-y divide-line border-y border-line" data-testid="newsletter-issues">
              {issues.map((n) => (
                <li key={n.slug} className="py-4">
                  <p className="meta">
                    Issue {n.number} · Emailed <time dateTime={n.sent_at}>{formatDate(n.sent_at)}</time>
                  </p>
                  <Link prefetch={false} href={`/newsletter/${n.slug}/`} className="link mt-1 inline-block text-lg font-medium">
                    {n.subject}
                  </Link>
                  <p className="mt-1 text-[0.9375rem] text-muted">{n.preview}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      }
    >
      <Content />
    </EditorialPage>
  );
}
