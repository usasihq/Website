import { notFound } from "next/navigation";
import { JobsLanding } from "@/components/JobsLanding";
import { getCatalog } from "@/lib/catalog";
import { companyLinks, jobLandingImage, roleLinksForEmployer, topicAndStateLinks } from "@/lib/jobs/landing-links";
import { jobsLandingData } from "@/lib/jobs/landing";
import { pageMetadata } from "@/lib/metadata";
import { jobFeedPath } from "@/lib/jobs/feeds";
import { payEmployer } from "@/lib/jobs/pay";

export const dynamicParams = false;

/** Every published employer with an automated job board; the set is recomputed on every build. */
export function generateStaticParams() {
  return jobsLandingData(getCatalog()).companies.map((p) => ({ company: p.organization!.slug }));
}

const companyPage = (slug: string) => jobsLandingData(getCatalog()).companies.find((p) => p.path === `/jobs/at/${slug}/`);

export async function generateMetadata({ params }: { params: Promise<{ company: string }> }) {
  const page = companyPage((await params).company);
  if (!page) return {};
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
    image: jobLandingImage(page),
    feeds: [{ path: jobFeedPath(page.path), title: `USASI — ${page.h1}` }],
    // An employer with fewer than MIN_INDEX_LISTINGS current listings keeps its page (links still work) but stays out of search results.
    ...(page.indexable ? {} : { noindex: true }),
  });
}

/** How many other employers the page links to. */
const OTHER_EMPLOYERS = 24;

export default async function JobsCompanyPage({ params }: { params: Promise<{ company: string }> }) {
  const page = companyPage((await params).company);
  if (!page) notFound();
  const catalog = getCatalog();
  return (
    <JobsLanding
      page={page}
      others={topicAndStateLinks(catalog, page.path)}
      companies={companyLinks(catalog, page.path).slice(0, OTHER_EMPLOYERS)}
      roles={roleLinksForEmployer(catalog, page.organization!.slug)}
      pay={payEmployer(catalog, page.organization!.slug) ?? null}
    />
  );
}
