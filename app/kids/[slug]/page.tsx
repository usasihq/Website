import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Lightbulb } from "lucide-react";
import { ExternalLink } from "@/components/ExternalLink";
import { InlineText } from "@/components/InlineText";
import { KidAnswerKey, KidIcon, KidLessonBody, KidQuizSheet, kidTint } from "@/components/kids/KidParts";
import { QuizCard } from "@/components/learn/QuizCard";
import { Breadcrumbs } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import { getCatalog } from "@/lib/catalog";
import { KID_LESSONS, KIDS_AGES, KIDS_REVIEWED, kidLesson, kidNeighbors } from "@/lib/kids";
import { pageMetadata } from "@/lib/metadata";
import { cardImage } from "@/lib/page-cards";
import { absoluteUrl } from "@/lib/paths";

export const dynamicParams = false;

export function generateStaticParams() {
  return KID_LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const l = kidLesson((await params).slug);
  if (!l) return {};
  const path = `/kids/${l.slug}/`;
  return pageMetadata({ title: `${l.title} (for kids)`, description: l.bigIdea, path, image: cardImage(getCatalog(), path) });
}

export default async function KidLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const l = kidLesson((await params).slug);
  if (!l) notFound();
  const { prev, next } = kidNeighbors(l.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: l.title,
    description: l.bigIdea,
    url: absoluteUrl(`/kids/${l.slug}/`),
    inLanguage: "en-US",
    isAccessibleForFree: true,
    learningResourceType: "Lesson",
    timeRequired: `PT${l.minutes}M`,
    dateModified: KIDS_REVIEWED,
    audience: { "@type": "EducationalAudience", educationalRole: "student", audienceType: "Children ages 8 to 12" },
    isPartOf: { "@type": "Course", name: "AI and Super Intelligence for kids", url: absoluteUrl("/kids/") },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <article>
        <header className="border-b border-line bg-[radial-gradient(ellipse_at_top_left,rgba(76,201,255,0.14),transparent_60%)]">
          <div className="container-page pb-10 pt-10 sm:pt-12">
            <Breadcrumbs items={[{ href: "/kids/", label: "For kids" }]} current={{ href: `/kids/${l.slug}/`, label: l.title }} />
            <div className="flex flex-wrap items-center gap-4">
              <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${kidTint(l.number)}`}>
                <KidIcon name={l.icon} className="h-7 w-7" />
              </span>
              <p className="font-mono text-sm text-muted">
                Lesson {l.number} of {KID_LESSONS.length} · about {l.minutes} minutes
              </p>
              <PrintButton label="Print this lesson" className="btn btn-secondary ml-auto text-sm" />
            </div>
            <p className="mt-4 hidden gap-10 text-base print:flex" aria-hidden="true">
              <span>Name: ______________________</span>
              <span>Date: ____________</span>
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-text sm:text-5xl">{l.title}</h1>
            <div className="mt-6 flex max-w-3xl gap-3 rounded-2xl border border-[rgba(251,191,36,0.4)] bg-[rgba(251,191,36,0.08)] p-5">
              <Lightbulb aria-hidden="true" className="mt-1 h-6 w-6 flex-none text-[#fcd34d]" />
              <p className="text-xl leading-relaxed text-text">
                <span className="sr-only">The big idea: </span>
                <InlineText text={l.bigIdea} />
              </p>
            </div>
          </div>
        </header>

        <div className="container-page grid gap-10 py-10">
          <KidLessonBody lesson={l} />

          <section aria-labelledby="quiz-heading" className="max-w-2xl print:hidden">
            <h2 id="quiz-heading" className="text-2xl font-semibold text-text">
              Quick quiz
            </h2>
            <p className="mt-2 text-[1.0625rem] text-muted">Pick an answer to see if you got it. Nothing is saved.</p>
            <div className="mt-5">
              <QuizCard quiz={{ explainer: l.slug, questions: l.quiz, updated_at: KIDS_REVIEWED }} />
            </div>
          </section>

          <div className="hidden print:block">
            <KidQuizSheet lesson={l} />
          </div>

          <nav aria-label="More lessons" className="grid max-w-2xl gap-4 sm:grid-cols-2 print:hidden">
            {prev ? (
              <Link prefetch={false} href={`/kids/${prev.slug}/`} className="card card-link flex flex-col rounded-2xl p-5">
                <span className="flex items-center gap-1.5 text-sm uppercase tracking-[0.08em] text-muted">
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Lesson {prev.number}
                </span>
                <span className="mt-1.5 text-lg font-semibold text-text">{prev.title}</span>
              </Link>
            ) : (
              <Link prefetch={false} href="/kids/" className="card card-link flex flex-col rounded-2xl p-5">
                <span className="flex items-center gap-1.5 text-sm uppercase tracking-[0.08em] text-muted">
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" /> All lessons
                </span>
                <span className="mt-1.5 text-lg font-semibold text-text">AI and Super Intelligence for kids</span>
              </Link>
            )}
            {next ? (
              <Link prefetch={false} href={`/kids/${next.slug}/`} className="card card-link flex flex-col rounded-2xl p-5 text-right">
                <span className="flex items-center justify-end gap-1.5 text-sm uppercase tracking-[0.08em] text-muted">
                  Lesson {next.number} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="mt-1.5 text-lg font-semibold text-text">{next.title}</span>
              </Link>
            ) : (
              <Link prefetch={false} href="/kids/words/" className="card card-link flex flex-col rounded-2xl p-5 text-right">
                <span className="flex items-center justify-end gap-1.5 text-sm uppercase tracking-[0.08em] text-muted">
                  You finished! <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="mt-1.5 text-lg font-semibold text-text">Review the words to know</span>
              </Link>
            )}
          </nav>

          <details className="max-w-2xl rounded-2xl border border-line p-5" data-testid="kid-grownups">
            <summary className="cursor-pointer text-[1.0625rem] font-semibold text-ice hover:text-white">For grown-ups: sources and going further</summary>
            <div className="mt-3 space-y-3 text-[0.9375rem] text-muted">
              <p>{l.grownUps.note}</p>
              <ul className="space-y-1.5">
                {l.grownUps.links.map((x) => (
                  <li key={x.href}>
                    {x.href.startsWith("/") ? (
                      <Link prefetch={false} href={x.href} className="link">
                        {x.label}
                      </Link>
                    ) : (
                      <ExternalLink href={x.href}>{x.label}</ExternalLink>
                    )}
                  </li>
                ))}
              </ul>
              <p>
                Written for readers {KIDS_AGES}, last reviewed {KIDS_REVIEWED}. <Link href="/kids/grown-ups/" className="link">How these lessons were made</Link>.
              </p>
            </div>
          </details>

          <div className="hidden print:block">
            <KidAnswerKey lessons={[l]} />
          </div>
          <p className="hidden text-sm print:block">
            {absoluteUrl(`/kids/${l.slug}/`)} · Source: USASI catalog (unitedstatesofamericasuperintelligence.com), CC BY 4.0. Independent project, not a
            U.S. government website.
          </p>
        </div>
      </article>
    </>
  );
}
