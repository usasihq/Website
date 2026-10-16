import { notFound } from "next/navigation";
import { JobsLanding } from "@/components/JobsLanding";
import { getCatalog } from "@/lib/catalog";
import { cityLinks, jobLandingImage, topicAndStateLinks } from "@/lib/jobs/landing-links";
import { atLeastOneParam, jobsLandingData } from "@/lib/jobs/landing";
import { pageMetadata } from "@/lib/metadata";
import { organizationsByState } from "@/lib/place-index";
import { stateSlug } from "@/lib/places";

export const dynamicParams = false;

/** Only states with enough current listings get a page (see MIN_STATE_LISTINGS); the set is recomputed on every build. */
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
  return pageMetadata({ title: page.title, description: page.description, path: page.path, image: jobLandingImage(page) });
}

export default async function JobsStatePage({ params }: { params: Promise<{ state: string }> }) {
  const page = statePage((await params).state);
  if (!page) notFound();
  const catalog = getCatalog();
  const hq = organizationsByState(catalog).states.find((s) => s.code === page.state);
  return (
    <JobsLanding
      page={page}
      others={topicAndStateLinks(catalog, page.path)}
      cities={cityLinks(catalog, page.state!)}
      headquartersHref={hq ? `/places/${stateSlug(hq.code)}/` : null}
      headquartersCount={hq?.organizations.length ?? 0}
    />
  );
}
