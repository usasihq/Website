import { notFound } from "next/navigation";
import { JobsLanding } from "@/components/JobsLanding";
import { getCatalog } from "@/lib/catalog";
import { jobLandingImage, topicAndStateLinks } from "@/lib/jobs/landing-links";
import { jobsLandingData, TOPIC_IDS } from "@/lib/jobs/landing";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOPIC_IDS.map((topic) => ({ topic }));
}

const topicPage = (topic: string) => jobsLandingData(getCatalog()).topics.find((p) => p.id === topic);

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }) {
  const page = topicPage((await params).topic);
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.description, path: page.path, noindex: !page.indexable, image: jobLandingImage(page) });
}

export default async function JobsTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const page = topicPage((await params).topic);
  if (!page) notFound();
  return <JobsLanding page={page} others={topicAndStateLinks(getCatalog(), page.path)} />;
}
