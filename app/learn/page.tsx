import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { EXPLAINERS } from "@/lib/learn";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Learn",
  description: "Explainers, hubs, and a glossary that connect plain-language answers to catalog records and their primary sources.",
  path: "/learn/",
});

export default function LearnPage() {
  const hubs = getCatalog().hubs;
  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="Learn"
        description={<p>Plain-language guides that lead to real records and their sources. New here? <Link href="/start/" className="link">Start here</Link>.</p>}
      />
      <div className="container-page grid gap-12 py-10">
        <section aria-labelledby="explainers-heading">
          <h2 id="explainers-heading" className="text-xl font-semibold text-text">Explainers</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {EXPLAINERS.map((e) => (
              <li key={e.slug}>
                <Link prefetch={false} href={`/learn/${e.slug}/`} className="card flex h-full flex-col p-4 hover:border-cyan">
                  <span className="font-semibold text-text">{e.title}</span>
                  <span className="mt-1 text-sm text-muted">{e.question}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="hubs-heading">
          <h2 id="hubs-heading" className="text-xl font-semibold text-text">Hubs</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {hubs.map((h) => (
              <li key={h.slug}>
                <Link prefetch={false} href={`/hubs/${h.slug}/`} className="card flex h-full flex-col p-4 hover:border-cyan">
                  <span className="font-semibold text-text">{h.title}</span>
                  <span className="mt-1 text-sm text-muted">{h.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="more-heading">
          <h2 id="more-heading" className="text-xl font-semibold text-text">More reference</h2>
          <ul className="mt-3 space-y-2">
            <li><Link href="/glossary/" className="link">Glossary</Link> <span className="text-muted">: terms used across the catalog</span></li>
            <li><Link href="/places/" className="link">Places</Link> <span className="text-muted">: organizations by documented headquarters state</span></li>
            <li><Link href="/reuse/" className="link">Data and reuse</Link> <span className="text-muted">: the public data files and reuse terms</span></li>
            <li><Link href="/methodology/" className="link">Methodology</Link> <span className="text-muted">: eligibility, openness, sources, and dates</span></li>
          </ul>
        </section>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
