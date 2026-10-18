/**
 * Loads data/github/projects.json and the reviewed denylist. Server/build only.
 * The build works from the committed snapshot; only scripts/refresh-github.ts
 * touches the network.
 */
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { Denylist, GithubDataset, Includes, type DenylistEntry, type IncludeEntry } from "./schema";

export const GITHUB_DATA_PATH = path.join(process.cwd(), "data/github/projects.json");
export const GITHUB_DENYLIST_PATH = path.join(process.cwd(), "data/github/denylist.yml");
export const GITHUB_INCLUDES_PATH = path.join(process.cwd(), "data/github/includes.yml");

let cached: GithubDataset | undefined;

export function readGithubDataset(file = GITHUB_DATA_PATH): GithubDataset {
  if (file === GITHUB_DATA_PATH && cached) return cached;
  const data = GithubDataset.parse(JSON.parse(fs.readFileSync(file, "utf8")));
  if (file === GITHUB_DATA_PATH) cached = data;
  return data;
}

export function readDenylist(file = GITHUB_DENYLIST_PATH): DenylistEntry[] {
  return Denylist.parse(parse(fs.readFileSync(file, "utf8")) ?? { entries: [] }).entries;
}

export function denylistMap(entries: DenylistEntry[]): Map<string, DenylistEntry> {
  return new Map(entries.map((e) => [e.full_name.toLowerCase(), e]));
}

/** Stable JSON: one project per line keeps diffs readable. */
export function serializeGithubDataset(data: GithubDataset): string {
  const { projects, ...head } = data;
  const lines = projects.map((p) => `    ${JSON.stringify(p)}`);
  const headJson = JSON.stringify(head, null, 2).replace(/\n}$/, "");
  return `${headJson},\n  "projects": [\n${lines.join(",\n")}\n  ]\n}\n`;
}

export function writeGithubDataset(data: GithubDataset, file = GITHUB_DATA_PATH): void {
  GithubDataset.parse(data);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, serializeGithubDataset(data));
  fs.renameSync(`${file}.tmp`, file);
}

export function readIncludes(file = GITHUB_INCLUDES_PATH): IncludeEntry[] {
  if (!fs.existsSync(file)) return [];
  return Includes.parse(parse(fs.readFileSync(file, "utf8")) ?? { entries: [] }).entries;
}

/** owner/repo (as written) for every github.com repository a catalog artifact links to or cites. */
export function catalogGithubRepos(dir = path.join(process.cwd(), "content/artifacts")): string[] {
  const seen = new Map<string, string>();
  const skip = new Set(["orgs", "topics", "features", "apps", "marketplace", "sponsors", "collections", "settings", "users", "enterprise"]);
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".yml"))) {
    const text = fs.readFileSync(path.join(dir, f), "utf8");
    for (const m of text.matchAll(/https:\/\/(?:www\.)?github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?(?=[/?#"'\s]|$)/g)) {
      if (skip.has(m[1].toLowerCase())) continue;
      const name = `${m[1]}/${m[2]}`;
      if (!seen.has(name.toLowerCase())) seen.set(name.toLowerCase(), name);
    }
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

/**
 * Repositories that USASI catalog records name as their own code repository
 * (a link or source of kind "repository" in a published record). With
 * data/github/includes.yml, these are reviewed as AI projects, so the "no AI
 * signal" rule does not apply to them (every other rule does).
 */
export function catalogRepositoryLinks(dir = path.join(process.cwd(), "content/artifacts")): string[] {
  const out = new Set<string>();
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".yml"))) {
    const doc = parse(fs.readFileSync(path.join(dir, f), "utf8")) as { publication_status?: string; links?: { kind?: string; url?: string }[]; sources?: { kind?: string; url?: string }[] } | null;
    if (!doc || doc.publication_status !== "published") continue;
    for (const l of [...(doc.links ?? []), ...(doc.sources ?? [])]) {
      if (l?.kind !== "repository" || typeof l.url !== "string") continue;
      const m = l.url.match(/^https:\/\/(?:www\.)?github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?(?:[/?#].*)?$/);
      if (m) out.add(`${m[1]}/${m[2]}`.toLowerCase());
    }
  }
  return [...out].sort();
}

/** Lowercase full names reviewed as AI projects: must-includes plus catalog repositories. */
export function reviewedAiRepos(): Set<string> {
  return new Set([...readIncludes().map((i) => i.full_name.toLowerCase()), ...catalogRepositoryLinks()]);
}
