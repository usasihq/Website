import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { MEMORY_INDEX_HREF, MEMORY_PAGES, memoryPageHref, memoryPageResults, memoryPageTitle, type MemoryPage } from "@/lib/hardware";
import { pageMetadata } from "@/lib/metadata";
import { cardImage } from "@/lib/page-cards";
import { breadcrumbList, ldJson } from "@/lib/page-jsonld";
import { absoluteUrl } from "@/lib/paths";

export const metadata = pageMetadata({
  title: "Local AI models by memory: VRAM and Apple silicon",
  description:
    "Which documented local AI configurations fit 8, 12, 16, or 24 GB of VRAM, or 8 to 64 GB of Apple silicon unified memory, by publishers' own figures.",
  path: MEMORY_INDEX_HREF,
  image: cardImage(getCatalog(), MEMORY_INDEX_HREF),
});

const GROUPS: { kind: MemoryPage["kind"]; title: string; note: string }[] = [
  { kind: "vram", title: "Graphics card memory (VRAM)", note: "Compared with publishers' graphics-memory figures only." },
  { kind: "apple-silicon", title: "Apple silicon unified memory (macOS)", note: "Unified memory is compared with graphics-memory and system-memory figures alike." },
];

export default function MemoryIndexPage() {
  const catalog = getCatalog();
  const rows = MEMORY_PAGES.map((p) => ({ p, r: memoryPageResults(catalog.finder, p) }));
  const crumbs = [
    { href: "/find/", label: "Find AI for my needs" },
    { href: MEMORY_INDEX_HREF, label: "By memory" },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: "Local AI models by memory",
        url: absoluteUrl(MEMORY_INDEX_HREF),
        numberOfItems: rows.length,
        itemListElement: rows.map(({ p }, i) => ({ "@type": "ListItem", position: i + 1, name: memoryPageTitle(p), url: absoluteUrl(memoryPageHref(p)) })),
      },
      breadcrumbList(crumbs),
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }} />
      <PageHeader
        eyebrow="Local AI by memory"
        title="Local AI models by memory"
        crumbs={crumbs}
        description={
          <p>
            Choose how much graphics memory (VRAM) your card has, or how much unified memory your Apple silicon Mac has, to see which documented local
            configurations in this catalog fit by their publishers&apos; own memory figures. Each page uses the same rule as the{" "}
            <Link href="/find/" className="link">finder</Link>, names the exact variant, and cites the source of every figure.
          </p>
        }
      />
      <div className="container-page grid gap-10 py-10">
        {GROUPS.map((g) => (
          <section key={g.kind} aria-labelledby={`${g.kind}-heading`}>
            <h2 id={`${g.kind}-heading`} className="text-xl font-semibold text-text sm:text-2xl">
              {g.title}
            </h2>
            <p className="mt-1 text-sm text-muted">{g.note}</p>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {rows
                .filter(({ p }) => p.kind === g.kind)
                .map(({ p, r }) => (
                  <li key={p.slug}>
                    <Link prefetch={false} href={memoryPageHref(p)} className="card flex h-full flex-col gap-1 p-4 hover:border-cyan">
                      <span className="font-semibold text-text">{memoryPageTitle(p).replace(/ \(documented\)$/, "")}</span>
                      <span className="text-sm text-muted">
                        {r.fits.length} {r.fits.length === 1 ? "configuration fits" : "configurations fit"}
                        {r.fits.length ? `: ${r.fits.map((e) => e.config.title).join("; ")}` : ""}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
        <p className="max-w-3xl rounded-xl border border-line bg-elev/50 p-4 text-sm text-muted">
          These are estimates from documentation, not tests, unless an entry says otherwise. They do not cover speed, context length, or every operating system.
          For a different amount, enter it in the <Link href="/find/?where=local" className="link">finder</Link> or estimate with the{" "}
          <Link href="/learn/tools/model-size/" className="link">model size calculator</Link>.
        </p>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
