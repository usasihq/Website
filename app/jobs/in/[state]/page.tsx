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
  const data = jobsLandingData(getCatalog());
  return atLeastOneParam(
    [
      ...data.states.map((p) => ({ state: stateSlug(p.state!) })),
      ...data.metros.map((p) => ({ state: p.metro!.slug })),
    ],
    { state: "_" },
  );
}

const inPage = (slug: string) => {
  const data = jobsLandingData(getCatalog());
  return data.metros.find((p) => p.path === `/jobs/in/${slug}/`) ?? data.states.find((p) => p.path === `/jobs/in/${slug}/`);
};

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
  const page = inPage((await params).state);
  if (!page) return {};
  const feeds = page.kind === "state" ? [{ path: jobFeedPath(page.path), title: `USASI — ${page.h1}` }] : undefined;
  return pageMetadata({ title: page.title, description: page.description, path: page.path, noindex: !page.indexable, image: jobLandingImage(page), feeds });
}

export default async function JobsInPage({ params }: { params: Promise<{ state: string }> }) {
  const page = inPage((await params).state);
  if (!page) notFound();
  return <JobsLanding page={page} {...landingExtras(getCatalog(), page)} />;
}
