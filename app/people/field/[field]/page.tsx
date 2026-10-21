import { notFound } from "next/navigation";
import { PeopleListPage } from "@/components/PeopleListPage";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata, socialImages } from "@/lib/metadata";
import { fieldPeopleLists, organizationPeopleLists } from "@/lib/people-lists";
import { shortName } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return fieldPeopleLists(getCatalog()).map((l) => ({ field: l.slug }));
}

const find = async (params: Promise<{ field: string }>) => {
  const slug = (await params).field;
  return fieldPeopleLists(getCatalog()).find((l) => l.slug === slug);
};

export async function generateMetadata({ params }: { params: Promise<{ field: string }> }) {
  const list = await find(params);
  if (!list) return {};
  const n = list.items.length;
  return pageMetadata({
    title: `${list.name}: ${n} AI researchers and builders`,
    description: `${n} sourced profiles of people working on ${list.name.toLowerCase()} at U.S. AI organizations and open projects: roles, work, and links to official pages. Listed alphabetically.`,
    path: list.path,
    image: socialImages.people,
  });
}

export default async function PeopleInFieldPage({ params }: { params: Promise<{ field: string }> }) {
  const list = await find(params);
  if (!list) notFound();
  const catalog = getCatalog();
  const orgLists = new Map(organizationPeopleLists(catalog).map((l) => [l.slug, l]));
  const orgCounts = new Map<string, number>();
  for (const i of list.items) for (const o of i.organizations) if (o.current && o.slug && orgLists.has(o.slug)) orgCounts.set(o.slug, (orgCounts.get(o.slug) ?? 0) + 1);
  const topOrgs = [...orgCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8);
  return (
    <PeopleListPage
      title={`People in ${list.name.toLowerCase()}`}
      path={list.path}
      items={list.items}
      roleFor={(i) => {
        const o = i.organizations.find((x) => x.current) ?? i.organizations[0];
        return o ? `${o.role}, ${shortName(o.name)}` : null;
      }}
      intro={
        <p>
          {list.items.length} people in the USASI People directory whose profiles list {list.name.toLowerCase()} as a field of their work. Listed
          alphabetically; this is not a ranking. Each profile covers public professional work only, cited to official pages.
        </p>
      }
      related={topOrgs.map(([slug]) => ({ href: orgLists.get(slug)!.path, label: `People at ${shortName(orgLists.get(slug)!.name)}` }))}
    />
  );
}
