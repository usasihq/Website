import Link from "next/link";
import { Finder } from "@/components/Finder";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
import { artifactHref, orgHref } from "@/lib/routes";

export const metadata = pageMetadata({
  title: "Find AI for my needs",
  description:
    "Describe what you want to do, where it should run, your computer, and what you will pay for, and see documented configurations that fit, each with the reasons it matches, the evidence, and what remains unverified.",
  path: "/find/",
});

export default function FindPage() {
  const catalog = getCatalog();
  const hrefs: Record<string, string> = {};
  for (const c of catalog.finder) {
    for (const comp of c.components) {
      if (!comp.record_slug) continue;
      if (catalog.artifact(comp.record_slug)) hrefs[comp.record_slug] = artifactHref(comp.record_slug);
      else if (catalog.organization(comp.record_slug)) hrefs[comp.record_slug] = orgHref(comp.record_slug);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="Tool"
        title="Find AI for my needs"
        description={
          <p>
            Tell us what you want to do and what you are working with. The finder checks a small set of carefully documented configurations, explains why each
            one matches or does not, and shows what is still unverified. It is not a &ldquo;best AI&rdquo; ranking.
          </p>
        }
      />
      <div className="container-page grid gap-8 py-10">
        {catalog.finder.length ? (
          <Finder configs={catalog.finder} recordHrefs={hrefs} />
        ) : (
          <p className="text-muted">Configurations are being documented and will appear here.</p>
        )}
        <div className="max-w-3xl rounded-xl border border-line bg-elev/50 p-4 text-sm text-muted">
          <p>
            <strong className="text-text">How to read the results.</strong> Requirements restate each publisher&apos;s own documentation, read on the date shown. Memory
            labels compare your numbers with a publisher&apos;s stated figure for one exact variant: &ldquo;Estimated to fit&rdquo; means that figure is within what you
            entered, not that USASI ran it. Where no figure is published, the result says the evidence is insufficient rather than guessing. Prices are not listed;
            check the provider&apos;s pricing page and note the date.
          </p>
          <p className="mt-2">
            New to this? Read <Link href="/learn/hosted-or-local/" className="link">choosing hosted access or local inference</Link> and{" "}
            <Link href="/learn/inference-hardware/" className="link">understanding inference hardware</Link>, or use the{" "}
            <Link href="/learn/tools/model-size/" className="link">model size calculator</Link>.
          </p>
        </div>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
