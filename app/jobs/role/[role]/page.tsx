import { notFound } from "next/navigation";
import { JobsLanding } from "@/components/JobsLanding";
import { getCatalog } from "@/lib/catalog";
import { jobLandingImage, topicAndStateLinks } from "@/lib/jobs/landing-links";
import { jobsLandingData } from "@/lib/jobs/landing";
import { ROLE_SLUGS } from "@/lib/jobs/roles";
import { pageMetadata } from "@/lib/metadata";
import { jobFeedPath } from "@/lib/jobs/feeds";
import { payRole } from "@/lib/jobs/pay";

export const dynamicParams = false;

export function generateStaticParams() {
  return ROLE_SLUGS.map((role) => ({ role }));
}

const rolePage = (role: string) => jobsLandingData(getCatalog()).roles.find((p) => p.id === role);

export async function generateMetadata({ params }: { params: Promise<{ role: string }> }) {
  const page = rolePage((await params).role);
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.description, path: page.path, noindex: !page.indexable, image: jobLandingImage(page), feeds: [{ path: jobFeedPath(page.path), title: `USASI — ${page.h1}` }] });
}

export default async function JobsRolePage({ params }: { params: Promise<{ role: string }> }) {
  const page = rolePage((await params).role);
  if (!page) notFound();
  return <JobsLanding page={page} others={topicAndStateLinks(getCatalog(), page.path)} pay={payRole(getCatalog(), page.id) ?? null} />;
}
