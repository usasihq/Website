import Link from "next/link";
import { NewsCard } from "@/components/NewsList";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Latest news",
  description:
    "Dated, sourced updates about the U.S. AI organizations and open artifacts in the USASI catalog: releases, license changes, ownership, and governance.",
  path: "/news/",
});

export default function NewsPage() {
  const catalog = getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="Latest news"
        title="What changed in the catalog"
        description={
          <>
            <p>
              Short, dated updates about the organizations and open artifacts in this catalog — releases, license changes, ownership, and
              governance. Each item is written from primary sources, linked to the entries it affects, and follows the same evidence rules as the
              catalog. No funding figures, valuations, or rankings.
            </p>
            <p className="mt-3 text-[0.9375rem]">
              Items are researched and published daily by an automated AI assistant and checked by automated validation, without individual
              human review first.{" "}
              <Link href="/methodology/#news" className="link">
                How news works
              </Link>
              .
            </p>
          </>
        }
      />
      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_20rem]">
        <div>
          {catalog.news.length === 0 ? (
            <p className="text-muted">No news items have been published yet.</p>
          ) : (
            <ol className="border-t border-line">
              {catalog.news.map((item) => (
                <li key={item.slug}>
                  <NewsCard item={item} catalog={catalog} headingLevel={2} />
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <NewsletterSignup />
        </div>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
