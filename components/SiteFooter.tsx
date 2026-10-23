import Link from "@/components/Link";
import { BuildDate } from "./BuildDate";
import { asset, repositoryUrl } from "@/lib/paths";
import { siteConfig } from "@/lib/site-config";
import { BrandMark } from "./BrandMark";
import { ContactLinks } from "./ContactLinks";
import { ExternalLink } from "./ExternalLink";

/**
 * The one outbound pointer to the standalone people site. The People section was
 * removed from USASI (see docs/PEOPLE_MOVED.md); this plain link is the only
 * remaining mention. No tracking parameters, no referral markup.
 */
export const PEOPLE_WIKI_URL = "https://aipeoplewiki.com/";

const COLUMNS = [
  {
    heading: "Explore",
    links: [
      { href: "/companies/", label: "Companies & Labs" },
      { href: "/open/", label: "Open Models & Tools" },
      { href: "/github/", label: "AI on GitHub" },
      { href: "/huggingface/", label: "AI on Hugging Face" },
      { href: "/matrix/", label: "Compare" },
      { href: "/jobs/", label: "Jobs" },
      { href: "/jobs/index/", label: "AI Hiring Index" },
      { href: "/jobs/pay/", label: "AI pay" },
      { href: "/hubs/", label: "Hubs" },
      { href: "/places/", label: "Places" },
      { href: "/timeline/", label: "Timeline" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { href: "/start/", label: "Start here" },
      { href: "/learn/", label: "Learn" },
      { href: "/kids/", label: "For kids" },
      { href: "/glossary/", label: "Glossary" },
      { href: "/faq/", label: "FAQ" },
      { href: "/policy/", label: "Policy tracker" },
      { href: "/report/", label: "State of American AI" },
      { href: "/sources/", label: "Source library" },
    ],
  },
  {
    heading: "News & updates",
    links: [
      { href: "/news/", label: "Latest news" },
      { href: "/new/", label: "New this week" },
      { href: "/newsletter/", label: "Weekly email" },
      { href: "/feeds/", label: "RSS feeds" },
    ],
  },
  {
    heading: "Project",
    links: [
      { href: "/about/", label: "About" },
      { href: "/methodology/", label: "Methodology" },
      { href: "/compact/", label: "USASI Compact v0.2" },
      { href: "/changelog/", label: "Changelog" },
      { href: "/contribute/", label: "Contribute" },
      { href: "/reuse/", label: "Data & reuse" },
      { href: "/badges/", label: "Badges for maintainers" },
    ],
  },
  {
    heading: "Policies",
    links: [
      { href: "/disclaimer/", label: "Disclaimer" },
      { href: "/privacy/", label: "Privacy" },
      { href: "/support/", label: "Support" },
    ],
  },
];

export function SiteFooter() {
  const repo = repositoryUrl();
  return (
    <footer className="theme-dark border-t-4 border-gold bg-[var(--footer-bg)]">
      <div className="container-page pb-20 pt-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-[1.5fr_repeat(5,minmax(0,1fr))] lg:gap-x-8">
          <div className="col-span-2 max-w-sm sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-3">
              <BrandMark className="h-8 w-8" />
              <p className="font-semibold tracking-[0.06em]">{siteConfig.shortName}</p>
            </div>
            <p className="mt-3 text-[0.9375rem] text-muted">{siteConfig.name}. {siteConfig.tagline}</p>
            <p className="mt-4 rounded-lg border border-line bg-surface/60 px-3 py-2 text-sm font-medium text-text" data-testid="footer-disclaimer">
              {siteConfig.disclaimer}
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="eyebrow text-[0.75rem]">{col.heading}</h2>
              <ul className="mt-3 space-y-0.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-flex min-h-8 items-center text-sm text-muted transition-colors hover:text-text">
                      {l.label}
                    </Link>
                  </li>
                ))}
                {col.heading === "News & updates" ? (
                  <li>
                    <a
                      href={PEOPLE_WIKI_URL}
                      rel="noopener"
                      data-testid="people-wiki-link"
                      className="inline-flex min-h-8 items-center text-sm text-muted transition-colors hover:text-text"
                    >
                      People → AI People Wiki
                    </a>
                  </li>
                ) : null}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
          <h2 className="eyebrow shrink-0">Contact &amp; follow</h2>
          <ContactLinks variant="inline" />
        </div>

        <hr className="rule my-8" />

        <div className="flex flex-col gap-3 text-sm text-muted md:flex-row md:items-start md:justify-between">
          <p className="max-w-2xl">
            Listings are nominative references, not endorsements or federal approvals. Code is MIT-licensed; original catalog prose is CC BY 4.0.
            The artwork, fonts, and third-party names and marks are excluded — see{" "}
            <Link href="/about/#licenses" className="link">
              licenses
            </Link>
            .
          </p>
          <div className="flex flex-col gap-1 md:items-end">
            <a href={asset("/data/catalog.json")} className="link" type="application/json">
              Catalog data (JSON)
            </a>
            {repo ? <ExternalLink href={repo}>Source repository</ExternalLink> : null}
            <BuildDate />
          </div>
        </div>
      </div>
    </footer>
  );
}
