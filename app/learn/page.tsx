import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarClock, Library, MapPin, Route, ScrollText, Search } from "lucide-react";
import { ExplainerCard, TopicIcon } from "@/components/learn/LearnParts";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { EXPLAINERS, LEARNING_PATHS, availableSteps, explainer, explainersByTopic } from "@/lib/learn";
import { explainerOutline } from "@/lib/learn-outline";
import { pageMetadata } from "@/lib/metadata";
import { parseGlossary } from "@/lib/reference-search";

export const metadata = pageMetadata({
  title: "Learn",
  description:
    "Learn how AI works and how to check claims about it: learning paths, plain-language explainers, topic hubs, and a glossary, each leading to real records and their sources.",
  path: "/learn/",
});

/** Glossary terms worth meeting first; shown only if present in the glossary. */
const STARTER_TERMS = [
  "weights",
  "token",
  "inference",
  "context-window",
  "open-weight",
  "model-card",
  "fine-tuning",
  "quantization",
  "hallucination",
  "embedding",
  "rag",
  "agent",
  "function-calling",
  "mcp",
  "benchmark",
  "red-teaming",
];

export default function LearnPage() {
  const catalog = getCatalog();
  const hubs = catalog.hubs;
  const hubSlugs = new Set(hubs.map((h) => h.slug));
  const glossary = parseGlossary(fs.readFileSync(path.join(process.cwd(), "content", "pages", "glossary.mdx"), "utf8"));
  const glossaryIds = new Map(glossary.map((g) => [g.id, g.term]));
  const starter = STARTER_TERMS.filter((id) => glossaryIds.has(id));
  const minutes = (slug: string) => explainerOutline(slug).minutes;
  const groups = explainersByTopic();
  const stats = [
    { value: EXPLAINERS.length, label: "explainers" },
    { value: LEARNING_PATHS.length, label: "learning paths" },
    { value: hubs.length, label: "topic hubs" },
    { value: glossary.length, label: "glossary terms" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="Learn"
        description={
          <p>
            Plain-language guides to how AI works and how to check what you read about it. Every explainer cites the documents it relies on and
            leads to real records in the catalog. New here? <Link href="/start/" className="link">Start here</Link>.
          </p>
        }
      >
        <dl className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card flex flex-col px-4 py-3">
              <dt className="text-sm text-muted">{s.label}</dt>
              <dd className="order-first font-mono text-2xl font-semibold text-text tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>
      </PageHeader>

      <div className="container-page grid gap-16 py-12">
        <section aria-labelledby="paths-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="paths-heading" className="flex items-center gap-2 text-xl font-semibold text-text sm:text-2xl">
                <Route aria-hidden="true" className="h-5 w-5 text-cyan" />
                Learning paths
              </h2>
              <p className="mt-2 max-w-3xl text-muted">Short sequences that build on each other. Pick the one that matches what you want to do.</p>
            </div>
          </div>
          <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {LEARNING_PATHS.map((p) => {
              const steps = availableSteps(p, hubSlugs);
              const total = steps.reduce((n, s) => n + (s.kind === "explainer" ? minutes(s.slug) : 0), 0);
              return (
                <li key={p.id}>
                  <Link prefetch={false} href={`/learn/paths/${p.id}/`} className="card card-link group flex h-full flex-col p-5">
                    <span className="text-xs font-medium uppercase tracking-[0.08em] text-cyan">{p.audience}</span>
                    <span className="mt-2 text-lg font-semibold text-text group-hover:text-white">{p.title}</span>
                    <span className="mt-2 text-sm text-muted">{p.description}</span>
                    <ol className="mt-4 space-y-1.5 text-sm">
                      {steps.slice(0, 4).map((s, i) => (
                        <li key={i} className="flex gap-2.5 text-text/90">
                          <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full border border-line-strong font-mono text-[0.6875rem] text-ice">
                            {i + 1}
                          </span>
                          <span className="leading-5">
                            {s.kind === "explainer" ? explainer(s.slug)!.title : s.kind === "hub" ? catalog.hub(s.slug)!.title : s.label}
                          </span>
                        </li>
                      ))}
                      {steps.length > 4 ? <li className="pl-7 text-muted">and {steps.length - 4} more</li> : null}
                    </ol>
                    <span className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
                      <span className="text-muted">
                        {steps.length} steps · about {total} min of reading
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-cyan">
                        Start <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="explainers-heading">
          <h2 id="explainers-heading" className="flex items-center gap-2 text-xl font-semibold text-text sm:text-2xl">
            <BookOpen aria-hidden="true" className="h-5 w-5 text-cyan" />
            Explainers by topic
          </h2>
          <p className="mt-2 max-w-3xl text-muted">Each answers one question in a few minutes, with a worked example and a list of the sources it was checked against.</p>
          <nav aria-label="Explainer topics" className="mt-5 flex flex-wrap gap-2">
            {groups.map((g) => (
              <a key={g.topic.id} href={`#topic-${g.topic.id}`} className="badge gap-1.5 px-3 py-1 hover:border-cyan">
                <TopicIcon id={g.topic.id} className="h-3.5 w-3.5 text-cyan" />
                {g.topic.title}
              </a>
            ))}
          </nav>
          <div className="mt-8 grid gap-12">
            {groups.map((g) => (
              <div key={g.topic.id} id={`topic-${g.topic.id}`} className="scroll-mt-28">
                <h3 className="flex items-center gap-2.5 text-lg font-semibold text-text">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-strong bg-elev text-cyan">
                    <TopicIcon id={g.topic.id} className="h-4 w-4" />
                  </span>
                  {g.topic.title}
                </h3>
                <p className="mt-1.5 max-w-3xl text-sm text-muted">{g.topic.description}</p>
                <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {g.explainers.map((e) => (
                    <li key={e.slug}>
                      <ExplainerCard e={e} minutes={minutes(e.slug)} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {starter.length ? (
          <section aria-labelledby="terms-heading">
            <h2 id="terms-heading" className="text-xl font-semibold text-text sm:text-2xl">
              Terms to know
            </h2>
            <p className="mt-2 max-w-3xl text-muted">
              Plain definitions, each with how the catalog uses the term and a real example. The <Link href="/glossary/" className="link">glossary</Link> has all{" "}
              {glossary.length}.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {starter.map((id) => (
                <li key={id}>
                  <Link prefetch={false} href={`/glossary/#${id}`} className="badge px-3 py-1.5 text-[0.875rem] hover:border-cyan hover:text-white">
                    {glossaryIds.get(id)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="hubs-heading">
          <h2 id="hubs-heading" className="text-xl font-semibold text-text sm:text-2xl">
            Topic hubs
          </h2>
          <p className="mt-2 max-w-3xl text-muted">Sourced introductions to parts of the landscape, each with a reading path into the catalog and its primary documents.</p>
          <ul className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hubs.map((h) => (
              <li key={h.slug}>
                <Link prefetch={false} href={`/hubs/${h.slug}/`} className="card card-link flex h-full flex-col p-5">
                  <span className="font-semibold text-text">{h.title}</span>
                  <span className="mt-1.5 text-sm text-muted">{h.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="more-heading">
          <h2 id="more-heading" className="text-xl font-semibold text-text sm:text-2xl">
            Look things up
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: "/glossary/", label: "Glossary", note: "Terms used across the catalog", Icon: Search },
              { href: "/places/", label: "Places", note: "Organizations by documented headquarters state", Icon: MapPin },
              { href: "/timeline/", label: "Timeline", note: "Open releases and news events by documented date", Icon: CalendarClock },
              { href: "/sources/", label: "Source library", note: "Every cited source and the records that cite it", Icon: Library },
              { href: "/reuse/", label: "Data and reuse", note: "The public data files and reuse terms", Icon: ScrollText },
              { href: "/methodology/", label: "Methodology", note: "Eligibility, openness, sources, and dates", Icon: BookOpen },
            ].map(({ href, label, note, Icon }) => (
              <li key={href}>
                <Link prefetch={false} href={href} className="card card-link flex h-full items-start gap-3 p-4">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-line bg-elev text-cyan">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block font-semibold text-text">{label}</span>
                    <span className="mt-0.5 block text-sm text-muted">{note}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
