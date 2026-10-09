import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Route } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { LEARNING_PATHS, availableSteps, explainer, learningPath } from "@/lib/learn";
import { explainerOutline } from "@/lib/learn-outline";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

type Step = { key: string; href: string; title: string; kind: string; note: string; detail?: string; minutes: number };

export function generateStaticParams() {
  return LEARNING_PATHS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const p = learningPath((await params).id);
  return pageMetadata({ title: p ? `${p.title}: a learning path` : "Learning path", description: p?.description ?? "", path: `/learn/paths/${(await params).id}/` });
}

export default async function LearningPathPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = learningPath(id);
  if (!p) notFound();
  const catalog = getCatalog();
  const steps: Step[] = availableSteps(p, new Set(catalog.hubs.map((h) => h.slug))).map((s) => {
    if (s.kind === "explainer") {
      const e = explainer(s.slug)!;
      const minutes = explainerOutline(e.slug).minutes;
      return { key: `explainer:${e.slug}`, href: `/learn/${e.slug}/`, title: e.title, kind: "Explainer", note: s.note, detail: `${e.level} · ${minutes} min`, minutes };
    }
    if (s.kind === "hub") {
      const h = catalog.hub(s.slug)!;
      return { key: `hub:${h.slug}`, href: `/hubs/${h.slug}/`, title: h.title, kind: "Topic hub", note: s.note, minutes: 0 };
    }
    return { key: `page:${s.href}`, href: s.href, title: s.label, kind: "Reference", note: s.note, minutes: 0 };
  });
  const minutesTotal = steps.reduce((n, s) => n + s.minutes, 0);
  const others = LEARNING_PATHS.filter((o) => o.id !== p.id);
  return (
    <>
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-1.5">
            <Route aria-hidden="true" className="h-3.5 w-3.5" /> Learning path · {p.audience}
          </span>
        }
        title={p.title}
        crumbs={[
          { href: "/learn/", label: "Learn" },
          { href: `/learn/paths/${p.id}/`, label: p.title },
        ]}
        description={<p>{p.description}</p>}
      />
      <div className="container-page grid gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-label="Steps">
          <p className="text-sm text-muted">
            {steps.length} steps · about {minutesTotal} min of reading
          </p>
          <ol className="relative mt-6 space-y-4 before:absolute before:bottom-6 before:left-[1.125rem] before:top-6 before:w-px before:bg-line-strong">
            {steps.map((s, i) => (
              <li key={s.key} className="relative flex gap-4">
                <span
                  aria-hidden="true"
                  className="relative z-10 flex h-9 w-9 flex-none items-center justify-center rounded-full border border-cyan/60 bg-bg font-mono text-sm text-cyan"
                >
                  {i + 1}
                </span>
                <Link prefetch={false} href={s.href} className="card card-link group flex min-w-0 flex-1 flex-col p-5">
                  <span className="text-xs uppercase tracking-[0.08em] text-muted">
                    Step {i + 1} · {s.kind}
                    {s.detail ? ` · ${s.detail}` : ""}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-lg font-semibold text-text group-hover:text-white">
                    {s.title}
                    <ArrowRight aria-hidden="true" className="h-4 w-4 text-cyan transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-1 text-[0.9375rem] text-muted">{s.note}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
        <aside aria-labelledby="other-paths-heading">
          <h2 id="other-paths-heading" className="text-xs font-semibold uppercase tracking-[0.08em] text-ice">
            Other learning paths
          </h2>
          <ul className="mt-3 space-y-3">
            {others.map((o) => (
              <li key={o.id}>
                <Link prefetch={false} href={`/learn/paths/${o.id}/`} className="card card-link block p-4">
                  <span className="block font-semibold text-text">{o.title}</span>
                  <span className="mt-1 block text-sm text-muted">{o.audience}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/learn/" className="link mt-5 inline-block text-sm">
            All explainers and hubs
          </Link>
        </aside>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
