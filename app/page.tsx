import Link from "next/link";
import { ArrowRight, BookOpenCheck, Building2, Boxes, Landmark, Scale } from "lucide-react";
import { EntryTypeBadge, Monogram } from "@/components/Badges";
import { CoverageTable } from "@/components/CoverageTable";
import { HomepageSponsor } from "@/components/HomepageSponsor";
import { Hero } from "@/components/Hero";
import { HomeSearch } from "@/components/HomeSearch";
import { LocalCornerStrip } from "@/components/LocalCorner";
import { NewsCard } from "@/components/NewsList";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { ENTRY_TYPE_LABELS, entryTypeFor, ROLE_LABELS } from "@/lib/labels";
import { buildCoverage } from "@/lib/matrix";
import { pageMetadata } from "@/lib/metadata";
import { RUBRIC_LABEL } from "@/lib/openness";
import { absoluteUrl, asset } from "@/lib/paths";
import { artifactHref, orgHref } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";

export const metadata = pageMetadata({
  description:
    "An independent directory of U.S. AI organizations and U.S.-led open models, software, and research. Explore what they build, what is available, and where to find the original sources.",
  path: "/",
});

export default function HomePage() {
  const catalog = getCatalog();
  const counts = catalog.counts();
  const featured = catalog.featured;

  const pickOrgs = featured?.organizations.length
    ? featured.organizations.map((s) => catalog.organizations.find((o) => o.slug === s)!).filter(Boolean)
    : catalog.organizations.slice(0, 6);
  const pickArtifacts = featured?.artifacts.length
    ? featured.artifacts.map((s) => catalog.artifacts.find((a) => a.slug === s)!).filter(Boolean)
    : catalog.artifacts.slice(0, 6);

  const recentlyReviewed = [
    ...catalog.organizations.map((o) => ({ kind: "organization" as const, slug: o.slug, name: o.name, date: o.last_reviewed!, href: orgHref(o.slug), label: ENTRY_TYPE_LABELS.organization })),
    ...catalog.artifacts.map((a) => ({
      kind: "artifact" as const,
      slug: a.slug,
      name: a.name,
      date: a.last_reviewed!,
      href: artifactHref(a.slug),
      label: ENTRY_TYPE_LABELS[entryTypeFor(a.kind, a.record_level)],
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name))
    .slice(0, 8);

  const orgItems = catalog.organizations.map((o) => catalog.toOrgListItem(o));
  const artifactItems = catalog.artifacts.map((a) => catalog.toArtifactListItem(a));
  const coverage = buildCoverage(orgItems, artifactItems);
  const mostRecords = [...orgItems]
    .filter((o) => o.artifactCount > 0)
    .sort((a, b) => b.artifactCount - a.artifactCount || a.name.localeCompare(b.name))
    .slice(0, 8);
  const lastUpdated = [...catalog.organizations, ...catalog.artifacts].map((r) => r.updated_at).sort().at(-1);

  // Structured data for search engines. Serialized with "<" escaped so content can never close the script element.
  const orgId = `${absoluteUrl("/")}#organization`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: siteConfig.name,
        alternateName: siteConfig.shortName,
        url: absoluteUrl("/"),
        logo: absoluteUrl("/apple-icon.png"),
        description: "Independent, unofficial catalog of U.S. AI organizations and U.S.-led open models, software, and research.",
        ...(siteConfig.contact.email ? { email: siteConfig.contact.email } : {}),
        sameAs: siteConfig.socials.map((s) => s.url),
      },
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl("/")}#website`,
        url: absoluteUrl("/"),
        name: siteConfig.name,
        alternateName: siteConfig.shortName,
        inLanguage: "en-US",
        publisher: { "@id": orgId },
      },
      {
        "@type": "Dataset",
        name: "USASI catalog",
        description:
          "Published USASI records of U.S. AI organizations and U.S.-led open models, software, datasets, and evaluation tools, with sources for every claim.",
        url: absoluteUrl("/open/"),
        license: "https://creativecommons.org/licenses/by/4.0/",
        isAccessibleForFree: true,
        creator: { "@id": orgId },
        ...(lastUpdated ? { dateModified: lastUpdated } : {}),
        distribution: [{ "@type": "DataDownload", encodingFormat: "application/json", contentUrl: absoluteUrl("/data/catalog.json") }],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero />

      {/* 1–2. Introduction, search, and the two directory actions, all on the first screen. Phones: heading, actions,
          then description (DOM order). Desktop: heading and description on the left, actions on the right. */}
      <section aria-labelledby="intro-heading" className="relative">
        <div className="container-page pb-7 pt-3 sm:pt-4 lg:pb-8">
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-[1.1fr_1fr] lg:gap-x-14 lg:gap-y-4">
            <h1
              id="intro-heading"
              className="text-center text-2xl font-semibold leading-tight text-text sm:text-3xl lg:col-start-1 lg:row-start-1 lg:self-end lg:text-left lg:text-[2.25rem]"
            >
              Explore the companies, models, and tools behind American Super Intelligence.
            </h1>
            <div className="mx-auto w-full max-w-3xl lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:self-center">
              <HomeSearch indexUrl={asset("/data/search-index.json")} />
              {/* Two-up on phones too, so both fit on the first screen; "Explore" stays in the accessible name. */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link href="/companies/" className="btn btn-primary min-h-13 px-3 text-center text-[0.9375rem] leading-snug sm:px-[1.125rem] sm:text-base">
                  <Building2 aria-hidden="true" className="h-5 w-5 shrink-0" />
                  <span>
                    <span className="max-sm:sr-only">Explore </span>Companies &amp; Labs
                  </span>
                </Link>
                <Link href="/open/" className="btn btn-primary min-h-13 px-3 text-center text-[0.9375rem] leading-snug sm:px-[1.125rem] sm:text-base">
                  <Boxes aria-hidden="true" className="h-5 w-5 shrink-0" />
                  <span>
                    <span className="max-sm:sr-only">Explore </span>Open Models &amp; Tools
                  </span>
                </Link>
              </div>
            </div>
            <div className="text-center lg:col-start-1 lg:row-start-2 lg:self-start lg:text-left">
              <p className="mx-auto max-w-2xl text-base text-muted lg:mx-0">
                An independent directory of U.S. AI organizations and U.S.-led open models, software, and research. Explore what they build, what is
                available, and where to find the original sources.
              </p>
              <p className="mt-3 inline-flex items-center gap-2 rounded-xl border border-line px-4 py-1.5 text-[0.9375rem] text-text" data-testid="intro-disclaimer">
                <Landmark aria-hidden="true" className="h-4 w-4 shrink-0 text-muted" />
                {siteConfig.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="project-heading" className="container-page pb-7">
        <h2 id="project-heading" className="text-lg font-semibold text-text">About this project</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          USASI is an independent, unofficial catalog. Entries link claims to sources and record when the evidence was reviewed.
          Missing evidence stays Unknown; unverified candidates stay out of the published catalog.{" "}
          <Link href="/about/" className="link">About USASI</Link>{" · "}
          <Link href="/methodology/" className="link">Review process and methodology</Link>
        </p>
      </section>

      {/* Practical starting paths for newcomers (orientation before the directory previews). */}
      <section aria-labelledby="start-paths-heading" className="container-page pb-10">
        <h2 id="start-paths-heading" className="text-lg font-semibold text-text">
          Where to start
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/start/", title: "New here? Start here", text: "Four short paths: learn a term, find something usable, understand an organization, check a claim." },
            { href: "/learn/", title: "Learn the basics", text: "Ten short explainers and a glossary, from open weights to reading an evaluation." },
            { href: "/hubs/", title: "Explore by subject", text: "Local AI, agents, chips and compute, open-source foundations, and science." },
            { href: "/places/", title: "Browse by state", text: "Organizations by the state named in their documented headquarters." },
          ].map((item) => (
            <li key={item.href}>
              <Link prefetch={false} href={item.href} className="card flex h-full flex-col p-4 hover:border-cyan">
                <span className="font-semibold text-text">{item.title}</span>
                <span className="mt-1 text-sm text-muted">{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          Counts on this site are records in this catalog as of {formatDate(catalog.buildAt.slice(0, 10))}. Coverage is selective; counts are not a census, a
          ranking, or a measure of capability. <Link href="/methodology/#counts" className="link">How counts work</Link>
        </p>
      </section>

      {/* 3. Two equally weighted directory previews */}
      <section aria-labelledby="previews-heading" className="border-t border-line py-14">
        <div className="container-page">
          <h2 id="previews-heading" className="sr-only">
            Directory previews
          </h2>
          {featured ? (
            <p className="mb-6 max-w-3xl text-[0.9375rem] text-muted">
              <strong className="font-semibold text-text">Editor’s selection ({formatDate(featured.selected_at)}):</strong> {featured.explanation}
            </p>
          ) : (
            <p className="mb-6 text-[0.9375rem] text-muted">Showing the first entries of each directory in alphabetical order.</p>
          )}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card flex flex-col p-5 sm:p-6">
              <p className="eyebrow">Directory</p>
              <h3 className="mt-1 text-2xl font-semibold text-text">Companies &amp; Labs</h3>
              <p className="mt-2 text-muted">
                U.S. AI organizations, labs, research units, and foundations: what they build and how their products are delivered.
              </p>
              <p className="meta mt-3">{counts.organizations} organization records</p>
              <ul className="mt-5 divide-y divide-[rgba(120,180,255,0.12)] border-y border-line">
                {pickOrgs.map((o) => (
                  <li key={o.slug}>
                    <Link prefetch={false} href={orgHref(o.slug)} className="flex items-center gap-3 py-3 hover:text-text">
                      <Monogram text={o.logo_text} size="sm" />
                      <span className="min-w-0">
                        <span className="block font-medium text-text">{o.name}</span>
                        <span className="block truncate text-sm text-muted">
                          {o.organization_roles.slice(0, 2).map((r) => ROLE_LABELS[r]).join(" · ")}
                          {o.headquarters ? ` · ${o.headquarters.label}` : ""}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link prefetch={false} href="/companies/" className="link mt-auto inline-flex items-center gap-1 pt-5">
                All {counts.organizations} organization records <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>

            <div className="card flex flex-col p-5 sm:p-6">
              <p className="eyebrow">Directory</p>
              <h3 className="mt-1 text-2xl font-semibold text-text">Open Models &amp; Tools</h3>
              <p className="mt-2 text-muted">
                U.S.-led open models, software, datasets, and evaluation tools: what is public, under which license, and who maintains it.
              </p>
              <p className="meta mt-3">
                {counts.modelFamilies} model families · {counts.modelReleases} releases · {counts.software} software · {counts.datasets} datasets · {counts.evals} evaluation
                tools
              </p>
              <ul className="mt-5 divide-y divide-[rgba(120,180,255,0.12)] border-y border-line">
                {pickArtifacts.map((a) => (
                  <li key={a.slug}>
                    <Link prefetch={false} href={artifactHref(a.slug)} className="flex items-center justify-between gap-3 py-3">
                      <span className="min-w-0">
                        <span className="block font-medium text-text">{a.name}</span>
                        <span className="block truncate text-sm text-muted">{a.maintainers.map((m) => m.name).join(", ")}</span>
                      </span>
                      <EntryTypeBadge type={entryTypeFor(a.kind, a.record_level)} />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link prefetch={false} href="/open/" className="link mt-auto inline-flex items-center gap-1 pt-5">
                All {catalog.artifacts.length} open-artifact records <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HomepageSponsor />

      {/* Latest news and the weekly email: a reason to come back */}
      {catalog.news.length > 0 ? (
        <section aria-labelledby="latest-heading" className="border-t border-line py-14">
          <div className="container-page grid gap-8 lg:grid-cols-[1fr_22rem] lg:gap-12">
            <div>
              <p className="eyebrow">Latest news</p>
              <h2 id="latest-heading" className="mt-1 text-2xl font-semibold text-text">
                What changed in the catalog
              </h2>
              <ol className="mt-4 border-t border-line">
                {catalog.news.slice(0, 3).map((item) => (
                  <li key={item.slug}>
                    <NewsCard item={item} catalog={catalog} />
                  </li>
                ))}
              </ol>
              <Link prefetch={false} href="/news/" className="link mt-4 inline-flex items-center gap-1">
                All news <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
            <div className="lg:pt-10">
              <NewsletterSignup />
            </div>
          </div>
        </section>
      ) : null}

      {/* 4. Comparison preview */}
      <section aria-labelledby="coverage-heading" className="border-t border-line py-14">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow">Compare</p>
            <h2 id="coverage-heading" className="mt-1 text-2xl font-semibold text-text">
              Catalog coverage
            </h2>
            <p className="mt-3 text-muted">
              These are counts of published records in this catalog — not measures of capability, and not a census of American AI. Family overviews
              are counted separately from the releases they summarize, and research units are counted separately from their parents.
            </p>
            <Link prefetch={false} href="/matrix/" className="btn btn-secondary mt-5">
              Open the comparison workspace <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-8">
            <CoverageTable rows={coverage} caption="Catalog coverage: published records by type. Each number links to the records it counts." />
            {mostRecords.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-text">Who maintains the open artifacts in this catalog</h3>
                <p className="mt-1 text-[0.9375rem] text-muted">
                  Organizations with the most open-artifact records here. This counts catalog records, not importance, quality, or total output.
                </p>
                <ol className="mt-4 grid gap-x-6 sm:grid-cols-2">
                  {mostRecords.map((o) => (
                    <li key={o.slug} className="flex items-center justify-between gap-3 border-b border-line py-2.5">
                      <Link prefetch={false} href={orgHref(o.slug)} className="flex min-w-0 items-center gap-3 hover:text-text">
                        <Monogram text={o.logoText} size="sm" />
                        <span className="truncate font-medium text-text">{o.name}</span>
                      </Link>
                      <Link
                        prefetch={false}
                        href={`/open/?org=${o.slug}`}
                        className="link shrink-0 font-mono text-[0.875rem]"
                        aria-label={`${o.artifactCount} open-artifact records for ${o.name}`}
                      >
                        {o.artifactCount}
                      </Link>
                    </li>
                  ))}
                </ol>
                <Link prefetch={false} href="/companies/?open=1&sort=artifacts" className="link mt-3 inline-flex items-center gap-1 text-[0.9375rem]">
                  All organizations with open artifacts <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* 5. Recently reviewed */}
      <section aria-labelledby="reviewed-heading" className="border-t border-line py-14">
        <div className="container-page">
          <p className="eyebrow">Editorial log</p>
          <h2 id="reviewed-heading" className="mt-1 text-2xl font-semibold text-text">
            Recently reviewed
          </h2>
          <p className="mt-2 max-w-3xl text-muted">
            Entries whose evidence an editor checked most recently. A review date is not a release date.{" "}
            <Link prefetch={false} href="/changelog/" className="link">
              See the changelog
            </Link>
            .
          </p>
          <ul className="mt-6 grid gap-x-8 sm:grid-cols-2">
            {recentlyReviewed.map((r) => (
              <li key={`${r.kind}-${r.slug}`} className="border-b border-line">
                <Link prefetch={false} href={r.href} className="flex items-center justify-between gap-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-text">{r.name}</span>
                    <span className="block text-sm text-muted">{r.label}</span>
                  </span>
                  <span className="meta shrink-0">
                    <span className="sr-only">Reviewed </span>
                    <time dateTime={r.date}>{formatDate(r.date)}</time>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. Methodology and independence */}
      <section aria-labelledby="method-heading" className="border-t border-line py-14">
        <div className="container-page">
          <p className="eyebrow">How this catalog works</p>
          <h2 id="method-heading" className="mt-1 text-2xl font-semibold text-text">
            Evidence first, independent by design
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="card p-5">
              <BookOpenCheck aria-hidden="true" className="h-5 w-5 text-cyan" />
              <h3 className="mt-3 font-semibold text-text">Sourced claims</h3>
              <p className="mt-2 text-[0.9375rem] text-muted">
                Each statement links to the official page, model card, repository, or license that supports it, with the date it was checked.
                Unknown stays unknown.
              </p>
            </div>
            <div className="card p-5">
              <Landmark aria-hidden="true" className="h-5 w-5 text-cyan" />
              <h3 className="mt-3 font-semibold text-text">Published eligibility rule</h3>
              <p className="mt-2 text-[0.9375rem] text-muted">
                Entries qualify through documented U.S. headquarters, a U.S. nonprofit or lab, documented U.S. control, or U.S.-based project
                governance — applied the same way to everyone.
              </p>
            </div>
            <div className="card p-5">
              <Scale aria-hidden="true" className="h-5 w-5 text-cyan" />
              <h3 className="mt-3 font-semibold text-text">Openness by artifact, not by reputation</h3>
              <p className="mt-2 text-[0.9375rem] text-muted">
                Models, software, datasets, and evaluation tools each get their own checklist. Model tiers follow {RUBRIC_LABEL}, an editorial rubric,
                not a certification.
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-[0.9375rem] text-muted">
            {siteConfig.disclaimer} USASI is not affiliated with any listed organization, and a listing is not an endorsement, a safety
            assessment, or a ranking.{" "}
            <Link prefetch={false} href="/methodology/" className="link">
              Read the methodology
            </Link>{" "}
            or the{" "}
            <Link prefetch={false} href="/disclaimer/" className="link">
              disclaimer
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="container-page py-8" aria-labelledby="home-jobs-heading"><div className="card p-6"><h2 id="home-jobs-heading" className="text-xl font-semibold text-text">Work at companies and labs in the catalog</h2><p className="mt-2 text-muted">Explore current openings from employer career sources. Applications go directly to the employer.</p><Link href="/jobs/" className="link mt-4 inline-block">Explore Jobs →</Link></div></section>

      {/* People Behind Local AI (standing list, deliberately quiet) */}
      <LocalCornerStrip people={catalog.people} />

      {/* 7. Support Us */}
      <SupportPanel variant="home" />
    </>
  );
}
