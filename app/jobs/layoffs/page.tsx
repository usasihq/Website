import { JobsLayoffsIndex } from "@/components/JobsLayoffs";
import { getCatalog } from "@/lib/catalog";
import { layoffsIndex } from "@/lib/jobs/layoffs";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "WARN Act layoffs and nearby AI jobs",
  description: "Recent official WARN Act layoff notices in California, Washington, New York, and Texas, with links to open AI jobs in those places.",
  path: "/jobs/layoffs/",
});

export default function JobsLayoffsPage() {
  return <JobsLayoffsIndex index={layoffsIndex(getCatalog())} />;
}
