import Link from "next/link";
import { ArtifactDirectory } from "@/components/ArtifactDirectory";
import { PageHeader } from "@/components/PageHeader";
import { ArtifactQuickViews } from "@/components/QuickViews";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata, socialImages } from "@/lib/metadata";
import { RUBRIC_LABEL } from "@/lib/openness";

export const metadata = pageMetadata({
  title: "Open Models & Tools",
  description:
    "Directory of U.S.-led open models, software, datasets, and evaluation tools, with availability, licenses, public-materials checklists, and sources.",
  path: "/open/",
  image: socialImages.open,
});

export default function OpenPage() {
  const catalog = getCatalog();
  const counts = catalog.counts();
  const items = catalog.artifacts.map((a) => catalog.toArtifactListItem(a));
  return (
    <>
      <PageHeader
        compact
        eyebrow="Directory"
        title="Open Models & Tools"
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
        <ArtifactDirectory items={items} />
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
