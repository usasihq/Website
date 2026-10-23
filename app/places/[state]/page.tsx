import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { Monogram } from "@/components/Badges";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { ROLE_LABELS } from "@/lib/labels";
import { pageMetadata } from "@/lib/metadata";
import { cardImage } from "@/lib/page-cards";
import { organizationsByState } from "@/lib/place-index";
import { stateFromSlug, stateSlug, US_STATES } from "@/lib/places";
import { orgHref } from "@/lib/routes";
import { statePlaceName, stateSeo, stateTitle } from "@/lib/seo";
import { itemList } from "@/lib/structured-data";

export function generateStaticParams() {
  return organizationsByState(getCatalog()).states.map((s) => ({ state: stateSlug(s.code) }));
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
  const slug = (await params).state;
  const catalog = getCatalog();
  const code = stateFromSlug(slug);
  const group = code ? organizationsByState(catalog).states.find((s) => s.code === code) : undefined;
  const seo = group ? stateSeo(catalog, group) : { title: `AI companies & labs in ${code ? US_STATES[code] : "an unknown state"}`, description: "" };
  return pageMetadata({
    title: seo.title,
    description: seo.description,
    path: `/places/${slug}/`,
    image: cardImage(catalog, `/places/${slug}/`),
  });
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const code = stateFromSlug((await params).state);
  const group = code ? organizationsByState(getCatalog()).states.find((s) => s.code === code) : undefined;
  if (!code || !group) notFound();
  const path = `/places/${stateSlug(code)}/`;
  return (
    <>
      <JsonLd
        data={itemList({
          name: stateTitle(group),
          path,
          items: group.organizations.map((o) => ({ name: o.name, href: orgHref(o.slug) })),
        })}
      />
      <PageHeader
        eyebrow={`Places · ${group.name}`}
        title={stateTitle(group)}
        crumbs={[{ href: "/places/", label: "Places" }, { href: path, label: group.name }]}
        description={
          <p>
            {group.organizations.length} AI {group.organizations.length === 1 ? "company, lab, or research organization" : "companies, labs, and research organizations"} in
            this catalog whose documented headquarters is in {statePlaceName(group)}. Each label below is quoted
            from the organization&rsquo;s record, where its source is cited. Headquarters are not offices, facilities, or computing capacity.
          </p>
        }
      />
      <div className="container-page py-10">
        <ul className="grid gap-3 md:grid-cols-2">
          {group.organizations.map((o) => (
            <li key={o.slug}>
              <Link prefetch={false} href={orgHref(o.slug)} className="card flex h-full items-start gap-3 p-4 hover:border-cyan">
                <Monogram text={o.logo_text} size="sm" />
                <span className="min-w-0">
                  <span className="block font-medium text-text">{o.name}</span>
                  <span className="block text-sm text-muted">{o.headquarters?.label}</span>
                  <span className="mt-1 block text-sm text-muted">{o.organization_roles.slice(0, 3).map((r) => ROLE_LABELS[r]).join(" · ")}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">
          <Link href="/places/" className="link">All states</Link> · <Link href="/companies/" className="link">Companies &amp; Labs</Link>
        </p>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
