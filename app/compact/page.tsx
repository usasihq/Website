import Content from "@/content/pages/compact.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "USASI Compact v0.2 — unofficial",
  description:
    "The unofficial USASI Compact v0.2: the catalog's voluntary editorial practices on evidence, provenance, disclosure, public documentation, correction, and forkability.",
  path: "/compact/",
});

export default function CompactPage() {
  return (
    <EditorialPage
      eyebrow="Editorial practices · version 0.2"
      title="USASI Compact v0.2 — unofficial"
      crumbs={[{ href: "/about/", label: "About" }]}
      description={<p>Voluntary editorial practices for this catalog. Not government policy and not a legal document.</p>}
    >
      <Content />
    </EditorialPage>
  );
}
