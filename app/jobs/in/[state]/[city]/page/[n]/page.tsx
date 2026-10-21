import { notFound } from "next/navigation";
import { JobsLanding } from "@/components/JobsLanding";
import { getCatalog } from "@/lib/catalog";
import { jobLandingImage } from "@/lib/jobs/landing-links";
import { atLeastOneParam, jobsLandingData } from "@/lib/jobs/landing";
import { landingExtras } from "@/lib/jobs/landing-ui";
import { paginatedLanding } from "@/lib/jobs/pagination";
import { pageMetadata } from "@/lib/metadata";
import { stateSlug } from "@/lib/places";

export const dynamicParams = false;

export function generateStaticParams() {
  return atLeastOneParam(
    jobsLandingData(getCatalog()).cities.flatMap((p) =>
      Array.from({ length: Math.max(0, p.pageCount - 1) }, (_, i) => ({
        state: stateSlug(p.state!),
        city: p.city!.slug,
        n: String(i + 2),
      })),
    ),
    { state: "_", city: "_", n: "2" },
  );
}

type Params = { params: Promise<{ state: string; city: string; n: string }> };

function resolve(state: string, city: string, n: string) {
  const base = jobsLandingData(getCatalog()).cities.find((p) => p.path === `/jobs/in/${state}/${city}/`);
  if (!base) return null;
  const pageNumber = Number(n);
  if (!Number.isInteger(pageNumber) || pageNumber < 2 || pageNumber > base.pageCount) return null;
  return paginatedLanding(base, pageNumber);
}

export async function generateMetadata({ params }: Params) {
  const { state, city, n } = await params;
  const page = resolve(state, city, n);
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.description, path: page.path, noindex: !page.indexable, image: jobLandingImage(page) });
}

export default async function JobsCityPagedPage({ params }: Params) {
  const { state, city, n } = await params;
  const page = resolve(state, city, n);
  if (!page) notFound();
  return <JobsLanding page={page} {...landingExtras(getCatalog(), page)} />;
}
