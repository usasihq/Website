import Link from "@/components/Link";
import { Lightbulb } from "lucide-react";
import { InlineText } from "@/components/InlineText";
import { KidAnswerKey, KidLessonBody, KidQuizSheet } from "@/components/kids/KidParts";
import { Breadcrumbs } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import { KID_LESSONS, KID_WORDS, KIDS_AGES, KIDS_REVIEWED } from "@/lib/kids";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/paths";

export const metadata = pageMetadata({
  title: "Classroom packet: all kids lessons",
  description: `All seven AI and Super Intelligence lessons for readers ${KIDS_AGES} on one printable page, with paper quizzes, a word list, and an answer key.`,
  path: "/kids/packet/",
});

export default function KidsPacketPage() {
  return (
    <article>
      <header className="border-b border-line">
        <div className="container-page pb-8 pt-10 sm:pt-12">
          <Breadcrumbs items={[{ href: "/kids/", label: "For kids" }]} current={{ href: "/kids/packet/", label: "Classroom packet" }} />
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-text sm:text-5xl">AI and Super Intelligence, explained for kids</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted print:hidden">
            All seven lessons on one page for printing: each with its activity and a paper quiz, then the word list and an answer key for the grown-up. The
            text is CC BY 4.0; see the <Link href="/kids/grown-ups/" className="link">note for parents and teachers</Link>.
          </p>
          <p className="mt-4 hidden text-sm print:block">
            {absoluteUrl("/kids/")} · Lessons for readers {KIDS_AGES}, last reviewed {KIDS_REVIEWED}. Source: USASI catalog
            (unitedstatesofamericasuperintelligence.com), CC BY 4.0. Independent project, not a U.S. government website.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 print:hidden">
            <PrintButton label="Print the packet" className="btn btn-primary" />
            <span className="text-sm text-muted">Tip: turn off headers and footers in the print dialog for a cleaner page.</span>
          </div>
          <nav aria-label="Lessons in this packet" className="mt-6 print:hidden">
            <ol className="flex flex-wrap gap-2">
              {KID_LESSONS.map((l) => (
                <li key={l.slug}>
                  <a href={`#${l.slug}`} className="badge px-3 py-1 hover:border-cyan">
                    {l.number}. {l.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </header>

      <div className="container-page grid gap-16 py-10">
        {KID_LESSONS.map((l, i) => (
          <section key={l.slug} id={l.slug} aria-labelledby={`${l.slug}-title`} className={`grid scroll-mt-28 gap-8 ${i > 0 ? "break-before-page" : ""}`}>
            <div className="max-w-2xl">
              <p className="font-mono text-sm text-muted">
                Lesson {l.number} of {KID_LESSONS.length} · about {l.minutes} minutes
              </p>
              <h2 id={`${l.slug}-title`} className="mt-2 text-3xl font-semibold text-text">
                {l.title}
              </h2>
              <p className="mt-4 flex gap-3 rounded-2xl border border-[rgba(251,191,36,0.4)] bg-[rgba(251,191,36,0.08)] p-5 text-xl leading-relaxed text-text">
                <Lightbulb aria-hidden="true" className="mt-1 h-6 w-6 flex-none text-[#fcd34d]" />
                <span>
                  <span className="sr-only">The big idea: </span>
                  <InlineText text={l.bigIdea} />
                </span>
              </p>
            </div>
            <KidLessonBody lesson={l} level={3} />
            <KidQuizSheet lesson={l} level={3} />
          </section>
        ))}

        <section aria-labelledby="words-title" className="max-w-3xl break-before-page">
          <h2 id="words-title" className="text-3xl font-semibold text-text">
            Words to know
          </h2>
          <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {KID_WORDS.map((w) => (
              <div key={w.id} className="break-inside-avoid">
                <dt className="font-semibold text-text">{w.term}</dt>
                <dd className="mt-1 text-[#d5def2]">{w.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>

        <KidAnswerKey lessons={KID_LESSONS} />
      </div>
    </article>
  );
}
