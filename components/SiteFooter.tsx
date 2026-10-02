import Link from "next/link";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { asset, repositoryUrl } from "@/lib/paths";
import { siteConfig } from "@/lib/site-config";
import { BrandMark } from "./BrandMark";
import { ContactLinks } from "./ContactLinks";
import { ExternalLink } from "./ExternalLink";

const COLUMNS = [
  {
    heading: "Directories",
    links: [
      { href: "/companies/", label: "Companies & Labs" },
      { href: "/open/", label: "Open Models & Tools" },
      { href: "/matrix/", label: "Compare" },
      { href: "/jobs/", label: "Jobs" },
      { href: "/news/", label: "Latest news" },
    ],
  },
  {
    heading: "Project",
    links: [
      { href: "/start/", label: "Start here" },
      { href: "/glossary/", label: "Glossary" },
      { href: "/methodology/", label: "Methodology" },
      { href: "/compact/", label: "USASI Compact v0.2" },
      { href: "/about/", label: "About" },
      { href: "/local/", label: "People Behind Local AI" },
      { href: "/changelog/", label: "Changelog" },
      { href: "/reuse/", label: "Data & reuse" },
      { href: "/contribute/", label: "Contribute" },
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
  const catalog = getCatalog();
  const repo = repositoryUrl();
  return (
    <footer className="border-t border-line bg-[#040613]">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <BrandMark className="h-8 w-8" />
              <p className="font-semibold tracking-[0.06em]">{siteConfig.shortName}</p>
            </div>
            <p className="mt-3 text-[0.9375rem] text-muted">{siteConfig.name}. {siteConfig.tagline}</p>
            <p className="mt-4 rounded-lg border border-line px-3 py-2 text-[0.9375rem] font-medium text-text" data-testid="footer-disclaimer">
              {siteConfig.disclaimer}
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="eyebrow">{col.heading}</h2>
              <ul className="mt-3 space-y-1">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-flex min-h-9 items-center text-[0.9375rem] text-muted hover:text-text">
                      {l.label}
                    </Link>
                  </li>
                ))}
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
            <p className="meta">
              Site generated <time dateTime={catalog.buildAt}>{formatDate(catalog.buildAt.slice(0, 10))}</time>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
