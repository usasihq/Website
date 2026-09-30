import Link from "next/link";
import type { Catalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { artifactHref, orgHref } from "@/lib/routes";
import type { NewsCategory, NewsItem } from "@/lib/schema";

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  release: "Release",
  license: "License change",
  acquisition: "Ownership",
  governance: "Governance",
  catalog: "Catalog update",
  research: "Research",
  policy: "Policy",
};

export const newsHref = (slug: string) => `/news/${slug}/`;

/** Related catalog records as links (published records only). */
export function RelatedRecords({ item, catalog }: { item: NewsItem; catalog: Catalog }) {
  const orgs = item.related_organizations.map((s) => catalog.organization(s)).filter((o) => o && catalog.isActiveOrganization(o.slug));
  const arts = item.related_artifacts.map((s) => catalog.artifact(s)).filter((a) => a && catalog.isActiveArtifact(a.slug));
  if (orgs.length + arts.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Related catalog entries">
      {orgs.map((o) => (
        <li key={o!.slug}>
          <Link prefetch={false} href={orgHref(o!.slug)} className="badge hover:border-cyan">
            {o!.name}
          </Link>
        </li>
      ))}
      {arts.map((a) => (
        <li key={a!.slug}>
          <Link prefetch={false} href={artifactHref(a!.slug)} className="badge hover:border-cyan">
            {a!.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function NewsCard({ item, catalog, headingLevel = 3 }: { item: NewsItem; catalog: Catalog; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="border-b border-line py-5" data-news={item.slug}>
      <p className="meta text-[0.8125rem]">
        <time dateTime={item.event_date}>{formatDate(item.event_date)}</time> · {NEWS_CATEGORY_LABELS[item.category]}
      </p>
      <Heading className="mt-1 text-lg font-semibold leading-snug text-text">
        <Link prefetch={false} href={newsHref(item.slug)} className="hover:underline hover:decoration-cyan hover:underline-offset-4">
          {item.title}
        </Link>
      </Heading>
      <p className="mt-2 max-w-3xl text-[0.9375rem] text-[#c7d2ea]">{item.summary.text}</p>
      <div className="mt-3">
        <RelatedRecords item={item} catalog={catalog} />
      </div>
    </article>
  );
}
