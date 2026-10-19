import Link from "@/components/Link";
import { NewsDirectory } from "@/components/NewsDirectory";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata, socialImages } from "@/lib/metadata";
import type { NewsListItem } from "@/lib/news-list";
import { asset } from "@/lib/paths";
import { artifactHref, orgHref } from "@/lib/routes";

export const metadata = pageMetadata({
  title: "U.S. AI news: releases, licenses & policy, with sources",
  description:
    "Dated, sourced updates about the U.S. AI organizations and open artifacts in the USASI catalog: releases, license changes, ownership, and governance.",
  path: "/news/",
  image: socialImages.news,
  feeds: [{ path: "/news/feed.xml", title: "USASI — Latest news" }],
});

export default function NewsPage() {
  const catalog = getCatalog();
  const items: NewsListItem[] = catalog.news.map((n) => {
    const orgs = n.related_organizations.filter((s) => catalog.isActiveOrganization(s));
    const arts = n.related_artifacts.filter((s) => catalog.isActiveArtifact(s));
    const viaArtifacts = arts.flatMap((s) => catalog.artifact(s)?.organization_slugs ?? []).filter((s) => catalog.isActiveOrganization(s));
    return {
      slug: n.slug,
      title: n.title,
      event_date: n.event_date,
      published_at: n.published_at,
      category: n.category,
      summary: n.summary.text,
      related: [
        ...orgs.map((s) => ({ href: orgHref(s), name: catalog.organization(s)!.name, slug: s, kind: "organization" as const })),
        ...arts.map((s) => ({ href: artifactHref(s), name: catalog.artifact(s)!.name, slug: s, kind: "artifact" as const })),
      ],
      organizations: [...new Set([...orgs, ...viaArtifacts])],
    };
  });
  const orgSlugs = new Set(items.flatMap((i) => i.organizations));
  const organizations = catalog.organizations.filter((o) => orgSlugs.has(o.slug)).map((o) => ({ slug: o.slug, name: o.name }));
  return (
    <>
      <PageHeader
        eyebrow="Latest news"
        title="What changed in the catalog"
        description={
          <>
            <p>
              Short, dated updates about the organizations and open artifacts in this catalog: releases, license changes, ownership, research, and
              policy. Each item is written from primary sources, linked to the entries it affects, and follows the same evidence rules as the catalog.
              No funding figures, valuations, or rankings. Items are listed by the date of the event, newest first.
            </p>
            <p className="mt-3 text-[0.9375rem]">
              Items are researched and published daily by an automated AI assistant and checked by automated validation, without individual
              human review first.{" "}
              <Link href="/methodology/#news" className="link">
                How news works
              </Link>
              {" · "}
              <a href={asset("/news/feed.xml")} className="link">
                RSS feed
              </a>
              .
            </p>
          </>
        }
      />
      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          {items.length === 0 ? <p className="text-muted">No news items have been published yet.</p> : <NewsDirectory items={items} organizations={organizations} />}
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <NewsletterSignup />
        </div>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
