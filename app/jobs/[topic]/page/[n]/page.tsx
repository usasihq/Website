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
    jobsLandingData(getCatalog()).topics.flatMap((p) =>
      Array.from({ length: Math.max(0, p.pageCount - 1) }, (_, i) => ({ topic: p.id, n: String(i + 2) })),
    ),
    { topic: "_", n: "2" },
  );
}

type Params = { params: Promise<{ topic: string; n: string }> };

function resolve(topic: string, n: string) {
  const base = jobsLandingData(getCatalog()).topics.find((p) => p.id === topic);
  if (!base) return null;
  const pageNumber = Number(n);
  if (!Number.isInteger(pageNumber) || pageNumber < 2 || pageNumber > base.pageCount) return null;
  return paginatedLanding(base, pageNumber);
}

export async function generateMetadata({ params }: Params) {
  const { topic, n } = await params;
  const page = resolve(topic, n);
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.description, path: page.path, noindex: !page.indexable, image: jobLandingImage(page) });
}

export default async function JobsTopicPagedPage({ params }: Params) {
  const { topic, n } = await params;
  const page = resolve(topic, n);
  if (!page) notFound();
  return <JobsLanding page={page} {...landingExtras(getCatalog(), page)} />;
}
