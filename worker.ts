/**
 * Runs first only for the paths in wrangler.jsonc run_worker_first:
 *
 * - /people, /big-si, /voices, /local (and everything beneath): the people
 *   section moved to https://aipeoplewiki.com/. Known old addresses get a
 *   single-hop 301 (slash and non-slash forms, so the platform never adds a 307
 *   first); unknown ones fall through to the static 404. See
 *   lib/people-redirects.ts and docs/PEOPLE_MOVED.md.
 * - /jobs/at/*: live listing pages, employer pages, feeds, and pagination are
 *   still the static files in ./out. A listing URL with no file is a closed
 *   posting: 410 and the closed-job page, not the generic catalog 404.
 */
import { isMovedPath, peopleRedirectResponse, peopleRedirectTarget } from "./lib/people-redirects";
import { CLOSED_JOBS_INDEX_PATH, type ClosedJobIndex } from "./lib/jobs/closed-job";
import { closedJobResponse } from "./lib/jobs/closed-job-html";

interface Env {
  ASSETS: { fetch: (input: Request | URL | string) => Promise<Response> };
}

let cached: ClosedJobIndex | null = null;

async function loadIndex(env: Env, request: Request): Promise<ClosedJobIndex | null> {
  if (cached) return cached;
  const res = await env.ASSETS.fetch(new URL(CLOSED_JOBS_INDEX_PATH, request.url).toString());
  if (!res.ok) return null;
  cached = (await res.json()) as ClosedJobIndex;
  return cached;
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (isMovedPath(pathname)) {
      const target = request.method === "GET" || request.method === "HEAD" ? peopleRedirectTarget(pathname) : null;
      // No static files exist under these prefixes, so an unknown path is the catalog 404.
      return target ? peopleRedirectResponse(target) : env.ASSETS.fetch(request);
    }
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) return asset;
    const index = await loadIndex(env, request);
    if (!index) return asset;
    const closed = closedJobResponse(index, pathname);
    if (!closed) return asset;
    const headers = new Headers(asset.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("x-robots-tag", "noindex, follow");
    headers.delete("content-length");
    headers.delete("content-encoding");
    return new Response(request.method === "HEAD" ? null : closed.html, { status: 410, headers });
  },
};

export default worker;
