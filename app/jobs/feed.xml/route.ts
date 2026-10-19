import { getCatalog } from "@/lib/catalog";
import { allJobsFeedXml } from "@/lib/jobs/feeds";
import { rssResponse } from "@/lib/rss";

export const dynamic = "force-static";

/** The newest current U.S. job listings (the directory's default view). */
export function GET() {
  return rssResponse(allJobsFeedXml(getCatalog()));
}
