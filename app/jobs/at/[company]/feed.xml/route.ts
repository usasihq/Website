import { getCatalog } from "@/lib/catalog";
import { landingFeedXml } from "@/lib/jobs/feeds";
import { jobsLandingData } from "@/lib/jobs/landing";
import { rssResponse } from "@/lib/rss";

export const dynamic = "force-static";
export const dynamicParams = false;

/** One feed per employer page (the same set as /jobs/at/<employer>/). */
export function generateStaticParams() {
  return jobsLandingData(getCatalog()).companies.map((p) => ({ company: p.organization!.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ company: string }> }) {
  const { company } = await params;
  const catalog = getCatalog();
  const page = jobsLandingData(catalog).companies.find((p) => p.path === `/jobs/at/${company}/`)!;
  return rssResponse(landingFeedXml(catalog, page));
}
