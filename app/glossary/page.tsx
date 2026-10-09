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

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function GlossaryPage() {
  const terms = parseGlossary(fs.readFileSync(path.join(process.cwd(), "content", "pages", "glossary.mdx"), "utf8"));
  const firstByLetter = new Map<string, string>();
  for (const t of terms) {
    const letter = t.term.charAt(0).toUpperCase();
    if (!firstByLetter.has(letter)) firstByLetter.set(letter, t.id);
  }
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
    <EditorialPage
      eyebrow="Reference"
      title="Glossary"
      description={
        <p>
          {terms.length} terms used across the catalog and its explainers, each with a plain definition, how the catalog uses it, and a real example.
        </p>
      }
      headerExtra={
        <nav aria-label="Glossary letters" className="mt-6">
          <ul className="flex flex-wrap gap-1.5">
            {LETTERS.map((letter) => {
              const first = firstByLetter.get(letter);
              return (
                <li key={letter}>
                  {first ? (
                    <a
                      href={`#${first}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-strong bg-elev/60 font-mono text-sm text-text hover:border-cyan hover:text-white"
                    >
                      {letter}
                    </a>
                  ) : (
                    <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-lg border border-line font-mono text-sm text-muted/40">
                      {letter}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      }
    >
      <Content />
    </EditorialPage>
    </>
  );
}
