import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Lightbulb, Route } from "lucide-react";
import { ExplainerCard, LevelBadge, ReadingTime, TopicIcon } from "@/components/learn/LearnParts";
import { QuizCard } from "@/components/learn/QuizCard";
import { TableOfContents } from "@/components/learn/TableOfContents";
import { ExternalLink } from "@/components/ExternalLink";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/catalog";
import { SupportPanel } from "@/components/SupportPanel";
import { formatDate } from "@/lib/dates";
import { EXPLAINERS, adjacentExplainers, explainer, pathsForExplainer, relatedExplainers, topic } from "@/lib/learn";
import { explainerOutline } from "@/lib/learn-outline";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/paths";
import { siteConfig } from "@/lib/site-config";
import { EXPLAINER_CONTENT } from "../content";

export function generateStaticParams() {
  return EXPLAINERS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const e = explainer((await params).slug);
  return pageMetadata({ title: e?.title ?? "Explainer", description: e?.question ?? "", path: `/learn/${(await params).slug}/` });
}

export default async function ExplainerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = explainer(slug);
  const Content = EXPLAINER_CONTENT[slug];
  if (!e || !Content) notFound();
  const outline = explainerOutline(slug);
  const t = topic(e.topic);
  const { prev, next } = adjacentExplainers(slug);
  const related = relatedExplainers(slug, 3);
  const paths = pathsForExplainer(slug);
  const quiz = getCatalog().quizzes.find((q) => q.explainer === slug);
  const tocHeadings = [
    ...outline.headings.filter((h) => h.id !== "sources"),
    ...(quiz ? [{ id: "check-heading", title: "Check your understanding" }] : []),
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: e.title,
    description: e.question,
    dateModified: e.reviewed,
    url: absoluteUrl(`/learn/${slug}/`),
    articleSection: t.title,
    educationalLevel: e.level,
    timeRequired: `PT${outline.minutes}M`,
    author: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/") },
    publisher: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/") },
    isAccessibleForFree: true,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-1.5">
            <TopicIcon id={e.topic} className="h-3.5 w-3.5" />
            Explainer · {t.title}
          </span>
        }
        title={e.title}
        crumbs={[
          { href: "/learn/", label: "Learn" },
          { href: `/learn/${slug}/`, label: e.title },
        ]}
        description={<p>{e.question}</p>}
      >
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <LevelBadge level={e.level} />
          <ReadingTime minutes={outline.minutes} />
          <span className="text-sm text-muted">Reviewed {formatDate(e.reviewed)}</span>
        </div>
        <p className="mt-3 text-sm text-muted">
          General information, not legal or professional advice. <Link href="/learn/" className="link">All explainers</Link>
        </p>
        <details className="mt-3 max-w-3xl text-sm text-muted">
          <summary className="cursor-pointer text-text">How this page was made</summary>
          <ul className="mt-2 space-y-1">
            <li>Researched and written with AI assistance from primary sources, which are listed at the end with the date they were read.</li>
            <li>
              {e.factCheck ? (
                <>
                  Source-checked: a separate AI fact-check pass compared each sentence with its source and corrected what did not match (
                  <ExternalLink href={`${siteConfig.repository.url}/blob/main/research/verification/${e.factCheck}`}>fact-check report</ExternalLink>).
                </>
              ) : (
                "Not yet given a separate sentence-by-sentence fact-check pass."
              )}
            </li>
            <li>Automated checks passed: links, structure, and formatting are validated before every publish.</li>
            <li>Not individually reviewed by a person before publication. <Link href="/methodology/#review-levels" className="link">What these review levels mean</Link></li>
          </ul>
        </details>
      </PageHeader>

      <div className="container-page py-10 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,44rem)_15rem] lg:justify-between xl:gap-16">
          <article className="min-w-0">
            <section aria-labelledby="takeaways-heading" className="card mb-10 border-cyan/30 bg-[linear-gradient(135deg,rgba(76,201,255,0.08),rgba(11,22,44,0.72))] p-5 sm:p-6">
              <h2 id="takeaways-heading" className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-ice">
                <Lightbulb aria-hidden="true" className="h-4 w-4 text-cyan" />
                Key takeaways
              </h2>
              <ul className="mt-3 space-y-2.5 text-[0.9875rem] leading-relaxed text-text">
                {e.takeaways.map((k) => (
                  <li key={k} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-cyan" />
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </section>

            <details className="card mb-8 p-4 lg:hidden">
              <summary className="cursor-pointer font-semibold text-text">On this page</summary>
              <div className="mt-3">
                <TableOfContents headings={tocHeadings} />
              </div>
            </details>

            <div className="prose-usasi serif">
              <Content />
            </div>

            {quiz ? (
              <section aria-labelledby="check-heading" className="mt-14 border-t border-line pt-10">
                <h2 id="check-heading" className="scroll-mt-28 text-xl font-semibold text-text sm:text-2xl">
                  Check your understanding
                </h2>
                <p className="mt-2 text-sm text-muted">Three quick questions, answered from this page. Nothing you choose is saved or sent anywhere.</p>
                <div className="mt-5">
                  <QuizCard quiz={quiz} />
                </div>
              </section>
            ) : null}

            <nav aria-label="Previous and next explainers" className="mt-14 grid gap-3 sm:grid-cols-2">
              {prev ? (
                <Link prefetch={false} href={`/learn/${prev.slug}/`} className="card card-link flex flex-col p-4">
                  <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.08em] text-muted">
                    <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> Previous
                  </span>
                  <span className="mt-1.5 font-semibold text-text">{prev.title}</span>
                </Link>
              ) : (
                <span className="hidden sm:block" />
              )}
              {next ? (
                <Link prefetch={false} href={`/learn/${next.slug}/`} className="card card-link flex flex-col p-4 text-right">
                  <span className="flex items-center justify-end gap-1.5 text-xs uppercase tracking-[0.08em] text-muted">
                    Next <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                  <span className="mt-1.5 font-semibold text-text">{next.title}</span>
                </Link>
              ) : null}
            </nav>
          </article>

          <aside className="hidden lg:block" aria-label="Page navigation">
            <div className="sticky top-28 space-y-8">
              <nav aria-labelledby="toc-heading">
                <h2 id="toc-heading" className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-ice">
                  On this page
                </h2>
                <TableOfContents headings={tocHeadings} />
              </nav>
              {paths.length ? (
                <div>
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-ice">In these learning paths</h2>
                  <ul className="space-y-2 text-sm">
                    {paths.map((p) => (
                      <li key={p.id}>
                        <Link href={`/learn/paths/${p.id}/`} className="inline-flex items-start gap-2 text-muted hover:text-text">
                          <Route aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none text-cyan" />
                          {p.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </aside>
        </div>

        <section aria-labelledby="keep-learning-heading" className="mt-16 border-t border-line pt-10">
          <h2 id="keep-learning-heading" className="text-xl font-semibold text-text sm:text-2xl">
            Keep learning
          </h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <ExplainerCard e={r} minutes={explainerOutline(r.slug).minutes} showTopic />
              </li>
            ))}
          </ul>
          {paths.length ? (
            <p className="mt-6 text-sm text-muted lg:hidden">
              Part of{" "}
              {paths.map((p, i) => (
                <span key={p.id}>
                  {i > 0 ? (i === paths.length - 1 ? " and " : ", ") : null}
                  <Link href={`/learn/paths/${p.id}/`} className="link">
                    {p.title}
                  </Link>
                </span>
              ))}
              .
            </p>
          ) : null}
        </section>
      </div>
      <SupportPanel variant="standard" />
    </>
  );
}
