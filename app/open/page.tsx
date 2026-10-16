import Link from "@/components/Link";
import { ArtifactDirectory } from "@/components/ArtifactDirectory";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { ArtifactQuickViews } from "@/components/QuickViews";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata, socialImages } from "@/lib/metadata";
import { RUBRIC_LABEL } from "@/lib/openness";
import { artifactHref } from "@/lib/routes";
import { itemList } from "@/lib/structured-data";

const COUNTS = getCatalog().counts();

export const metadata = pageMetadata({
  title: "U.S. open-source & open-weight AI models and tools",
  description: `Directory of ${COUNTS.modelReleases} model releases, ${COUNTS.software} software projects, ${COUNTS.datasets} datasets, and ${COUNTS.evals} evaluation tools from U.S. organizations: licenses, openness tiers, and sources.`,
  path: "/open/",
  image: socialImages.open,
});

export default function OpenPage() {
  const catalog = getCatalog();
  const counts = catalog.counts();
  const items = catalog.artifacts.map((a) => catalog.toArtifactListItem(a));
  return (
    <>
      <JsonLd data={itemList({ name: "Open models & tools from U.S. organizations", path: "/open/", items: items.map((a) => ({ name: a.name, href: artifactHref(a.slug) })) })} />
      <PageHeader
        compact
        eyebrow="Directory · Open Models & Tools"
        title="U.S. open models & tools"
        description={
          <p>
            Find U.S.-led models, software, datasets, and evaluation tools by availability, license, and maintainer. Publicly downloadable does not always mean unrestricted.
          </p>
        }
      >
        <p className="meta mt-2">
          {counts.modelFamilies} model families · {counts.modelReleases} model releases · {counts.software} software projects · {counts.datasets}{" "}
          datasets · {counts.evals} evaluation tools.{" "}
          <Link href="/methodology/#openness" className="link">
            What the labels mean
          </Link>
        </p>
        <details className="mt-3"><summary className="cursor-pointer text-sm text-ice">Browse quick views</summary><p className="meta mt-3">Family overviews are separate from releases. Tiers follow {RUBRIC_LABEL}.</p><ArtifactQuickViews items={items} /></details>
      </PageHeader>
      <div className="container-page py-6">
        <ArtifactDirectory items={items} asOf={catalog.buildAt} />
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
