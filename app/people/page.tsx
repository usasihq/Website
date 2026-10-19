import Link from "@/components/Link";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { PeopleDirectory } from "@/components/PeopleDirectory";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata, socialImages } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/paths";
import { peopleListItems } from "@/lib/people-index";

export const metadata = pageMetadata({
  title: "People in U.S. AI: founders, engineers & open-source maintainers",
  description:
    "Sourced profiles of the founders, engineers, researchers, and open-source maintainers behind the organizations and open models in the USASI catalog.",
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
          hasPart: items.map((i) => ({ "@type": "ProfilePage", name: i.name, url: absoluteUrl(i.href) })),
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
        <PeopleDirectory items={items} organizations={organizations} />
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
