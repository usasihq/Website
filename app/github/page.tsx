import Link from "@/components/Link";
import { GithubDirectory } from "@/components/GithubDirectory";
import { GithubPagination } from "@/components/GithubList";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { githubListData } from "@/lib/github/page-data";
import { GITHUB_PAGE_SIZE, githubFetchedLabel, githubPageCount, sectionHero } from "@/lib/github/projects";
import { pageMetadata } from "@/lib/metadata";
import { asset } from "@/lib/paths";
import { itemList } from "@/lib/structured-data";

const { data, items } = githubListData();
const hero = sectionHero();

export const metadata = pageMetadata({
  title: "AI on GitHub: the most-starred open-source AI projects",
  description: `The ${items.length.toLocaleString("en-US")} most-starred open-source AI projects on GitHub, ranked by stars, each with its own page: language, license, topics, and last push. Data from the GitHub API, fetched ${githubFetchedLabel(data)}.`,
  path: "/github/",
  image: { path: hero.image, alt: hero.alt },
});

export default function GithubPage() {
  const { data, items, topics, languages, licenses, owners } = githubListData();
  const fetched = githubFetchedLabel(data);
  const first = items.slice(0, GITHUB_PAGE_SIZE);
  return (
    <>
      <JsonLd data={itemList({ name: "AI on GitHub: most-starred open-source AI projects", path: "/github/", items: first.map((i) => ({ name: i.fullName, href: `/github/${i.slug}/` })) })} />
      <PageHeader
        compact
        eyebrow="Directory · AI on GitHub"
        title="AI on GitHub"
        description={
          <p>
            The most-starred open-source AI projects on GitHub, ranked by stars: frameworks, agents, local and hosted inference, models, and
            tools. Data from the GitHub API, fetched {fetched}. Star counts change daily.
          </p>
        }
      >
        <p className="meta mt-2">
          {items.length.toLocaleString("en-US")} projects · {owners.Organization.toLocaleString("en-US")} from organizations ·{" "}
          {owners.User.toLocaleString("en-US")} from personal accounts. Stars measure popularity, not quality or safety.{" "}
          <Link href="/methodology/#github" className="link">
            How this list is made
          </Link>
        </p>
      </PageHeader>
      <div className="container-page py-6">
        <GithubDirectory initial={first} total={items.length} dataUrl={asset("/data/github.json")} topics={topics} languages={languages} licenses={licenses} />
        <GithubPagination current={1} count={githubPageCount(data)} total={items.length} pageSize={GITHUB_PAGE_SIZE} />
        <section aria-labelledby="about-github" className="mt-12 max-w-3xl rounded-xl border border-line p-5 text-[0.9375rem] text-muted">
          <h2 id="about-github" className="font-semibold text-text">
            About this list
          </h2>
          <p className="mt-2">
            Projects come from GitHub&rsquo;s public search for AI topics, with at least 500 stars, ranked by stars. Forks, archived
            repositories, link lists, courses and books, collected prompts and jailbreaks, and deepfake or face-swap tools are left out. The list
            includes projects from anywhere in the world; it shows whether the owner is an organization or a personal account and does not
            guess anyone&rsquo;s country. Descriptions are the projects&rsquo; own words from GitHub. A listing is not an endorsement or a
            USASI catalog review; where a project is also in{" "}
            <Link href="/open/" className="link">
              Open Models &amp; Tools
            </Link>
            , its page links to the catalog record.
          </p>
        </section>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
