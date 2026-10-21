import { notFound } from "next/navigation";
import { JobsLanding } from "@/components/JobsLanding";
import { getCatalog } from "@/lib/catalog";
import { jobLandingImage } from "@/lib/jobs/landing-links";
import { atLeastOneParam, jobsLandingData } from "@/lib/jobs/landing";
import { landingExtras } from "@/lib/jobs/landing-ui";
import { pageMetadata } from "@/lib/metadata";
import { jobFeedPath } from "@/lib/jobs/feeds";
import { stateSlug } from "@/lib/places";

export const dynamicParams = false;

export function generateStaticParams() {
  return atLeastOneParam(
    jobsLandingData(getCatalog()).states.map((p) => ({ state: stateSlug(p.state!) })),
    { state: "_" },
  );
}

const statePage = (slug: string) => jobsLandingData(getCatalog()).states.find((p) => p.path === `/jobs/in/${slug}/`);

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
  const page = statePage((await params).state);
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.description, path: page.path, noindex: !page.indexable, image: jobLandingImage(page), feeds: [{ path: jobFeedPath(page.path), title: `USASI — ${page.h1}` }] });
}

export default async function JobsStatePage({ params }: { params: Promise<{ state: string }> }) {
  const page = statePage((await params).state);
  if (!page) notFound();
  return <JobsLanding page={page} {...landingExtras(getCatalog(), page)} />;
}
