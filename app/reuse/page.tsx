import Content from "@/content/pages/reuse.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Data and reuse",
  description: "The catalog's public data files, what they contain, how dates and identifiers work, and the terms for reusing them.",
  path: "/reuse/",
});

export default function ReusePage() {
  return (
    <EditorialPage eyebrow="Reference" title="Data and reuse" description={<p>Public data files behind the site, and how to reuse them.</p>}>
      <Content />
    </EditorialPage>
  );
}
