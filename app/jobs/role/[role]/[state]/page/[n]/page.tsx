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
    jobsLandingData(getCatalog()).roleStates.flatMap((p) =>
      Array.from({ length: Math.max(0, p.pageCount - 1) }, (_, i) => ({
        role: String(p.filters.role),
        state: stateSlug(p.state!),
        n: String(i + 2),
      })),
    ),
    { role: "_", state: "_", n: "2" },
  );
}

type Params = { params: Promise<{ role: string; state: string; n: string }> };

function resolve(role: string, state: string, n: string) {
  const base = jobsLandingData(getCatalog()).roleStates.find((p) => p.path === `/jobs/role/${role}/${state}/`);
  if (!base) return null;
  const pageNumber = Number(n);
  if (!Number.isInteger(pageNumber) || pageNumber < 2 || pageNumber > base.pageCount) return null;
  return paginatedLanding(base, pageNumber);
}

export async function generateMetadata({ params }: Params) {
  const { role, state, n } = await params;
  const page = resolve(role, state, n);
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.description, path: page.path, noindex: !page.indexable, image: jobLandingImage(page) });
}

export default async function JobsRoleStatePagedPage({ params }: Params) {
  const { role, state, n } = await params;
  const page = resolve(role, state, n);
  if (!page) notFound();
  return <JobsLanding page={page} {...landingExtras(getCatalog(), page)} />;
}
