import fs from "node:fs";
import path from "node:path";
import Content from "@/content/pages/faq.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/paths";
import { parseFaq } from "@/lib/reference-search";

export const metadata = pageMetadata({
  title: "Frequently asked questions",
  description: "Short, sourced answers to common questions about AI and about USASI, each linking to a longer explainer or the original documents.",
  path: "/faq/",
});

export default function FaqPage() {
  const mdx = fs.readFileSync(path.join(process.cwd(), "content", "pages", "faq.mdx"), "utf8");
  const questions = parseFaq(mdx);
  const groups = [...mdx.matchAll(/<h2 id="(group-[a-z0-9-]+)">([^<]+)<\/h2>/g)].map((m) => ({ id: m[1], title: m[2].trim() }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: absoluteUrl("/faq/"),
    mainEntity: questions.map((q) => ({ "@type": "Question", name: q.term, acceptedAnswer: { "@type": "Answer", text: q.definition } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <EditorialPage
        eyebrow="Reference"
        title="Frequently asked questions"
        description={<p>{questions.length} short answers about AI and about this site, each leading to a longer explainer or to the original source.</p>}
        headerExtra={
          <nav aria-label="Question groups" className="mt-6">
            <ul className="flex flex-wrap gap-2">
              {groups.map((g) => (
                <li key={g.id}>
                  <a href={`#${g.id}`} className="badge px-3 py-1.5 text-[0.875rem] hover:border-cyan hover:text-white">
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        }
      >
        <Content />
      </EditorialPage>
    </>
  );
}
