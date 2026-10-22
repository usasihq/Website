import Link from "@/components/Link";
import { InitialsTile } from "@/components/LocalCorner";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import type { PeopleListItem } from "@/lib/people";
import { absoluteUrl } from "@/lib/paths";
import { itemList } from "@/lib/structured-data";

/** A static, alphabetical list of People profiles (an organization or a field). Not a ranking. */
export function PeopleListPage({
  title,
  path,
  intro,
  items,
  roleFor,
  related,
  crumbs = [{ href: "/people/", label: "People" }],
}: {
  title: string;
  path: string;
  intro: React.ReactNode;
  items: PeopleListItem[];
  /** The role line shown under each name. */
  roleFor: (i: PeopleListItem) => string | null;
  related: { href: string; label: string }[];
  crumbs?: { href: string; label: string }[];
}) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          url: absoluteUrl(path),
          mainEntity: itemList({ name: title, path, items: items.map((i) => ({ name: i.name, href: i.href })) }),
        }}
      />
      <PageHeader eyebrow="People" title={title} description={intro} crumbs={crumbs} current={{ href: path, label: title }} />
      <div className="container-page grid gap-10 py-10 sm:py-12">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="people-list">
          {items.map((i) => {
            const role = roleFor(i);
            return (
              <li key={i.href} className="card flex gap-4 p-5">
                <InitialsTile initials={i.initials} />
                <div className="min-w-0">
                  <h2 className="font-semibold text-text">
                    <Link prefetch={false} href={i.href} className="link">
                      {i.name}
                    </Link>
                  </h2>
                  {role ? <p className="mt-0.5 text-sm text-ice">{role}</p> : null}
                  <p className="mt-1.5 text-[0.9375rem] text-body">{i.headline}</p>
                </div>
              </li>
            );
          })}
        </ul>
        {related.length ? (
          <nav aria-labelledby="related-lists-h" className="border-t border-line pt-6">
            <h2 id="related-lists-h" className="eyebrow">
              More people lists
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {related.map((r) => (
                <li key={r.href}>
                  <Link prefetch={false} href={r.href} className="badge min-h-9 hover:border-cyan">
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
