/**
 * The jobs section (/jobs) moved to https://aipeoplewiki.com/jobs/.
 * Every old /jobs address gets a single-hop 301 (slash and non-slash forms, so
 * Cloudflare's 307 trailing-slash step never runs first). Same path on the wiki
 * unless an exception applies — see data/jobs-redirect-exceptions.json and the
 * pattern rules below. Old job sitemap shards 301 to the wiki sitemap.
 *
 * Do not re-add this section. See docs/JOBS_MOVED.md.
 */
import EXCEPTIONS from "../data/jobs-redirect-exceptions.json";

export const JOBS_WIKI_ORIGIN = "https://aipeoplewiki.com";
export const JOBS_REDIRECT_EXCEPTIONS: Readonly<Record<string, string>> = EXCEPTIONS;

/** Path prefixes the Worker answers before static assets (also in wrangler.jsonc). */
export const JOBS_PREFIXES = ["/jobs"] as const;

export function isJobsPath(pathname: string): boolean {
  if (pathname === "/jobs" || pathname.startsWith("/jobs/")) return true;
  return isJobsSitemapPath(pathname);
}

export function isJobsSitemapPath(pathname: string): boolean {
  return /^\/sitemaps\/jobs-\d+\.xml$/.test(pathname) || /^\/sitemap-jobs-\d+\.xml$/.test(pathname);
}

function withSlash(pathname: string): string {
  if (/\.[a-z0-9]+$/i.test(pathname)) return pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function wiki(path: string): string {
  return `${JOBS_WIKI_ORIGIN}${path}`;
}

/**
 * The 301 target for an old jobs path (slash or non-slash form). Pages go to
 * the slashed wiki URL so the hop is one; feed.xml and sitemap files keep
 * their filename form.
 */
export function jobsRedirectTarget(pathname: string): string | null {
  if (!isJobsPath(pathname)) return null;
  if (isJobsSitemapPath(pathname)) return wiki("/sitemap.xml");

  const key = withSlash(pathname);

  if (Object.hasOwn(JOBS_REDIRECT_EXCEPTIONS, key)) {
    return wiki(JOBS_REDIRECT_EXCEPTIONS[key]);
  }

  if (key === "/jobs/index/") return wiki("/jobs/hiring/");
  if (key === "/jobs/at/federal/" || key.startsWith("/jobs/at/federal/")) return wiki("/jobs/");
  if (key === "/jobs/pay/" || key.startsWith("/jobs/pay/")) return wiki("/jobs/");
  if (key === "/jobs/layoffs/" || key.startsWith("/jobs/layoffs/")) return wiki("/jobs/");

  const roleState = key.match(/^\/jobs\/role\/([a-z0-9-]+)\/([a-z0-9-]+)\/(?:page\/\d+\/)?$/);
  if (roleState && roleState[2] !== "page") return wiki(`/jobs/role/${roleState[1]}/`);

  return wiki(key);
}

/** One hop, permanent, no query string carried over. A day of caching keeps a rollback quick. */
export function jobsRedirectResponse(target: string): Response {
  return new Response(null, {
    status: 301,
    headers: { location: target, "cache-control": "public, max-age=86400" },
  });
}
