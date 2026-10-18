import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { GithubPagination, GithubRows } from "@/components/GithubList";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { GITHUB_PAGE_SIZE, githubFetchedLabel, githubPageCount, githubPageEntries, githubPageHref, sectionHero, toListItem } from "@/lib/github/projects";
import { readGithubDataset } from "@/lib/github/load";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

const nf = (v: number) => v.toLocaleString("en-US");

export function generateStaticParams() {
  return Array.from({ length: githubPageCount() - 1 }, (_, i) => ({ n: String(i + 2) }));
}

function range(n: number) {
  const total = readGithubDataset().projects.length;
  const from = (n - 1) * GITHUB_PAGE_SIZE + 1;
  const to = Math.min(n * GITHUB_PAGE_SIZE, total);
  return { from: nf(from), to: nf(to), start: from, total };
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  const { from, to } = range(n);
  const hero = sectionHero();
  return pageMetadata({
    title: `AI on GitHub: projects ranked ${from}–${to}`,
    description: `Open-source AI projects on GitHub ranked ${from} to ${to} by stars, each with its own page. Data from the GitHub API, fetched ${githubFetchedLabel()}.`,
    path: githubPageHref(n),
    image: { path: hero.image, alt: hero.alt },
  });
}

export default async function GithubRankPage({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  const count = githubPageCount();
  if (!Number.isInteger(n) || n < 2 || n > count) notFound();
  const { from, to, start, total } = range(n);
  const items = githubPageEntries(n).map(toListItem);
  return (
    <>
      <PageHeader
        compact
        crumbs={[{ href: "/github/", label: "AI on GitHub" }]}
        current={{ href: githubPageHref(n), label: `Ranked ${from}–${to}` }}
        eyebrow="Directory · AI on GitHub"
        title={`AI on GitHub: ranked ${from}–${to}`}
        description={
          <p>
            Projects {from} to {to} of {total.toLocaleString("en-US")}, by GitHub stars. Data from the GitHub API, fetched {githubFetchedLabel()}. Star counts
            change daily. To search and filter every project, use{" "}
            <Link href="/github/" className="link">
              the full list
            </Link>
            .
          </p>
        }
      />
      <div className="container-page py-6">
        <GithubRows items={items} start={start} />
        <GithubPagination current={n} count={count} total={total} pageSize={GITHUB_PAGE_SIZE} />
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
