import Link from "next/link";
import { notFound } from "next/navigation";
import { EntryActions } from "@/components/EntryActions";
import { NEWS_CATEGORY_LABELS, RelatedRecords, newsHref } from "@/components/NewsList";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Breadcrumbs } from "@/components/PageHeader";
import { SourceRefs, SourcesList } from "@/components/Sources";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCatalog().news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getCatalog().newsItem(slug);
  if (!item) return {};
  return pageMetadata({ title: item.title, description: item.summary.text.slice(0, 200), path: newsHref(item.slug) });
}

export default async function NewsItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const item = catalog.newsItem(slug);
  if (!item) notFound();
  return (
    <>
      <article>
        <header className="border-b border-line bg-[linear-gradient(180deg,rgba(11,18,36,0.6),transparent)]">
          <div className="container-page pb-10 pt-10 sm:pt-12">
            <Breadcrumbs items={[{ href: "/news/", label: "Latest news" }]} />
            <p className="eyebrow">{NEWS_CATEGORY_LABELS[item.category]}</p>
            <h1 className="mt-2 max-w-4xl text-3xl font-semibold text-text sm:text-4xl">{item.title}</h1>
            <p className="meta mt-4">
              Event: <time dateTime={item.event_date}>{formatDate(item.event_date)}</time> · Published:{" "}
              <time dateTime={item.published_at}>{formatDate(item.published_at)}</time>
            </p>
          </div>
        </header>
        <div className="container-page grid gap-10 py-10">
          <p className="max-w-3xl text-lg text-[#d5def2]">
            {item.summary.text}
            <SourceRefs ids={item.summary.source_ids} sources={item.sources} />
          </p>
          <section aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-xl font-semibold text-text">
              Related catalog entries
            </h2>
            <div className="mt-3">
              <RelatedRecords item={item} catalog={catalog} />
            </div>
          </section>
          <section aria-labelledby="sources-heading">
            <h2 id="sources-heading" className="text-xl font-semibold text-text">
              Sources
            </h2>
            <div className="mt-4">
              <SourcesList sources={item.sources} />
            </div>
          </section>
          <div className="grid gap-4 border-t border-line pt-8">
            <EntryActions contentPath={`content/news/${item.slug}.yml`} title={item.title} />
            <p className="text-[0.9375rem]">
              <Link prefetch={false} href="/news/" className="link">
                All news
              </Link>
            </p>
          </div>
          <NewsletterSignup variant="compact" />
        </div>
      </article>
      <SupportPanel variant="compact" />
    </>
  );
}
