import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { LICENSE_CATEGORY_LABELS, uncoveredLicenses, usesOfLicense } from "@/lib/licenses";
import { pageMetadata } from "@/lib/metadata";
import type { LicenseCategory } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "License guide",
  description:
    "Plain-language guides to the licenses on U.S.-led open models, software, and datasets in the catalog: what each license says about use, attribution, restrictions, and derivatives, with the records that use it.",
  path: "/licenses/",
});

const CATEGORY_ORDER: LicenseCategory[] = ["permissive", "copyleft", "model-license", "non-commercial", "data-license", "content-license", "other"];

export default function LicensesPage() {
  const catalog = getCatalog();
  const guides = catalog.licenses.map((g) => ({ g, uses: usesOfLicense(catalog, g) }));
  const groups = CATEGORY_ORDER.map((c) => ({ category: c, items: guides.filter((x) => x.g.category === c).sort((a, b) => b.uses.length - a.uses.length || a.g.name.localeCompare(b.g.name)) })).filter(
    (x) => x.items.length > 0,
  );
  const uncovered = uncoveredLicenses(catalog);
  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="License guide"
        description={
          <p>
            What the licenses on open models, software, and datasets in this catalog actually say, in plain words, with the records that use each one. Every
            guide restates the license text and links to it. This is general information, not legal advice: read the license itself before you rely on it.
          </p>
        }
      />
      <div className="container-page grid gap-12 py-10">
        <p className="max-w-3xl text-muted">
          One release can carry several licenses, for example one for its weights and another for its code. Start with{" "}
          <Link href="/learn/open-weight-vs-open-source/" className="link">
            what open weight and open source actually mean
          </Link>{" "}
          if the difference is new to you.
        </p>
        {groups.map(({ category, items }) => (
          <section key={category} aria-labelledby={`cat-${category}`}>
            <h2 id={`cat-${category}`} className="text-xl font-semibold text-text sm:text-2xl">
              {LICENSE_CATEGORY_LABELS[category]}s
            </h2>
            <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map(({ g, uses }) => (
                <li key={g.slug}>
                  <Link prefetch={false} href={`/licenses/${g.slug}/`} className="card card-link group flex h-full flex-col p-5">
                    <span className="flex items-start gap-3">
                      <Scale aria-hidden="true" className="mt-0.5 h-5 w-5 flex-none text-cyan" />
                      <span className="font-semibold text-text group-hover:text-white">{g.name}</span>
                    </span>
                    <span className="mt-2 line-clamp-3 text-sm text-muted">{g.summary.text}</span>
                    <span className="mt-auto flex items-center justify-between gap-3 pt-4 text-sm">
                      <span className="meta">{g.spdx ?? "Custom license"}</span>
                      <span className="inline-flex items-center gap-1 text-muted">
                        {uses.length} {uses.length === 1 ? "use" : "uses"} in the catalog
                        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 text-cyan transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {uncovered.length ? (
          <section aria-labelledby="uncovered-heading">
            <h2 id="uncovered-heading" className="text-xl font-semibold text-text sm:text-2xl">
              Licenses without a guide yet
            </h2>
            <p className="mt-2 max-w-3xl text-muted">
              Other licenses that records in the catalog use. Each record links to its license text; guides are added over time.
            </p>
            <ul className="mt-4 columns-1 gap-8 text-sm text-muted sm:columns-2 lg:columns-3">
              {uncovered.map((u) => (
                <li key={u.name} className="mb-1.5 break-inside-avoid">
                  {u.name} <span className="meta">({u.count})</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
