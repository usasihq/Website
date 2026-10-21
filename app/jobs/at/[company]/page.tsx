import { notFound } from "next/navigation";
import { JobsLanding } from "@/components/JobsLanding";
import { getCatalog } from "@/lib/catalog";
import { jobLandingImage } from "@/lib/jobs/landing-links";
import { jobsLandingData } from "@/lib/jobs/landing";
import { landingExtras } from "@/lib/jobs/landing-ui";
import { pageMetadata } from "@/lib/metadata";
import { jobFeedPath } from "@/lib/jobs/feeds";

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
    ...(page.indexable ? {} : { noindex: true }),
  });
}

export default async function JobsCompanyPage({ params }: { params: Promise<{ company: string }> }) {
  const page = companyPage((await params).company);
  if (!page) notFound();
  return <JobsLanding page={page} {...landingExtras(getCatalog(), page)} />;
}
