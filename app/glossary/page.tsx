import Content from "@/content/pages/glossary.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import fs from "node:fs";
import path from "node:path";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/paths";
import { parseGlossary } from "@/lib/reference-search";

export const metadata = pageMetadata({
  title: "Glossary",
  description: "Plain-language definitions of terms used in the USASI catalog, each with how the catalog uses it and a real example.",
  path: "/glossary/",
});

export default function GlossaryPage() {
  const terms = parseGlossary(fs.readFileSync(path.join(process.cwd(), "content", "pages", "glossary.mdx"), "utf8"));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "USASI glossary",
    url: absoluteUrl("/glossary/"),
    hasDefinedTerm: terms.map((t) => ({ "@type": "DefinedTerm", name: t.term, description: t.definition, url: absoluteUrl(`/glossary/#${t.id}`) })),
  };
  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <EditorialPage eyebrow="Reference" title="Glossary" description={<p>Terms used across the catalog, each with a plain definition and a real example.</p>}>
      <Content />
    </EditorialPage>
    </>
  );
}
