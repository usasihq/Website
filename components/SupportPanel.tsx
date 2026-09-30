import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { siteConfig, supportState, type SupportConfig } from "@/lib/site-config";

type Variant = "home" | "standard" | "compact";

/**
 * "Support Us" — optional tips via an owner-supplied external link.
 * No payment is processed here and nothing is loaded from a provider until a
 * visitor chooses to follow the link. Without a configured tip URL the panel
 * stays visible and says so honestly, with no active payment action.
 */
export function SupportPanel({ variant = "standard", config = siteConfig.support }: { variant?: Variant; config?: SupportConfig }) {
  if (!config.enabled) return null;
  const { active, amountLinks } = supportState(config);
  const home = variant === "home";
  const compact = variant === "compact";

  return (
    <section aria-labelledby="support-heading" className={home ? "py-16 sm:py-20" : compact ? "py-10" : "py-14"} data-support-panel={active ? "active" : "unconfigured"}>
      <div className="container-page">
        <div
          className={`relative overflow-hidden rounded-2xl border border-[rgba(76,201,255,0.28)] bg-[linear-gradient(135deg,#0b1428_0%,#081022_60%,#0a1530_100%)] ${
            home ? "p-6 sm:p-10 lg:p-12" : compact ? "p-5 sm:p-6" : "p-6 sm:p-8"
          }`}
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(76,201,255,0.14),transparent_70%)]" />
          <div className={`relative grid gap-6 ${home ? "lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12" : "md:grid-cols-[1fr_auto] md:items-center md:gap-8"}`}>
            <div className="flex gap-4">
              <span aria-hidden="true" className={`mt-1 inline-flex shrink-0 items-center justify-center rounded-full border border-[rgba(76,201,255,0.35)] text-cyan ${compact ? "h-9 w-9" : "h-11 w-11"}`}>
                <Heart className={compact ? "h-4 w-4" : "h-5 w-5"} strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <h2 id="support-heading" className={`font-semibold text-text ${home ? "text-2xl sm:text-3xl" : compact ? "text-lg" : "text-xl sm:text-2xl"}`}>
                  {config.heading}
                </h2>
                <p className={`mt-1 text-ice ${compact ? "text-[0.9375rem]" : "text-base sm:text-lg"}`}>{config.subheading}</p>
                {!compact || !active ? (
                  <p className={`mt-3 max-w-2xl text-muted ${compact ? "text-[0.9375rem]" : ""}`}>{config.body}</p>
                ) : null}
              </div>
            </div>

            <div className={`flex flex-col gap-3 ${home ? "lg:min-w-[18rem] lg:items-end" : "md:items-end"}`}>
              {active ? (
                <>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <a href={config.tipUrl!} className="btn btn-primary" rel="noopener noreferrer">
                      Leave a tip
                      <span className="sr-only">{config.providerLabel ? ` on ${config.providerLabel} (external site)` : " (external site)"}</span>
                    </a>
                    {amountLinks.map((link) => (
                      <a key={link.url} href={link.url} className="btn btn-secondary" rel="noopener noreferrer">
                        {link.label}
                        <span className="sr-only"> tip (external site)</span>
                      </a>
                    ))}
                  </div>
                  <p className="max-w-xs text-sm text-muted md:text-right">
                    Optional. No USASI account required. Payment takes place on the linked provider’s website
                    {config.providerLabel ? ` (${config.providerLabel})` : ""}.
                  </p>
                </>
              ) : (
                <p className="inline-flex items-center gap-2 rounded-lg border border-dashed border-line-strong px-4 py-2.5 text-[0.9375rem] text-ice" data-testid="support-unavailable">
                  Tips will be available here soon.
                </p>
              )}
              <Link href="/support/" className="link inline-flex items-center gap-1 text-[0.9375rem]">
                About supporting this project
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
