"use client";

import { ARTIFACT_ENTRY_TYPES, type EntryType } from "@/lib/labels";
import { queryTokens, type SearchEntry } from "@/lib/search";

/**
 * The site-wide search index (public/data/search-index.json), fetched from the
 * site itself the first time anyone opens search, then shared by the header
 * search and the /search/ page. Nothing is sent anywhere else.
 */
let pending: Promise<SearchEntry[]> | null = null;

export function loadSearchIndex(url: string): Promise<SearchEntry[]> {
  pending ??= fetch(url)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((data: { entries: SearchEntry[] }) => data.entries)
    .catch((error) => {
      pending = null;
      throw error;
    });
  return pending;
}

/** Result groups shown as filters on /search/. */
export const SEARCH_GROUPS: { id: string; label: string; types: EntryType[] }[] = [
  { id: "organizations", label: "Organizations", types: ["organization"] },
  { id: "tools", label: "Models & tools", types: [...ARTIFACT_ENTRY_TYPES, "github-project", "huggingface-item"] },
  { id: "learn", label: "Learn", types: ["explainer", "learning-path", "kids-lesson", "hub", "glossary-term", "faq"] },
  { id: "news", label: "News", types: ["news", "newsletter"] },
  { id: "more", label: "Policy, licenses, and more", types: ["policy", "license", "place", "page"] },
];

export const groupOf = (type: EntryType) => SEARCH_GROUPS.find((g) => g.types.includes(type))?.id ?? "more";

/** Records a "surprise me" pick can land on: organizations and open models and tools. */
export const isRecord = (e: SearchEntry) => e.type === "organization" || ARTIFACT_ENTRY_TYPES.includes(e.type);

/** Splits `text` so the parts matching query words can be emphasized. */
export function highlightParts(text: string, query: string): { text: string; hit: boolean }[] {
  // Highlight the words the search actually matched on, not "what", "is" or "my".
  const words = queryTokens(query)
    .filter((w) => w.length > 1)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!words.length) return [{ text, hit: false }];
  const re = new RegExp(`(${words.join("|")})`, "gi");
  return text
    .split(re)
    .filter(Boolean)
    .map((part) => ({ text: part, hit: words.some((w) => new RegExp(`^${w}$`, "i").test(part)) }));
}
