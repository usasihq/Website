import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { ArrowRight, Star } from "lucide-react";
import { GithubRow } from "@/components/GithubList";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/PageHeader";
import { RankBadgeBox } from "@/components/RankBadgeBox";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { OWNER_TYPE_LABELS } from "@/lib/github/directory";
import { catalogMatch, githubEntries, githubEntry, githubFetchedLabel, githubIndexed, githubPageHref, GITHUB_PAGE_SIZE, githubProjectLd, licenseLabel, projectHero, relatedProjects, toListItem } from "@/lib/github/projects";
import { licenseKey } from "@/lib/github/directory";
import { hfForGithub } from "@/lib/huggingface/items";
import { clipDescription, pageMetadata } from "@/lib/metadata";
import { asset } from "@/lib/paths";

export const dynamicParams = false;

export function generateStaticParams() {
  return githubEntries().map((e) => ({ slug: e.slug }));
}

const nf = (v: number) => v.toLocaleString("en-US");

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = githubEntry(slug);
  if (!e) return {};
  const hero = projectHero(e);
  const lead = e.description ? clipDescription(e.description, 110) : `${e.name} by ${e.owner}`;
  return pageMetadata({
    title: `${e.full_name} on GitHub`,
    description: `${lead} Ranked #${e.rank} in AI on GitHub with ${nf(e.stars)} stars${e.language ? `; ${e.language}` : ""}.`,
    path: e.href,
    image: { path: hero.image, alt: hero.alt },
    ...(githubIndexed(e, getCatalog()) ? {} : { noindex: true }),
  });
}

export default async function GithubProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = githubEntry(slug);
  if (!e) notFound();
  const catalog = getCatalog();
  const hero = projectHero(e);
  const inCatalog = catalogMatch(catalog, e);
  const onHf = hfForGithub(e.full_name);
  const related = relatedProjects(e);
  const page = Math.ceil(e.rank / GITHUB_PAGE_SIZE);
  const license = licenseKey(e);
  const facts: [string, React.ReactNode][] = [
    ["Stars", nf(e.stars)],
    ["Forks", nf(e.forks)],
    ["Open issues and pull requests", nf(e.open_issues)],
    ["Primary language", e.language ?? "Not detected"],
    ["License", license === "Other" || license === "None" ? licenseLabel(license) : `${e.license_name ?? license} (${license})`],
    ["Owner", `${e.owner} · ${OWNER_TYPE_LABELS[e.owner_type]}`],
    ["Created", formatDate(e.created_at.slice(0, 10))],
    ["Last push", formatDate(e.pushed_at.slice(0, 10))],
  ];

  return (
    <>
      <JsonLd data={githubProjectLd(e)} />
      <article>
        <header className="border-b border-line bg-[linear-gradient(180deg,var(--hero-tint),transparent)]">
          <div className="container-page pb-10 pt-8 sm:pt-10">
            <Breadcrumbs items={[{ href: "/github/", label: "AI on GitHub" }]} current={{ href: e.href, label: e.full_name }} />
            <figure className="overflow-hidden rounded-2xl border border-line shadow-hero">
              <img src={asset(hero.image)} alt={hero.alt} width={1200} height={630} fetchPriority="high" decoding="async" className="block aspect-[1200/630] h-auto w-full bg-fog" />
            </figure>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="badge">Rank #{nf(e.rank)}</span>
              <span className="badge">
                <Star aria-hidden="true" className="h-3.5 w-3.5 text-tone-amber" /> {nf(e.stars)} stars
              </span>
              {e.language ? <span className="badge">{e.language}</span> : null}
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-text [overflow-wrap:anywhere] sm:text-4xl">{e.name}</h1>
            <p className="mt-1 text-lg text-muted">
              by {e.owner} <span className="text-base">({OWNER_TYPE_LABELS[e.owner_type].toLowerCase()})</span>
            </p>
            {e.description ? (
              <p className="mt-4 max-w-3xl text-lg text-body [overflow-wrap:anywhere]">
                {e.description}
                <span className="sr-only"> (description from the project&rsquo;s GitHub page)</span>
              </p>
            ) : (
              <p className="mt-4 text-muted">The repository has no description on GitHub.</p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={e.html_url} className="btn btn-primary" rel="noopener noreferrer" data-external="true">
                View on GitHub<span className="sr-only"> (external site: github.com)</span>
              </a>
              {e.homepage ? (
                <a href={e.homepage} className="btn btn-secondary" rel="noopener noreferrer nofollow" data-external="true">
                  Homepage<span className="sr-only"> (external site: {new URL(e.homepage).hostname.replace(/^www\./, "")})</span>
                </a>
              ) : null}
            </div>
            {inCatalog ? (
              <p className="mt-5">
                <Link href={inCatalog.href} className="link inline-flex items-center gap-1 font-medium">
                  In the USASI catalog: {inCatalog.name} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </p>
            ) : null}
            {onHf ? (
              <p className={inCatalog ? "mt-2" : "mt-5"}>
                <Link href={onHf.href} className="link inline-flex items-center gap-1 font-medium">
                  On AI on Hugging Face: {onHf.id} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </p>
            ) : null}
          </div>
        </header>

        <div className="container-page grid gap-12 py-12">
          <section aria-labelledby="facts-heading">
            <h2 id="facts-heading" className="text-xl font-semibold text-text">
              Repository facts
            </h2>
            <dl className="mt-4 grid gap-px overflow-hidden rounded-xl border border-line bg-line grid-cols-2 lg:grid-cols-4">
              {facts.map(([k, v]) => (
                <div key={k} className="bg-card p-4">
                  <dt className="text-sm text-muted">{k}</dt>
                  <dd className="mt-1 font-medium text-text [overflow-wrap:anywhere]">{v}</dd>
                </div>
              ))}
            </dl>
            {e.topics.length ? (
              <>
                <h3 className="mt-6 text-sm font-medium text-text">Topics</h3>
                <ul className="mt-2 flex flex-wrap gap-2" aria-label="Topics">
                  {e.topics.map((t) => (
                    <li key={t}>
                      <Link prefetch={false} href={`/github/?topic=${encodeURIComponent(t)}`} className="badge hover:border-line-strong hover:text-text">
                        {t}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            <p className="meta mt-6">
              Rank #{nf(e.rank)} of {nf(githubEntries().length)} in{" "}
              <Link href={githubPageHref(page)} className="link">
                AI on GitHub
              </Link>
              , by stars. Data from the GitHub API, fetched {githubFetchedLabel()}; star counts change daily. Stars measure popularity, not
              quality or safety, and a listing is not an endorsement.{" "}
              <Link href="/methodology/#github" className="link">
                How this list is made
              </Link>
            </p>
          </section>

          <RankBadgeBox kind="github" slug={e.slug} rank={e.rank} pagePath={e.href} />

          {related.length ? (
            <section aria-labelledby="related-heading">
              <h2 id="related-heading" className="text-xl font-semibold text-text">
                Related projects
              </h2>
              <p className="mt-1 text-sm text-muted">Projects that share this one&rsquo;s GitHub topics.</p>
              <ul className="mt-4 grid gap-3 lg:grid-cols-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <GithubRow item={toListItem(r)} level={3} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </article>
      <SupportPanel variant="compact" />
    </>
  );
}
