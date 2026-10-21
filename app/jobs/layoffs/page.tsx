import { JobsLayoffsIndex } from "@/components/JobsLayoffs";
import { getCatalog } from "@/lib/catalog";
import { layoffsIndex } from "@/lib/jobs/layoffs";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "WARN Act layoff notices and nearby AI jobs in the U.S.",
  description: "Recent official WARN Act layoff notices in California, Washington, New York, and Texas, with links to open AI jobs in those places.",
  path: "/jobs/layoffs/",
});

export default function JobsLayoffsPage() {
  return <JobsLayoffsIndex index={layoffsIndex(getCatalog())} />;
}
