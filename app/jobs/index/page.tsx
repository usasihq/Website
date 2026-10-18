import { JobsHiringIndex } from "@/components/JobsHiringIndex";
import { getCatalog } from "@/lib/catalog";
import { HIRING_INDEX_HREF, hiringIndexPage } from "@/lib/jobs/hiring-index";
import { cardImage } from "@/lib/page-cards";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata() {
  const catalog = getCatalog();
  const page = hiringIndexPage(catalog);
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: HIRING_INDEX_HREF,
    image: cardImage(catalog, HIRING_INDEX_HREF),
  });
}

export default function JobsHiringIndexPage() {
  return <JobsHiringIndex page={hiringIndexPage(getCatalog())} />;
}
