import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StateTileMap } from "@/components/StateTileMap";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
import { organizationsByState } from "@/lib/place-index";
import { stateSlug } from "@/lib/places";

export const metadata = pageMetadata({
  title: "Places",
  description: "Organizations in the USASI catalog by the U.S. state named in their documented headquarters. Not a map of offices, facilities, or capacity.",
  path: "/places/",
});

export default function PlacesPage() {
  const { states, unknown } = organizationsByState(getCatalog());
  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="Organizations by headquarters state"
        description={
          <p>
            Each organization appears under the state named in its documented headquarters, as recorded with sources on its page. This is not a
            map of offices, data centers, employees, or computing capacity, and it covers only organizations in this catalog.
          </p>
        }
      />
      <div className="container-page py-10">
        <StateTileMap states={states} />
        <p className="mt-4 max-w-3xl text-sm text-muted">
          Each state is one equal square, placed roughly where it sits on a map. Shading shows how many organizations in this catalog name the state in
          their headquarters; it reflects what the catalog covers so far, not how much AI work happens in a state.
        </p>
        <h2 className="mt-10 text-xl font-semibold text-text">States with organizations in the catalog</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {states.map((s) => (
            <li key={s.code}>
              <Link prefetch={false} href={`/places/${stateSlug(s.code)}/`} className="card flex items-center justify-between gap-3 p-4 hover:border-cyan">
                <span className="font-medium text-text">{s.name}</span>
                <span className="font-mono text-sm text-muted" aria-label={`${s.organizations.length} organizations`}>
                  {s.organizations.length}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-3xl text-sm text-muted">
          {unknown.length} published organizations have no state in their documented headquarters (for example foundations without a stated
          headquarters, or records whose sources give only a country). They are not assigned to a state.
        </p>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
