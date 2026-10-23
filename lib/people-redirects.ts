/**
 * The people section (/people, /big-si, /voices, /local) moved to
 * https://aipeoplewiki.com/. Every old address that ever had a page is in
 * data/people-redirect-map.json (key: old path with trailing slash, value: the
 * absolute target). worker.ts answers a single-hop 301 for both the slash and the
 * non-slash form of each key; every other address under these prefixes is a 404.
 *
 * Do not re-add these sections. See docs/PEOPLE_MOVED.md.
 */
import MAP from "../data/people-redirect-map.json";

export const PEOPLE_REDIRECT_MAP: Readonly<Record<string, string>> = MAP;

/** Path prefixes that belong to the moved section (also in wrangler.jsonc run_worker_first). */
export const MOVED_PREFIXES = ["/people", "/big-si", "/voices", "/local"] as const;

/** True for a moved prefix itself or anything beneath it ("/local-ai/" is not under "/local"). */
export function isMovedPath(pathname: string): boolean {
  return MOVED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** The 301 target for an old path (slash or non-slash form), or null when the path is unknown. */
export function peopleRedirectTarget(pathname: string): string | null {
  if (!isMovedPath(pathname)) return null;
  const key = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return Object.hasOwn(PEOPLE_REDIRECT_MAP, key) ? PEOPLE_REDIRECT_MAP[key] : null;
}

/** One hop, permanent, no query string carried over. A day of caching keeps a rollback quick. */
export function peopleRedirectResponse(target: string): Response {
  return new Response(null, {
    status: 301,
    headers: { location: target, "cache-control": "public, max-age=86400" },
  });
}
