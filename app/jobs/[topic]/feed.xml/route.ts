import { getCatalog } from "@/lib/catalog";
import { landingFeedXml } from "@/lib/jobs/feeds";
import { jobsLandingData, TOPIC_IDS } from "@/lib/jobs/landing";
import { rssResponse } from "@/lib/rss";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return TOPIC_IDS.map((topic) => ({ topic }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const catalog = getCatalog();
  return rssResponse(landingFeedXml(catalog, jobsLandingData(catalog).topics.find((p) => p.id === topic)!));
}
