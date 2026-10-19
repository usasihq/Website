import { getCatalog } from "@/lib/catalog";
import { landingFeedXml } from "@/lib/jobs/feeds";
import { atLeastOneParam, jobsLandingData } from "@/lib/jobs/landing";
import { stateSlug } from "@/lib/places";
import { rssResponse } from "@/lib/rss";

export const dynamic = "force-static";
export const dynamicParams = false;

/** One feed per state page; the set is recomputed on every build. */
export function generateStaticParams() {
  return atLeastOneParam(
    jobsLandingData(getCatalog()).states.map((p) => ({ state: stateSlug(p.state!) })),
    { state: "_" },
  );
}

export async function GET(_req: Request, { params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const catalog = getCatalog();
  const page = jobsLandingData(catalog).states.find((p) => p.path === `/jobs/in/${state}/`);
  // The placeholder param (a build with no state page) has nothing to follow.
  return page ? rssResponse(landingFeedXml(catalog, page)) : new Response("", { status: 404 });
}
