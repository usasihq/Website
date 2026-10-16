import Link from "@/components/Link";
import { Rss } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
import { asset } from "@/lib/paths";

export const metadata = pageMetadata({
  title: "Follow USASI by RSS",
  description: "RSS feeds for USASI news, the weekly email, the changelog, each topic hub, and every company and open model or tool in the catalog. No account needed.",
  path: "/feeds/",
  feeds: [
    { path: "/news/feed.xml", title: "USASI — Latest news" },
    { path: "/newsletter/feed.xml", title: "The USASI weekly" },
    { path: "/changelog/feed.xml", title: "USASI — Changelog" },
  ],
});

const SITE_FEEDS = [
  { path: "/news/feed.xml", title: "Latest news", note: "Every dated, sourced news item, as it is published." },
  { path: "/newsletter/feed.xml", title: "The USASI weekly", note: "Each weekly email issue, archived on the site as it was sent." },
  { path: "/changelog/feed.xml", title: "Changelog", note: "New records, corrections, and changes to the site." },
];

export default function FeedsPage() {
  const catalog = getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="Follow"
        title="Follow USASI by RSS"
        description={
          <p>
            Feeds need no account and no email address: add a feed&rsquo;s address to any feed reader. Every item links to a page on this site where
            each statement cites its source.
          </p>
        }
      />
      <div className="container-page grid gap-12 py-10">
        <section aria-labelledby="site-feeds-heading" className="max-w-3xl">
          <h2 id="site-feeds-heading" className="text-2xl font-semibold text-text">
            Site-wide feeds
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {SITE_FEEDS.map((f) => (
              <li key={f.path} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
                <div>
                  <a href={asset(f.path)} className="link inline-flex items-center gap-1.5 text-lg font-medium" type="application/rss+xml">
                    <Rss aria-hidden="true" className="h-4 w-4 text-cyan" />
                    {f.title}
                  </a>
                  <p className="text-[0.9375rem] text-muted">{f.note}</p>
                </div>
                <code className="font-mono text-[0.8125rem] text-ice">{f.path}</code>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="hub-feeds-heading" className="max-w-3xl">
          <h2 id="hub-feeds-heading" className="text-2xl font-semibold text-text">
            Topic feeds
          </h2>
          <p className="mt-2 text-muted">News about the organizations and records each hub features.</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {catalog.hubs.map((h) => (
              <li key={h.slug}>
                <a href={asset(`/hubs/${h.slug}/feed.xml`)} className="link inline-flex items-center gap-1.5" type="application/rss+xml">
                  <Rss aria-hidden="true" className="h-4 w-4 text-cyan" />
                  {h.title}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="record-feeds-heading" className="max-w-3xl">
          <h2 id="record-feeds-heading" className="text-2xl font-semibold text-text">
            A feed for every company and open model or tool
          </h2>
          <p className="mt-2 text-muted">
            Each of the {catalog.organizations.length} organizations and {catalog.artifacts.length} open models and tools in the catalog has its own feed of
            news that mentions it. Find the &ldquo;RSS updates&rdquo; link in the &ldquo;Share or cite this page&rdquo; box near the end of its page, or add{" "}
            <code className="font-mono text-[0.875rem] text-ice">feed.xml</code> to the page address, for example{" "}
            <a href={asset("/companies/ai2/feed.xml")} className="link" type="application/rss+xml">
              /companies/ai2/feed.xml
            </a>
            .
          </p>
          <p className="mt-3 text-muted">
            Prefer email? <Link href="/newsletter/" className="link">The USASI weekly</Link> sums up each week in one message.
          </p>
        </section>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
