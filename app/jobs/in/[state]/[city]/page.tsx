import { notFound } from "next/navigation";
import { JobsLanding } from "@/components/JobsLanding";
import { getCatalog } from "@/lib/catalog";
import { jobLandingImage } from "@/lib/jobs/landing-links";
import { atLeastOneParam, jobsLandingData } from "@/lib/jobs/landing";
import { landingExtras } from "@/lib/jobs/landing-ui";
import { pageMetadata } from "@/lib/metadata";
import { stateSlug } from "@/lib/places";

export const dynamicParams = false;

export function generateStaticParams({ params }: { params?: { state?: string } } = {}) {
  return atLeastOneParam(
    jobsLandingData(getCatalog())
      .cities.filter((p) => !params?.state || stateSlug(p.state!) === params.state)
      .map((p) => ({ state: stateSlug(p.state!), city: p.city!.slug })),
    { state: params?.state ?? "_", city: "_" },
  );
}

type Params = { params: Promise<{ state: string; city: string }> };

const cityPage = async ({ params }: Params) => {
  const { state, city } = await params;
  return jobsLandingData(getCatalog()).cities.find((p) => p.path === `/jobs/in/${state}/${city}/`);
};

export async function generateMetadata(props: Params) {
  const page = await cityPage(props);
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.description, path: page.path, noindex: !page.indexable, image: jobLandingImage(page) });
}

export default async function JobsCityPage(props: Params) {
  const page = await cityPage(props);
  if (!page) notFound();
  return <JobsLanding page={page} {...landingExtras(getCatalog(), page)} />;
}
