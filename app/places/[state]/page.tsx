import Link from "next/link";
import { notFound } from "next/navigation";
import { Monogram } from "@/components/Badges";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { ROLE_LABELS } from "@/lib/labels";
import { pageMetadata } from "@/lib/metadata";
import { organizationsByState } from "@/lib/place-index";
import { stateFromSlug, stateSlug, US_STATES } from "@/lib/places";
import { orgHref } from "@/lib/routes";

export function generateStaticParams() {
  return organizationsByState(getCatalog()).states.map((s) => ({ state: stateSlug(s.code) }));
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
  const code = stateFromSlug((await params).state);
  const name = code ? US_STATES[code] : "Unknown state";
  return pageMetadata({
    title: `${name}: organizations by headquarters`,
    description: `Organizations in the USASI catalog whose documented headquarters is in ${name}. Not a map of offices, facilities, or capacity.`,
    path: `/places/${(await params).state}/`,
  });
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const code = stateFromSlug((await params).state);
  const group = code ? organizationsByState(getCatalog()).states.find((s) => s.code === code) : undefined;
  if (!code || !group) notFound();
  return (
    <>
      <PageHeader
        eyebrow="Places"
        title={group.name}
        crumbs={[{ href: "/places/", label: "Places" }, { href: `/places/${stateSlug(code)}/`, label: group.name }]}
        description={
          <p>
            {group.organizations.length} organizations in this catalog whose documented headquarters is in {group.name}. Each label below is quoted
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
