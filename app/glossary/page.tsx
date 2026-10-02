import Content from "@/content/pages/glossary.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Glossary",
  description: "Plain-language definitions of terms used in the USASI catalog, each with how the catalog uses it and a real example.",
  path: "/glossary/",
});

export default function GlossaryPage() {
  return (
    <EditorialPage eyebrow="Reference" title="Glossary" description={<p>Terms used across the catalog, each with a plain definition and a real example.</p>}>
      <Content />
    </EditorialPage>
  );
}
