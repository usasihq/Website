import { Mail, Rss } from "lucide-react";
import Content from "@/content/pages/newsletter.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import { pageMetadata } from "@/lib/metadata";
import { asset } from "@/lib/paths";
import { siteConfig } from "@/lib/site-config";

export const metadata = pageMetadata({
  title: "The USASI weekly",
  description:
    "A weekly email summing up new catalog records, releases, license changes, corrections, and new explainers, each linked to its sourced page.",
  path: "/newsletter/",
});

export default function NewsletterPage() {
  const { heading, description, provider, url } = siteConfig.newsletter;
  return (
    <EditorialPage
      eyebrow="Weekly email"
      title={heading}
      description={<p>{description}</p>}
      headerExtra={
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          {url ? (
            <a href={url} className="btn btn-primary self-start" rel="noopener noreferrer" data-testid="newsletter-subscribe">
              <Mail aria-hidden="true" className="h-4 w-4" />
              Subscribe{provider ? ` on ${provider}` : ""}
              <span className="sr-only"> (external site)</span>
            </a>
          ) : (
            <p className="self-start rounded-lg border border-dashed border-line-strong px-3 py-2 text-[0.9375rem] text-ice">
              The weekly email is coming soon.
            </p>
          )}
          <a href={asset("/news/feed.xml")} className="link inline-flex items-center gap-1 text-[0.9375rem]" type="application/rss+xml">
            <Rss aria-hidden="true" className="h-4 w-4" /> RSS feed, no signup
          </a>
        </div>
      }
    >
      <Content />
    </EditorialPage>
  );
}
