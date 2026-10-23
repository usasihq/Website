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
  const data = jobsLandingData(getCatalog());
  const pages = [...data.states, ...data.metros];
  return atLeastOneParam(
    pages.flatMap((p) =>
      Array.from({ length: Math.max(0, p.pageCount - 1) }, (_, i) => ({
        state: p.kind === "metro" ? p.metro!.slug : stateSlug(p.state!),
        n: String(i + 2),
      })),
    ),
    { state: "_", n: "2" },
  );
}

type Params = { params: Promise<{ state: string; n: string }> };

function resolve(state: string, n: string) {
  const data = jobsLandingData(getCatalog());
  const base = data.metros.find((p) => p.path === `/jobs/in/${state}/`) ?? data.states.find((p) => p.path === `/jobs/in/${state}/`);
  if (!base) return null;
  const pageNumber = Number(n);
  if (!Number.isInteger(pageNumber) || pageNumber < 2 || pageNumber > base.pageCount) return null;
  return paginatedLanding(base, pageNumber);
}

export async function generateMetadata({ params }: Params) {
  const { state, n } = await params;
  const page = resolve(state, n);
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.description, path: page.path, noindex: !page.indexable, image: jobLandingImage(page) });
}

export default async function JobsStatePagedPage({ params }: Params) {
  const { state, n } = await params;
  const page = resolve(state, n);
  if (!page) notFound();
  return <JobsLanding page={page} {...landingExtras(getCatalog(), page)} />;
}
