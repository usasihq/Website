import Link from "@/components/Link";
import { PageHeader } from "@/components/PageHeader";
import { SearchResults } from "@/components/SearchResults";
import { pageMetadata } from "@/lib/metadata";
import { asset } from "@/lib/paths";

export const metadata = pageMetadata({
  title: "Search",
  description: "Search every published USASI record and page: organizations, open models and tools, explainers, kids lessons, news, policy, and licenses.",
  path: "/search/",
  noindex: true,
});

export default function SearchPage() {
  return (
    <>
      <PageHeader
        eyebrow="Search"
        title="Search the site"
        description={
          <p>
            Search runs in your browser over an index of published records and pages, downloaded from this site. What you type is kept in the page address
            so you can share a search, as the <Link href="/privacy/" className="link">privacy page</Link> explains. Press{" "}
            <kbd className="font-mono">/</kbd> on any page to search from there.
          </p>
        }
      />
      <div className="container-page py-10">
        <SearchResults indexUrl={asset("/data/search-index.json")} />
      </div>
    </>
  );
}
