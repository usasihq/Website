import Content from "@/content/pages/reuse.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import { JsonLd } from "@/components/JsonLd";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
import { catalogDatasetLd } from "@/lib/structured-data";

export const metadata = pageMetadata({
  title: "USASI catalog data: JSON & CSV downloads (CC BY 4.0)",
  description: "Download the USASI catalog of U.S. AI organizations and open models as JSON or CSV, see what the files contain and how dates work, and reuse it under CC BY 4.0.",
  path: "/reuse/",
});

export default function ReusePage() {
  return (
    <>
      <JsonLd data={catalogDatasetLd(getCatalog())} />
      <EditorialPage eyebrow="Reference" title="Data and reuse" description={<p>Public data files behind the site, and how to reuse them.</p>}>
        <Content />
      </EditorialPage>
    </>
  );
}
