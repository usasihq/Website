import Link from "@/components/Link";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata, socialImages } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/paths";
import { schoolIndexSeo } from "@/lib/people-seo";
import { schoolPeopleLists } from "@/lib/people-schools";
import { itemList } from "@/lib/structured-data";

const lists = schoolPeopleLists(getCatalog());
const peopleCount = new Set(lists.flatMap((l) => l.items.map((i) => i.href))).size;
const seo = schoolIndexSeo(lists.length, peopleCount);

export const metadata = pageMetadata({
  title: seo.title,
  description: seo.description,
  path: "/people/school/",
  image: socialImages.people,
});

export default function PeopleBySchoolPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "People by school",
          url: absoluteUrl("/people/school/"),
          mainEntity: itemList({
            name: "People by school",
            path: "/people/school/",
            items: lists.map((l) => ({ name: l.name, href: l.path })),
          }),
        }}
      />
      <PageHeader
        eyebrow="People"
        title="People by school"
        crumbs={[{ href: "/people/", label: "People" }]}
        current={{ href: "/people/school/", label: "People by school" }}
        description={
          <p>
            Universities that appear as a sourced alma mater or academic role on USASI people profiles. A school is listed when at least five
            people are clearly tied to it. Listed by number of people, then alphabetically; this is not a ranking.
          </p>
        }
      />
      <div className="container-page py-10 sm:py-12">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="people-school-index">
          {lists.map((l) => (
            <li key={l.path} className="card p-5">
              <h2 className="font-semibold text-text">
                <Link prefetch={false} href={l.path} className="link">
                  {l.name}
                </Link>
              </h2>
              <p className="mt-1.5 text-[0.9375rem] text-body">
                {l.items.length} sourced {l.items.length === 1 ? "profile" : "profiles"}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
