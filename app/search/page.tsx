import Link from "@/components/Link";
import { PageHeader } from "@/components/PageHeader";
import { SearchResults } from "@/components/SearchResults";
import { GITHUB_SEARCH_LIMIT } from "@/lib/github/projects";
import { HF_SEARCH_LIMIT } from "@/lib/huggingface/items";
import { pageMetadata } from "@/lib/metadata";
import { asset } from "@/lib/paths";

const gh: number = GITHUB_SEARCH_LIMIT;
const hf: number = HF_SEARCH_LIMIT;

export const metadata = pageMetadata({
  title: "Search",
  description: `Search organizations, open models and tools, people, Voices of SI, news, policy, and explainers, plus ${
    gh === hf
      ? `the top ${gh.toLocaleString("en-US")} each of AI on GitHub and AI on Hugging Face`
      : `the top ${gh.toLocaleString("en-US")} of AI on GitHub and ${hf.toLocaleString("en-US")} of AI on Hugging Face`
  }.`,
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
        <p className="mb-6 max-w-3xl text-[0.9375rem] text-muted" data-testid="search-coverage">
          Covers organizations, open models and tools, <Link href="/people/" className="link">people</Link>,{" "}
          <Link href="/voices/" className="link">Voices of SI</Link>, news, policy, explainers, and guides. From{" "}
          <Link href="/github/" className="link">AI on GitHub</Link> it includes the {GITHUB_SEARCH_LIMIT.toLocaleString("en-US")} projects with the
          most stars, and from <Link href="/huggingface/" className="link">AI on Hugging Face</Link> the {HF_SEARCH_LIMIT.toLocaleString("en-US")} most-liked
          models and datasets; those pages search all of their entries.
        </p>
        <SearchResults indexUrl={asset("/data/search-index.json")} />
      </div>
    </>
  );
}
