/**
 * Runs first only for /jobs/at/* (see wrangler.jsonc). Live listing pages,
 * employer pages, feeds, and pagination are still the static files in ./out.
 * A listing URL with no file is a closed posting: 410 and the closed-job page,
 * not the generic catalog 404.
 */
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
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) return asset;
    const index = await loadIndex(env, request);
    if (!index) return asset;
    const closed = closedJobResponse(index, new URL(request.url).pathname);
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
