import Link from "next/link";
import { Mail, Rss } from "lucide-react";
import { siteConfig, type NewsletterConfig } from "@/lib/site-config";
import { asset } from "@/lib/paths";

/**
 * Weekly email signup as an outbound link to the owner's hosted signup page.
 * USASI never collects email addresses; without a configured URL the block
 * says so honestly and points to the RSS feed instead.
 */
export function NewsletterSignup({ variant = "block", config = siteConfig.newsletter }: { variant?: "block" | "compact"; config?: NewsletterConfig }) {
  if (!config.enabled) return null;
  const active = Boolean(config.url);
  const compact = variant === "compact";
  return (
    <aside
      aria-labelledby="newsletter-heading"
      className={`@container rounded-2xl border border-line bg-[rgba(8,14,30,0.7)] ${compact ? "p-4" : "p-5 sm:p-6"}`}
      data-newsletter={active ? "active" : "unconfigured"}
    >
      {/* Lays out by its own width (container query), so it stacks in narrow sidebars. */}
      <div className="flex flex-col gap-4 @xl:flex-row @xl:items-center @xl:justify-between">
        <div className="flex gap-3">
          <Mail aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-cyan" />
          <div>
            <h2 id="newsletter-heading" className={`font-semibold text-text ${compact ? "text-base" : "text-lg"}`}>
              {config.heading}
            </h2>
            <p className="mt-0.5 text-[0.9375rem] text-muted">{config.description}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 @xl:shrink-0 @xl:items-end">
          {active ? (
            <>
              <a href={config.url!} className="btn btn-secondary" rel="noopener noreferrer">
                Subscribe{config.provider ? ` on ${config.provider}` : ""}
                <span className="sr-only"> (external site)</span>
              </a>
              <p className="max-w-xs text-sm text-muted @xl:text-right">
                Signup happens on {config.provider ?? "the provider"}’s website. USASI doesn’t collect your email address.
              </p>
            </>
          ) : (
            <p className="self-start rounded-lg border border-dashed border-line-strong px-3 py-2 text-[0.9375rem] text-ice @xl:self-auto" data-testid="newsletter-unavailable">
              The weekly email is coming soon.
            </p>
          )}
          <a href={asset("/news/feed.xml")} className="link inline-flex items-center gap-1 text-sm" type="application/rss+xml">
            <Rss aria-hidden="true" className="h-3.5 w-3.5" /> RSS feed
          </a>
        </div>
      </div>
      {compact ? null : (
        <p className="mt-3 text-sm text-muted">
          Any newsletter sponsorships are labeled and never affect the catalog.{" "}
          <Link prefetch={false} href="/support/#sponsorship" className="link">
            Sponsorship policy
          </Link>
        </p>
      )}
    </aside>
  );
}
