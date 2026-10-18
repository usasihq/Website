/**
 * Validation for AI on GitHub, run by `npm run validate`: the committed
 * snapshot's schema, order, and uniqueness; slugs; the denylist; and that no
 * listed project fails the published inclusion rules.
 */
import fs from "node:fs";
import { assignSlugs, baseSlug, exclusionReason, type RawRepo } from "./filters";
import { denylistMap, GITHUB_DATA_PATH, GITHUB_DENYLIST_PATH, GITHUB_INCLUDES_PATH, readDenylist, readIncludes, reviewedAiRepos } from "./load";
import { checkGithubDataset, GithubDataset, type GithubProject } from "./schema";

/** Rebuild the fields the rules read from a stored record. */
export function asRaw(p: GithubProject): RawRepo {
  return {
    id: p.id,
    full_name: p.full_name,
    name: p.name,
    owner: { login: p.owner, type: p.owner_type },
    description: p.description,
    html_url: p.html_url,
    homepage: p.homepage,
    stargazers_count: p.stars,
    forks_count: p.forks,
    open_issues_count: p.open_issues,
    language: p.language,
    license: p.license_spdx || p.license_name ? { spdx_id: p.license_spdx, name: p.license_name } : null,
    topics: p.topics,
    created_at: p.created_at,
    pushed_at: p.pushed_at,
    default_branch: p.default_branch,
    fork: false,
    archived: false,
    disabled: false,
  };
}

export function validateGithubData(dataFile = GITHUB_DATA_PATH, denyFile = GITHUB_DENYLIST_PATH): string[] {
  const problems: string[] = [];
  let deny;
  try {
    deny = readDenylist(denyFile);
  } catch (err) {
    return [`denylist.yml: ${(err as Error).message.slice(0, 300)}`];
  }
  let includes;
  try {
    includes = readIncludes(GITHUB_INCLUDES_PATH);
  } catch (err) {
    return [`includes.yml: ${(err as Error).message.slice(0, 300)}`];
  }
  const denied = new Set(deny.map((d) => d.full_name.toLowerCase()));
  const incSeen = new Set<string>();
  for (const i of includes) {
    const k = i.full_name.toLowerCase();
    if (incSeen.has(k)) problems.push(`includes.yml: duplicate entry ${i.full_name}`);
    if (denied.has(k)) problems.push(`includes.yml: ${i.full_name} is also in the denylist`);
    incSeen.add(k);
  }
  const seen = new Set<string>();
  for (const d of deny) {
    const k = d.full_name.toLowerCase();
    if (seen.has(k)) problems.push(`denylist.yml: duplicate entry ${d.full_name}`);
    seen.add(k);
  }
  if (!fs.existsSync(dataFile)) return [...problems, "projects.json is missing (run npm run github:refresh)"];
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch (err) {
    return [...problems, `projects.json: ${(err as Error).message}`];
  }
  const issues = checkGithubDataset(raw);
  if (issues.length) return [...problems, ...issues.map((i) => `projects.json › ${i}`)];
  const data = GithubDataset.parse(raw);
  const map = denylistMap(deny);
  const reviewed = reviewedAiRepos();
  for (const p of data.projects) {
    const reason = exclusionReason(asRaw(p), map, reviewed);
    // A stored description may be cut at 300 characters, dropping the words that showed it was about AI.
    if (reason === "non-ai" && p.description.endsWith("…")) continue;
    if (reason) problems.push(`projects.json › ${p.full_name} is listed but matches the "${reason}" exclusion rule`);
  }
  const slugs = assignSlugs(data.projects);
  if (new Set(slugs).size !== slugs.length) problems.push("projects.json: slugs are not unique");
  for (const [i, s] of slugs.entries()) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*--[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) {
      problems.push(`projects.json › ${data.projects[i].full_name}: slug "${s}" is not slug-safe`);
    }
    if (!s.startsWith(baseSlug(data.projects[i].full_name))) problems.push(`projects.json › ${data.projects[i].full_name}: unexpected slug "${s}"`);
  }
  return problems;
}
