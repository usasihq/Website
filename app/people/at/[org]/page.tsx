import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { PeopleListPage } from "@/components/PeopleListPage";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata, socialImages } from "@/lib/metadata";
import { PERSON_SPECIALTY_LABELS } from "@/lib/people";
import { organizationPeopleLists, peopleFieldHref } from "@/lib/people-lists";
import { orgHref } from "@/lib/routes";
import { shortName } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return organizationPeopleLists(getCatalog()).map((l) => ({ org: l.slug }));
}

const find = async (params: Promise<{ org: string }>) => {
  const slug = (await params).org;
  return organizationPeopleLists(getCatalog()).find((l) => l.slug === slug);
};

export async function generateMetadata({ params }: { params: Promise<{ org: string }> }) {
  const list = await find(params);
  if (!list) return {};
  const n = list.items.length;
  return pageMetadata({
    title: `AI people at ${shortName(list.name)} — ${n} sourced profiles`,
    description: `${n} people tied to ${list.name} in the USASI catalog: founders, researchers, engineers, and maintainers, with roles and work cited to official pages. Listed alphabetically.`,
    path: list.path,
    image: socialImages.people,
  });
}

export default async function PeopleAtOrganizationPage({ params }: { params: Promise<{ org: string }> }) {
  const list = await find(params);
  if (!list) notFound();
  const fields = [...new Set(list.items.flatMap((i) => i.specialties))].slice(0, 8);
  return (
    <PeopleListPage
      title={`People at ${list.name}`}
      path={list.path}
      items={list.items}
      roleFor={(i) => {
        const roles = i.organizations.filter((o) => o.slug === list.slug);
        const r = roles.find((o) => o.current) ?? roles[0];
        return r ? `${r.role}${r.current ? "" : " (earlier role)"}` : null;
      }}
      intro={
        <p>
          {list.items.length} people in the USASI People directory whose sourced profiles document a current or earlier role at{" "}
          <Link prefetch={false} href={orgHref(list.slug)} className="link">
            {list.name}
          </Link>
          {list.current ? `; ${list.current} of them in a current role` : ""}. Current roles are listed first, then alphabetically. Each profile covers
          public professional work only. This is not a ranking.
        </p>
      }
      related={fields.map((f) => ({ href: peopleFieldHref(f), label: PERSON_SPECIALTY_LABELS[f] }))}
    />
  );
}
