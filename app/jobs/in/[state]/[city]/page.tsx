import { notFound } from "next/navigation";
import { JobsLanding } from "@/components/JobsLanding";
import { getCatalog } from "@/lib/catalog";
import { cityLinks, jobLandingImage, topicAndStateLinks } from "@/lib/jobs/landing-links";
import { jobsLandingData, stateDisplayName } from "@/lib/jobs/landing";
import { pageMetadata } from "@/lib/metadata";
import { organizationsByState } from "@/lib/place-index";
import { stateSlug } from "@/lib/places";

export const dynamicParams = false;

/** Only cities with enough current listings get a page (see MIN_CITY_LISTINGS); the set is recomputed on every build. */
export function generateStaticParams({ params }: { params?: { state?: string } } = {}) {
  return jobsLandingData(getCatalog())
    .cities.filter((p) => !params?.state || stateSlug(p.state!) === params.state)
    .map((p) => ({ state: stateSlug(p.state!), city: p.city!.slug }));
}

type Params = { params: Promise<{ state: string; city: string }> };

const cityPage = async ({ params }: Params) => {
  const { state, city } = await params;
  return jobsLandingData(getCatalog()).cities.find((p) => p.path === `/jobs/in/${state}/${city}/`);
};

export async function generateMetadata(props: Params) {
  const page = await cityPage(props);
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.description, path: page.path, image: jobLandingImage(page) });
}

export default async function JobsCityPage(props: Params) {
  const page = await cityPage(props);
  if (!page) notFound();
  const catalog = getCatalog();
  const code = page.state!;
  const hq = organizationsByState(catalog).states.find((s) => s.code === code);
  return (
    <JobsLanding
      page={page}
      others={topicAndStateLinks(catalog, page.path)}
      cities={cityLinks(catalog, code).filter((l) => l.path !== page.path)}
      parent={{ href: `/jobs/in/${stateSlug(code)}/`, label: `Jobs in ${stateDisplayName(code)}` }}
      headquartersHref={hq ? `/places/${stateSlug(hq.code)}/` : null}
      headquartersCount={hq?.organizations.length ?? 0}
    />
  );
}
