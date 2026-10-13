import Link from "next/link";
import { Breadcrumbs } from "@/components/PageHeader";
import { KID_LESSONS, KID_WORDS } from "@/lib/kids";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/paths";

export const metadata = pageMetadata({
  title: "Words to know (for kids)",
  description: "Simple meanings of AI words for readers about 8 to 12, from chatbot and training to deepfake and super intelligence.",
  path: "/kids/words/",
});

export default function KidWordsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Words to know: AI for kids",
    url: absoluteUrl("/kids/words/"),
    hasDefinedTerm: KID_WORDS.map((w) => ({ "@type": "DefinedTerm", name: w.term, description: w.meaning, url: absoluteUrl(`/kids/words/#${w.id}`) })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="border-b border-line bg-[radial-gradient(ellipse_at_top_left,rgba(76,201,255,0.14),transparent_60%)]">
        <div className="container-page pb-10 pt-10 sm:pt-12">
          <Breadcrumbs items={[{ href: "/kids/", label: "For kids" }]} current={{ href: "/kids/words/", label: "Words to know" }} />
          <h1 className="text-4xl font-semibold text-text sm:text-5xl">Words to know</h1>
          <p className="mt-4 max-w-2xl text-xl leading-relaxed text-[#d5def2]">Simple meanings for words you will see in the lessons. Each word links to the lesson that uses it.</p>
        </div>
      </header>
      <div className="container-page py-10">
        <dl className="grid max-w-4xl gap-4 sm:grid-cols-2">
          {KID_WORDS.map((w) => {
            const lesson = w.lesson ? KID_LESSONS.find((l) => l.slug === w.lesson) : undefined;
            return (
              <div key={w.id} id={w.id} className="card scroll-mt-28 rounded-2xl p-5">
                <dt className="text-xl font-semibold text-text">{w.term}</dt>
                <dd className="mt-2 text-[1.125rem] leading-relaxed text-[#d5def2]">{w.meaning}</dd>
                {lesson ? (
                  <dd className="mt-3 text-[0.9375rem]">
                    <Link prefetch={false} href={`/kids/${lesson.slug}/`} className="link">
                      Lesson {lesson.number}: {lesson.title}
                    </Link>
                  </dd>
                ) : null}
              </div>
            );
          })}
        </dl>
        <p className="mt-10 text-[1.0625rem]">
          <Link prefetch={false} href="/kids/" className="link">
            Back to all lessons
          </Link>
        </p>
      </div>
    </>
  );
}
