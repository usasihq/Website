import { notFound } from "next/navigation";
import { JobsLanding } from "@/components/JobsLanding";
import { getCatalog } from "@/lib/catalog";
import { jobLandingImage } from "@/lib/jobs/landing-links";
import { atLeastOneParam, jobsLandingData } from "@/lib/jobs/landing";
import { landingExtras } from "@/lib/jobs/landing-ui";
import { paginatedLanding } from "@/lib/jobs/pagination";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return atLeastOneParam(
    jobsLandingData(getCatalog()).companies.flatMap((p) =>
      Array.from({ length: Math.max(0, p.pageCount - 1) }, (_, i) => ({ company: p.organization!.slug, n: String(i + 2) })),
    ),
    { company: "_", n: "2" },
  );
}

type Params = { params: Promise<{ company: string; n: string }> };

function resolve(company: string, n: string) {
  const base = jobsLandingData(getCatalog()).companies.find((p) => p.organization?.slug === company);
  if (!base) return null;
  const pageNumber = Number(n);
  if (!Number.isInteger(pageNumber) || pageNumber < 2 || pageNumber > base.pageCount) return null;
  return paginatedLanding(base, pageNumber);
}

export async function generateMetadata({ params }: Params) {
  const { company, n } = await params;
  const page = resolve(company, n);
  if (!page) return {};
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
    image: jobLandingImage(page),
    ...(page.indexable ? {} : { noindex: true }),
  });
}

export default async function JobsCompanyPagedPage({ params }: Params) {
  const { company, n } = await params;
  const page = resolve(company, n);
  if (!page) notFound();
  return <JobsLanding page={page} {...landingExtras(getCatalog(), page)} />;
}
