import Link from "next/link";
import { ArtifactDirectory } from "@/components/ArtifactDirectory";
import { PageHeader } from "@/components/PageHeader";
import { ArtifactQuickViews } from "@/components/QuickViews";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
import { RUBRIC_LABEL } from "@/lib/openness";

export const metadata = pageMetadata({
  title: "Open Models & Tools",
  description:
    "Directory of U.S.-led open models, software, datasets, and evaluation tools, with availability, licenses, public-materials checklists, and sources.",
  path: "/open/",
});

export default function OpenPage() {
  const catalog = getCatalog();
  const counts = catalog.counts();
  const items = catalog.artifacts.map((a) => catalog.toArtifactListItem(a));
  return (
    <>
      <PageHeader
        eyebrow="Directory"
        title="Open Models & Tools"
        description={
          <p>
            U.S.-led models, software, datasets, and evaluation tools with publicly available materials. Each record says what is public, under
            which license, and who maintains it. Publicly downloadable does not always mean unrestricted.
          </p>
        }
      >
        <p className="meta mt-4">
          {counts.modelFamilies} model families · {counts.modelReleases} model releases · {counts.software} software projects · {counts.datasets}{" "}
          datasets · {counts.evals} evaluation tools. Family overviews are listed separately from releases and are not counted as releases. Tiers
          follow {RUBRIC_LABEL}.{" "}
          <Link href="/methodology/#openness" className="link">
            What the labels mean
          </Link>
        </p>
        <ArtifactQuickViews items={items} />
      </PageHeader>
      <div className="container-page py-10">
        <ArtifactDirectory items={items} />
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
