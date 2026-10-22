import Link from "@/components/Link";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { PeopleDirectory } from "@/components/PeopleDirectory";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata, socialImages } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/paths";
import { peopleListItems } from "@/lib/people-index";
import { fieldPeopleLists, organizationPeopleLists } from "@/lib/people-lists";
import { schoolPeopleLists } from "@/lib/people-schools";
import { asset } from "@/lib/paths";
import { itemList } from "@/lib/structured-data";

const PEOPLE_COUNT = peopleListItems(getCatalog()).length;

export const metadata = pageMetadata({
  title: "People in U.S. AI — founders, engineers, maintainers",
  description: `${PEOPLE_COUNT.toLocaleString("en-US")} sourced profiles of founders, engineers, researchers, and open-source maintainers behind U.S. AI organizations and open models in the USASI catalog.`,
  path: "/people/",
  image: socialImages.people,
});

export default function PeoplePage() {
  const catalog = getCatalog();
  const items = peopleListItems(catalog);
  const orgSlugs = new Set(items.flatMap((i) => i.organizations.map((o) => o.slug)).filter((s): s is string => s !== null));
  const organizations = catalog.organizations.filter((o) => orgSlugs.has(o.slug)).map((o) => ({ slug: o.slug, name: o.name }));
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "People",
          url: absoluteUrl("/people/"),
          mainEntity: itemList({
            name: "People in U.S. AI",
            path: "/people/",
            items: items.slice(0, 48).map((i) => ({ name: i.name, href: i.href })),
          }),
        }}
      />
      <PageHeader
        eyebrow="People"
        title="The people behind U.S. AI"
        description={
          <>
            <p>
              Founders and executives, engineers and researchers, and the maintainers of open-source projects, tied to the organizations and open
              models in this catalog. Each profile covers public professional work only, and every statement links to its source: an official
              biography, a faculty or team page, a repository, or a paper. Listed alphabetically; this is not a ranking.
            </p>
            <p className="mt-3 text-[0.9375rem]">
              Longer career profiles of the leaders of the largest companies are in{" "}
              <Link prefetch={false} href="/big-si/" className="link">
                People Behind Big SI
              </Link>
              ; the people who help you run AI on your own computer are in{" "}
              <Link prefetch={false} href="/local/" className="link">
                People Behind Local SI
              </Link>
              . To correct or remove a profile,{" "}
              <Link prefetch={false} href="/contribute/#corrections" className="link">
                use the correction form
              </Link>
              .
            </p>
          </>
        }
      />
      <div className="container-page py-10 sm:py-12">
        <PeopleDirectory items={items.slice(0, 48)} organizations={organizations} dataUrl={asset("/data/people.json")} total={items.length} />
        <nav aria-labelledby="browse-orgs-h" className="mt-12 border-t border-line pt-8" data-testid="people-browse">
          <h2 id="browse-orgs-h" className="text-xl font-semibold text-text">
            People by organization
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {organizationPeopleLists(catalog).map((l) => (
              <li key={l.path}>
                <Link prefetch={false} href={l.path} className="badge min-h-9 hover:border-cyan">
                  {l.name} ({l.items.length})
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="mt-8 text-xl font-semibold text-text">People by field</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {fieldPeopleLists(catalog).map((l) => (
              <li key={l.path}>
                <Link prefetch={false} href={l.path} className="badge min-h-9 border-tone-violet/40 hover:border-cyan">
                  {l.name} ({l.items.length})
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="mt-8 text-xl font-semibold text-text">People by school</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {schoolPeopleLists(catalog).map((l) => (
              <li key={l.path}>
                <Link prefetch={false} href={l.path} className="badge min-h-9 hover:border-cyan">
                  {l.shortName} ({l.items.length})
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
