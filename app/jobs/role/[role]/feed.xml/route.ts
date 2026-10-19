import { getCatalog } from "@/lib/catalog";
import { landingFeedXml } from "@/lib/jobs/feeds";
import { jobsLandingData } from "@/lib/jobs/landing";
import { ROLE_SLUGS } from "@/lib/jobs/roles";
import { rssResponse } from "@/lib/rss";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return ROLE_SLUGS.map((role) => ({ role }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const catalog = getCatalog();
  return rssResponse(landingFeedXml(catalog, jobsLandingData(catalog).roles.find((p) => p.id === role)!));
}
