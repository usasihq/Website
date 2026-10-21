import { notFound } from "next/navigation";
import { JobsLanding } from "@/components/JobsLanding";
import { getCatalog } from "@/lib/catalog";
import { jobLandingImage } from "@/lib/jobs/landing-links";
import { atLeastOneParam, jobsLandingData } from "@/lib/jobs/landing";
import { landingExtras } from "@/lib/jobs/landing-ui";
import { pageMetadata } from "@/lib/metadata";
import { stateSlug } from "@/lib/places";

export const dynamicParams = false;

export function generateStaticParams() {
  return atLeastOneParam(
    jobsLandingData(getCatalog()).roleStates.map((p) => ({ role: String(p.filters.role), state: stateSlug(p.state!) })),
    { role: "_", state: "_" },
  );
}

type Params = { params: Promise<{ role: string; state: string }> };

const roleStatePage = (role: string, state: string) =>
  jobsLandingData(getCatalog()).roleStates.find((p) => p.path === `/jobs/role/${role}/${state}/`);

export async function generateMetadata({ params }: Params) {
  const { role, state } = await params;
  const page = roleStatePage(role, state);
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.description, path: page.path, noindex: !page.indexable, image: jobLandingImage(page) });
}

export default async function JobsRoleStatePage({ params }: Params) {
  const { role, state } = await params;
  const page = roleStatePage(role, state);
  if (!page) notFound();
  return <JobsLanding page={page} {...landingExtras(getCatalog(), page)} />;
}
