import { notFound } from "next/navigation";
import { JobsLayoffsState } from "@/components/JobsLayoffs";
import { getCatalog } from "@/lib/catalog";
import { LAYOFF_STATES, layoffStatePage } from "@/lib/jobs/layoffs";
import { atLeastOneParam } from "@/lib/jobs/landing";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  const catalog = getCatalog();
  return atLeastOneParam(
    LAYOFF_STATES.filter((s) => layoffStatePage(catalog, s.slug)).map((s) => ({ state: s.slug })),
    { state: "_" },
  );
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
  const page = layoffStatePage(getCatalog(), (await params).state);
  if (!page) return {};
  const n = page.file.notices.length.toLocaleString("en-US");
  return pageMetadata({
    title: `WARN Act layoffs in ${page.meta.name} and nearby AI jobs`,
    description: `${n} recent WARN Act notices in ${page.meta.name} from the ${page.file.source_name}, with links to open AI jobs in the state and its cities.`,
    path: `/jobs/layoffs/${page.meta.slug}/`,
  });
}

export default async function JobsLayoffsStatePage({ params }: { params: Promise<{ state: string }> }) {
  const page = layoffStatePage(getCatalog(), (await params).state);
  if (!page) notFound();
  return <JobsLayoffsState page={page} />;
}
