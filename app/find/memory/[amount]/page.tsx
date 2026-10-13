import Link from "next/link";
import { notFound } from "next/navigation";
import { AmountPicker, ComponentLink, MemoryEntryCard } from "@/components/MemoryPages";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog, type Catalog } from "@/lib/catalog";
import {
  appleMac,
  figureText,
  finderHref,
  MEMORY_INDEX_HREF,
  MEMORY_PAGES,
  memoryLabel,
  memoryPage,
  memoryPageAnswer,
  memoryPageHref,
  memoryPageIndexable,
  memoryPageResults,
  memoryPageTitle,
  memoryShortLabel,
  type MemoryEntry,
  type MemoryPage,
} from "@/lib/hardware";
import { pageMetadata } from "@/lib/metadata";
import { cardImage } from "@/lib/page-cards";
import { breadcrumbList, ldJson } from "@/lib/page-jsonld";
import { absoluteUrl } from "@/lib/paths";
import type { Assessment } from "@/lib/finder";

export const dynamicParams = false;

export function generateStaticParams() {
  return MEMORY_PAGES.map((p) => ({ amount: p.slug }));
}

function description(p: MemoryPage, fits: MemoryEntry[]) {
  const n = fits.length;
  const where = p.kind === "vram" ? `${p.gb} GB of graphics memory (VRAM)` : appleMac(p.gb);
  const untested = fits.every((e) => !e.config.tested) ? " Estimates, not tests." : "";
  return `${n} documented local AI ${n === 1 ? "configuration fits" : "configurations fit"} ${where} by publishers' own memory figures, with sources, runtimes, and licenses.${untested}`;
}

export async function generateMetadata({ params }: { params: Promise<{ amount: string }> }) {
  const p = memoryPage((await params).amount);
  if (!p) return {};
  const catalog = getCatalog();
  const path = memoryPageHref(p);
  return pageMetadata({
    title: memoryPageTitle(p),
    description: description(p, memoryPageResults(catalog.finder, p).fits),
    path,
    image: cardImage(catalog, path),
    noindex: !memoryPageIndexable(catalog.finder, p),
  });
}

function OtherList({ id, title, intro, items, page, catalog }: { id: string; title: string; intro: React.ReactNode; items: (Assessment | MemoryEntry)[]; page: MemoryPage; catalog: Catalog }) {
  return (
    <section aria-labelledby={`${id}-heading`} className="max-w-3xl">
      <h2 id={`${id}-heading`} className="text-xl font-semibold text-text">
        {title} ({items.length})
      </h2>
      <p className="mt-2 text-[0.9375rem] text-muted">{intro}</p>
      <ul className="mt-4 space-y-3">
        {items.map((a) => {
          const model = a.config.components.find((x) => x.role === "model");
          return (
            <li key={a.config.slug} id={a.config.slug} className="scroll-mt-28 rounded-xl border border-line p-4 text-sm">
              <p className="font-semibold text-text">{a.config.title}</p>
              <p className="mt-1 text-muted">
                {"figure" in a ? <>Publisher&apos;s figure: {figureText(a)} for {a.config.memory!.variant}. </> : null}
                {model ? (
                  <>
                    Model: <ComponentLink catalog={catalog} comp={model} />.{" "}
                  </>
                ) : null}
                <Link prefetch={false} href={finderHref(page, a.config.tasks[0])} className="link">
                  Open in the finder
                </Link>
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default async function MemoryAmountPage({ params }: { params: Promise<{ amount: string }> }) {
  const p = memoryPage((await params).amount);
  if (!p) notFound();
  const catalog = getCatalog();
  const r = memoryPageResults(catalog.finder, p);
  const path = memoryPageHref(p);
  const label = memoryLabel(p);
  const counts = Object.fromEntries(MEMORY_PAGES.map((x) => [x.slug, memoryPageResults(catalog.finder, x).fits.length]));
  const crumbs = [
    { href: "/find/", label: "Find AI for my needs" },
    { href: MEMORY_INDEX_HREF, label: "By memory" },
    { href: path, label: memoryShortLabel(p) },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: memoryPageTitle(p),
        description: memoryPageAnswer(r),
        url: absoluteUrl(path),
        numberOfItems: r.fits.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: r.fits.map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.config.title, url: absoluteUrl(`${path}#${e.config.slug}`) })),
      },
      breadcrumbList(crumbs),
    ],
  };
  const unified = p.kind === "apple-silicon";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }} />
      <PageHeader
        eyebrow="Local AI by memory"
        title={unified ? `AI models you can run on ${appleMac(p.gb)}` : `AI models you can run on ${p.gb} GB of VRAM`}
        crumbs={crumbs}
        description={
          <>
            <p data-testid="memory-answer">{memoryPageAnswer(r)}</p>
            <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-base">
              <Link href={finderHref(p)} className="link">
                Open the finder with {memoryShortLabel(p)}
              </Link>
              <a href="#other-amounts" className="link">
                Choose another amount
              </a>
            </p>
          </>
        }
      />
      <div className="container-page grid gap-12 py-10">
        <section aria-labelledby="fits-heading">
          <h2 id="fits-heading" className="text-xl font-semibold text-text sm:text-2xl">
            {r.fits.length} {r.fits.length === 1 ? "configuration fits" : "configurations fit"} {label}
          </h2>
          <p className="mt-2 max-w-3xl text-muted">
            Ordered by the publisher&apos;s memory figure, smallest first. This is not a ranking. Each entry names the exact variant the figure is for.
          </p>
          {r.fits.length ? (
            <div className="mt-5 grid gap-5">
              {r.fits.map((e) => (
                <MemoryEntryCard key={e.config.slug} entry={e} page={p} catalog={catalog} />
              ))}
            </div>
          ) : (
            <p className="mt-5 text-muted">None yet. Configurations are added as publishers document memory figures for specific variants.</p>
          )}
        </section>

        {r.needsMore.length ? (
          <OtherList
            id="needs-more"
            title={`Documented, but needs more than ${p.gb} GB`}
            intro="These would otherwise match, but the publisher's figure is higher than this amount."
            items={r.needsMore}
            page={p}
            catalog={catalog}
          />
        ) : null}
        {r.systemFigure.length ? (
          <OtherList
            id="system-memory"
            title="Stated as system memory, not graphics memory"
            intro={
              <>
                These figures are recorded as memory or system memory (RAM), not graphics memory, so the finder compares them with system memory and never with
                VRAM. They are not counted above. Enter your system memory in the finder to compare.
              </>
            }
            items={r.systemFigure}
            page={p}
            catalog={catalog}
          />
        ) : null}
        {r.noFigure.length ? (
          <OtherList
            id="no-figure"
            title="Runs locally, but no memory figure is published"
            intro="The publisher does not state a memory figure for a specific variant, so USASI does not estimate one and these are not counted above."
            items={r.noFigure}
            page={p}
            catalog={catalog}
          />
        ) : null}

        <section aria-labelledby="method-heading" className="max-w-3xl rounded-xl border border-line bg-elev/50 p-5 text-[0.9375rem] text-muted">
          <h2 id="method-heading" className="text-lg font-semibold text-text">
            How this list is made
          </h2>
          <p className="mt-2">
            Every configuration in the <Link href="/find/" className="link">finder</Link> records its publisher&apos;s own memory statement for one exact variant. A
            configuration is listed here when the finder, given {unified ? `macOS on Apple silicon with ${p.gb} GB of memory` : `${p.gb} GB of graphics memory`} and
            &ldquo;on my computer&rdquo;, finds that every answer is met and that the publisher&apos;s figure is at or below {p.gb} GB. It is the same rule the finder
            uses, not a separate estimate.{" "}
            {unified
              ? "Apple silicon shares one pool of unified memory, so a graphics-memory figure and a system-memory figure are both compared with it."
              : "Only configurations whose documentation lists NVIDIA, AMD or Intel graphics are considered, a graphics-memory figure is compared only with graphics memory, and a figure stated as system memory is never counted against VRAM."}
          </p>
          <p className="mt-3 font-semibold text-text">What this does not tell you</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>Speed: how quickly a model responds on your hardware is not documented here.</li>
            <li>
              Context length: a publisher&apos;s figure can leave out memory for the context window, which grows with longer prompts and responses, and for other
              software running at the same time. Read each publisher&apos;s statement.
            </li>
            <li>Operating system, drivers, and graphics support: check each entry&apos;s documented platforms and graphics hardware.</li>
            <li>Testing: USASI has not run these configurations unless an entry says it was tested.</li>
          </ul>
          <p className="mt-3">
            To estimate memory for a model and precision yourself, use the <Link href="/learn/tools/model-size/" className="link">model size calculator</Link>, or read{" "}
            <Link href="/learn/inference-hardware/" className="link">understanding inference hardware</Link>.
          </p>
        </section>

        <section id="other-amounts" aria-labelledby="other-amounts-heading" className="scroll-mt-28">
          <h2 id="other-amounts-heading" className="text-xl font-semibold text-text">
            Choose another amount
          </h2>
          <p className="mt-2 text-sm text-muted">The number in brackets is how many documented configurations fit each amount.</p>
          <div className="mt-4">
            <AmountPicker current={p} counts={counts} />
          </div>
          <p className="mt-6 text-sm text-muted">
            <Link href={MEMORY_INDEX_HREF} className="link">All amounts</Link> · <Link href="/hubs/local-ai/" className="link">Running AI on your own hardware</Link> ·{" "}
            <Link href="/find/" className="link">Find AI for my needs</Link>
          </p>
        </section>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
