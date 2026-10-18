/**
 * AI on GitHub list items and filters. Client-safe and pure: the /github/
 * directory, its URL state, and the unit tests share these.
 */
import { normalize } from "../search";
import type { GithubProject } from "./schema";

export type GithubListItem = {
  slug: string;
  rank: number;
  fullName: string;
  owner: string;
  ownerType: "User" | "Organization";
  name: string;
  description: string;
  stars: number;
  language: string | null;
  /** SPDX id, "Other" (a license GitHub could not identify), or "None". */
  license: string;
  topics: string[];
  /** YYYY-MM-DD */
  pushedAt: string;
};

export function licenseKey(p: Pick<GithubProject, "license_spdx" | "license_name">): string {
  return p.license_spdx ?? (p.license_name ? "Other" : "None");
}

export function licenseLabel(key: string): string {
  if (key === "None") return "No license file detected";
  if (key === "Other") return "Other license";
  return key;
}

export const OWNER_TYPE_LABELS = { User: "Personal account", Organization: "Organization" } as const;

export const DEFAULT_GITHUB_FILTERS = { q: "", topic: "", lang: "", license: "", owner: "" as "" | "User" | "Organization" };
export type GithubFilters = typeof DEFAULT_GITHUB_FILTERS;

const token = (v: string | null, max: number, re: RegExp) => {
  const s = (v ?? "").trim().slice(0, max);
  return re.test(s) ? s : "";
};

export function parseGithubFilters(p: URLSearchParams): GithubFilters {
  const owner = p.get("owner");
  return {
    q: (p.get("q") ?? "").trim().slice(0, 120),
    topic: token(p.get("topic"), 50, /^[a-z0-9][a-z0-9-]*$/),
    lang: token(p.get("lang"), 60, /^[A-Za-z0-9 #+.'-]+$/),
    license: token(p.get("license"), 80, /^[A-Za-z0-9.+-]+$/),
    owner: owner === "User" || owner === "Organization" ? owner : "",
  };
}

export function serializeGithubFilters(f: GithubFilters): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v) p.set(k, v);
  return p.toString();
}

export const activeGithubFilters = (f: GithubFilters) => Object.values(f).filter(Boolean).length;
export const isDefaultGithubView = (f: GithubFilters) => activeGithubFilters(f) === 0;

/** Every query word must appear in the name, owner, description, language, or topics. Rank order is kept. */
export function filterGithub(items: readonly GithubListItem[], f: GithubFilters): GithubListItem[] {
  const words = normalize(f.q).split(/\s+/).filter(Boolean);
  return items.filter((i) => {
    if (f.topic && !i.topics.includes(f.topic)) return false;
    if (f.lang && i.language !== f.lang) return false;
    if (f.license && i.license !== f.license) return false;
    if (f.owner && i.ownerType !== f.owner) return false;
    if (!words.length) return true;
    const text = normalize([i.fullName, i.name.replace(/[-_.]/g, " "), i.description, i.language ?? "", i.topics.join(" ")].join(" "));
    return words.every((w) => text.includes(w));
  });
}

/** Options for a filter menu: values by how many projects have them, then name. */
export function countOptions(values: Iterable<string>, min = 1): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts]
    .filter(([, n]) => n >= min)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "en"))
    .map(([value, count]) => ({ value, count }));
}
