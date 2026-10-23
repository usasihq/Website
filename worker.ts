/**
 * Runs first only for the paths in wrangler.jsonc run_worker_first:
 *
 * - /people, /big-si, /voices, /local (and everything beneath): the people
 *   section moved to https://aipeoplewiki.com/. Known old addresses get a
 *   single-hop 301 (slash and non-slash forms, so the platform never adds a 307
 *   first); unknown ones fall through to the static 404. See
 *   lib/people-redirects.ts and docs/PEOPLE_MOVED.md.
 * - /jobs (and everything beneath), plus old job sitemap shards: the jobs
 *   section moved to https://aipeoplewiki.com/jobs/. Every old address gets a
 *   single-hop 301 (same path, with a short exception list). See
 *   lib/jobs-redirects.ts and docs/JOBS_MOVED.md.
 */
import { isJobsPath, jobsRedirectResponse, jobsRedirectTarget } from "./lib/jobs-redirects";
import { isMovedPath, peopleRedirectResponse, peopleRedirectTarget } from "./lib/people-redirects";

interface Env {
  ASSETS: { fetch: (input: Request | URL | string) => Promise<Response> };
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (isMovedPath(pathname)) {
      const target = request.method === "GET" || request.method === "HEAD" ? peopleRedirectTarget(pathname) : null;
      // No static files exist under these prefixes, so an unknown path is the catalog 404.
      return target ? peopleRedirectResponse(target) : env.ASSETS.fetch(request);
    }
    if (isJobsPath(pathname)) {
      const target = request.method === "GET" || request.method === "HEAD" ? jobsRedirectTarget(pathname) : null;
      return target ? jobsRedirectResponse(target) : env.ASSETS.fetch(request);
    }
    return env.ASSETS.fetch(request);
  },
};

export default worker;
