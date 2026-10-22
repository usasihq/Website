import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { PeopleListPage } from "@/components/PeopleListPage";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata, socialImages } from "@/lib/metadata";
import { fieldPeopleLists, peopleFieldHref } from "@/lib/people-lists";
import { PERSON_SPECIALTY_LABELS } from "@/lib/people";
import { schoolListSeo } from "@/lib/people-seo";
import { peopleSchoolIndexHref, schoolBySlug, schoolPeopleLists } from "@/lib/people-schools";
import { orgHref } from "@/lib/routes";

export const dynamicParams = false;

export function generateStaticParams() {
  return schoolPeopleLists(getCatalog()).map((l) => ({ slug: l.slug }));
}

const find = async (params: Promise<{ slug: string }>) => {
  const slug = (await params).slug;
  return schoolPeopleLists(getCatalog()).find((l) => l.slug === slug);
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const list = await find(params);
  if (!list) return {};
  const seo = schoolListSeo(list);
  return pageMetadata({ title: seo.title, description: seo.description, path: list.path, image: socialImages.people });
}

export default async function PeopleAtSchoolPage({ params }: { params: Promise<{ slug: string }> }) {
  const list = await find(params);
  if (!list) notFound();
  const school = schoolBySlug(list.slug);
  const fields = [...new Set(list.items.flatMap((i) => i.specialties))].slice(0, 8);
  const fieldPages = new Set(fieldPeopleLists(getCatalog()).map((l) => l.slug));
  return (
    <PeopleListPage
      title={`People from ${list.shortName}`}
      path={list.path}
      crumbs={[
        { href: "/people/", label: "People" },
        { href: peopleSchoolIndexHref(), label: "People by school" },
      ]}
      items={list.items}
      roleFor={(i) => {
        const o = i.organizations.find((x) => x.current) ?? i.organizations[0];
        return o ? `${o.role}, ${o.name}` : null;
      }}
      intro={
        <p>
          {list.items.length} people in the USASI People directory whose sourced profiles document study or an academic role at {list.name}.
          Listed alphabetically; this is not a ranking. Each profile covers public professional work only
          {school?.organizationSlug ? (
            <>
              . See also{" "}
              <Link prefetch={false} href={orgHref(school.organizationSlug)} className="link">
                {list.name}
              </Link>{" "}
              in the catalog
            </>
          ) : null}
          .
        </p>
      }
      related={[
        { href: peopleSchoolIndexHref(), label: "All schools" },
        ...fields.filter((f) => fieldPages.has(f)).map((f) => ({ href: peopleFieldHref(f), label: PERSON_SPECIALTY_LABELS[f] })),
      ]}
    />
  );
}
