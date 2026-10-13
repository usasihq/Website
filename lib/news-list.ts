/**
 * The /news/ list: rows the client filter needs, and URL-state filters.
 * Client-safe.
 */
import { NEWS_CATEGORIES, type NewsCategory } from "./schema";
import { normalize } from "./search";

export type NewsListItem = {
  slug: string;
  title: string;
  event_date: string;
  published_at: string;
  category: NewsCategory;
  summary: string;
  /** Related published catalog records, organizations first. */
  related: { href: string; name: string; slug: string; kind: "organization" | "artifact" }[];
  /** Organizations related directly or through a related artifact, for the organization filter. */
  organizations: string[];
};

export const DEFAULT_NEWS_FILTERS = { q: "", category: "" as NewsCategory | "", org: "", month: "" };
export type NewsFilters = typeof DEFAULT_NEWS_FILTERS;

export function parseNewsFilters(p: URLSearchParams): NewsFilters {
  const category = p.get("category") ?? "";
  return {
    q: (p.get("q") ?? "").trim().slice(0, 120),
    category: (NEWS_CATEGORIES as readonly string[]).includes(category) ? (category as NewsCategory) : "",
    org: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.get("org") ?? "") ? p.get("org")!.slice(0, 80) : "",
    month: /^\d{4}-(0[1-9]|1[0-2])$/.test(p.get("month") ?? "") ? p.get("month")! : "",
  };
}

export function serializeNewsFilters(f: NewsFilters): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v) p.set(k, v);
  return p.toString();
}

export function filterNews(items: NewsListItem[], f: NewsFilters): NewsListItem[] {
  const words = normalize(f.q).split(/\s+/).filter(Boolean);
  return items.filter((n) => {
    if (f.category && n.category !== f.category) return false;
    if (f.org && !n.organizations.includes(f.org)) return false;
    if (f.month && !n.event_date.startsWith(f.month)) return false;
    if (!words.length) return true;
    const text = normalize([n.title, n.summary, ...n.related.map((r) => r.name)].join(" "));
    return words.every((w) => text.includes(w));
  });
}

/** "2026-10-05" → "2026-10". */
export const eventMonth = (date: string) => date.slice(0, 7);
