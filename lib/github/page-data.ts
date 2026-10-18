/**
 * Props for the /github/ index and its ranking pages, computed once per build.
 * Server/build only.
 */
import { countOptions, type GithubListItem } from "./directory";
import { readGithubDataset } from "./load";
import { githubEntries, toListItem } from "./projects";

export function githubListData() {
  const data = readGithubDataset();
  const items: GithubListItem[] = githubEntries(data).map(toListItem);
  return {
    data,
    items,
    topics: countOptions(items.flatMap((i) => i.topics), 5).slice(0, 120),
    languages: countOptions(items.map((i) => i.language).filter((l): l is string => Boolean(l))),
    licenses: countOptions(items.map((i) => i.license)),
    owners: { Organization: items.filter((i) => i.ownerType === "Organization").length, User: items.filter((i) => i.ownerType === "User").length },
  };
}
