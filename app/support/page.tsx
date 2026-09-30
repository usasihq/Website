import { Heart } from "lucide-react";
import Content from "@/content/pages/support.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import { pageMetadata } from "@/lib/metadata";
import { siteConfig, supportState } from "@/lib/site-config";

export const metadata = pageMetadata({
  title: "Support",
  description: "Optional tips help with USASI's upkeep. Tips never affect listings, coverage, or openness assessments, and payment happens on an external provider's site.",
  path: "/support/",
});

function TipAction() {
  const config = siteConfig.support;
  const { active, amountLinks } = supportState(config);
  return (
    <div
      className="mb-10 max-w-3xl rounded-2xl border border-[rgba(76,201,255,0.28)] bg-[linear-gradient(135deg,#0b1428_0%,#081022_100%)] p-6 font-sans"
      data-support-panel={active ? "active" : "unconfigured"}
    >
      <div className="flex gap-4">
        <span aria-hidden="true" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(76,201,255,0.35)] text-cyan">
          <Heart className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-text">{config.subheading}</h2>
          <p className="mt-2 text-muted">{config.body}</p>
          <div className="mt-4">
            {active ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <a href={config.tipUrl!} className="btn btn-primary" rel="noopener noreferrer">
                    Leave a tip
                    <span className="sr-only">{config.providerLabel ? ` on ${config.providerLabel} (external site)` : " (external site)"}</span>
                  </a>
                  {amountLinks.map((l) => (
                    <a key={l.url} href={l.url} className="btn btn-secondary" rel="noopener noreferrer">
                      {l.label}
                      <span className="sr-only"> tip (external site)</span>
                    </a>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted">
                  Optional. No USASI account required. Payment takes place on the linked provider’s website
                  {config.providerLabel ? ` (${config.providerLabel})` : ""}.
                </p>
              </>
            ) : (
              <p className="inline-flex rounded-lg border border-dashed border-line-strong px-4 py-2.5 text-[0.9375rem] text-ice" data-testid="support-unavailable">
                Tips will be available here soon.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <EditorialPage
      eyebrow="Support"
      title={siteConfig.support.heading}
      support={false}
      description={<p>How optional tips work, and what they never change.</p>}
    >
      <TipAction />
      <Content />
    </EditorialPage>
  );
}
