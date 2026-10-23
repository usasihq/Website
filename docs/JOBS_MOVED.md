# The jobs section moved to aipeoplewiki.com

On 2026-10-23 the jobs section was removed from this site and now lives on
<https://aipeoplewiki.com/jobs/>, under the same paths. **Do not re-add it here.**

## What was removed

- Routes: `/jobs/*` (directory, employer and listing pages, topics, states, roles,
  pay, layoffs, hiring index, and feeds).
- The Jobs nav item, footer jobs links, home page jobs sections, jobs search
  entries, job sitemap shards, and jobs structured data.
- Code and data: `app/jobs`, `lib/jobs`, `data/jobs`, `data/layoffs`, jobs
  components and scripts, `.github/workflows/refresh-jobs.yml`, and the Hugging
  Face jobs Space.

The removed files are preserved on the branch `archive/jobs-before-removal`.

## What replaces it

- `worker.ts` answers a single-hop **301** for every old `/jobs` address, in both
  the slash and the non-slash form (so Cloudflare's 307 trailing-slash step never
  runs first). Same path on aipeoplewiki.com, except the compact exception rules
  in `lib/jobs-redirects.ts` (federal listings, pay, layoffs, hiring index, role ×
  state hubs, and a lookup of closed listings and deep pagination pages in
  `data/jobs-redirect-exceptions.json`). Old job sitemap shards 301 to the wiki
  sitemap. Non-GET/HEAD fall through to assets.
- `wrangler.jsonc` lists `/jobs` and `/jobs/*` in `assets.run_worker_first`
  (`/jobs/*` covers `/jobs/at/*`).
- The footer already has one plain "People → AI People Wiki" link. This change
  does not add a second wiki pointer.

## Guard

`npm run check:jobs-removed` (unit test `tests/unit/jobs-removal.test.ts`, and a CI
step after the build with `--require-out`) fails if:

- `app/jobs`, `lib/jobs`, `data/jobs`, `data/layoffs`, the refresh-jobs workflow,
  jobs components, or jobs scripts reappear;
- any source, content or public file links to `/jobs`;
- the build in `out/` contains a `/jobs` directory, a jobs sitemap shard, or a
  sitemap, `llms.txt` or search entry for those paths.

If a check fails, do not weaken it: remove the page or link.

## Changing or removing a redirect

Edit `lib/jobs-redirects.ts` or `data/jobs-redirect-exceptions.json`. Keys keep a
trailing slash (except `feed.xml` and sitemap files). Removing a rule turns that
old address into a same-path 301, or a 404 if it is no longer under `/jobs`.
