import { notFound } from "next/navigation";
import { JobsDirectoryList } from "@/components/JobsDirectoryPages";
import { getCatalog } from "@/lib/catalog";
import { atLeastOneParam } from "@/lib/jobs/landing";
import { jobsDirectoryPage, jobsDirectoryPages } from "@/lib/jobs/directory-pages";
import { pageMetadata, socialImages } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  const { pageCount } = jobsDirectoryPages(getCatalog());
  return atLeastOneParam(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) => ({ n: String(i + 2) })),
    { n: "2" },
  );
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  const { pageCount, total } = jobsDirectoryPages(getCatalog());
  if (!Number.isInteger(n) || n < 2 || n > pageCount) return {};
  return pageMetadata({
    title: `Jobs at U.S. AI companies · page ${n}`,
    description: `Current openings ${((n - 1) * 100 + 1).toLocaleString("en-US")}–${Math.min(n * 100, total).toLocaleString("en-US")} of ${total.toLocaleString("en-US")} at U.S. AI companies and labs.`,
    path: `/jobs/page/${n}/`,
    image: socialImages.jobs,
  });
}

export default async function JobsDirectoryPagedPage({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  const data = jobsDirectoryPage(getCatalog(), n);
  if (!Number.isInteger(n) || n < 2 || n > data.pageCount) notFound();
  return <JobsDirectoryList links={data.links} page={data.page} pageCount={data.pageCount} total={data.total} />;
}
