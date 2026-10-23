# The people section moved to aipeoplewiki.com

On 2026-10-23 the people section was removed from this site and now lives on its own
site, <https://aipeoplewiki.com/> (people, companies, topics, Big SI, Voices, Local),
under the same slugs. **Do not re-add it here.**

## What was removed

- Routes: `/people/*`, `/big-si/*`, `/voices`, `/local`.
- The People nav menu, footer links, home page people sections, the people search scope,
  the people strips on company and jobs pages, and the people entries in `llms.txt`, the
  sitemap, search data, structured data and the social cards.
- Content and data: `content/people`, `content/leaders`, `data/people`.

The removed files are preserved on the branch `archive/people-before-removal`.

## What replaces it

- `worker.ts` answers a single-hop **301** for every old address, in both the slash and
  the non-slash form (so Cloudflare's 307 trailing-slash step never runs first). The
  map is `data/people-redirect-map.json` (old path → absolute target); the logic is in
  `lib/people-redirects.ts`. Unknown paths under these prefixes are a normal 404.
- `wrangler.jsonc` lists the four prefixes (bare and `/*`) in `assets.run_worker_first`.
- The only outbound pointer is one plain link in the footer ("People → AI People Wiki",
  `rel="noopener"`, no tracking).

## Guard

`npm run check:people-removed` (unit test `tests/unit/people-removal.test.ts`, and a CI
step after the build with `--require-out`) fails if:

- any `app/people`, `app/big-si`, `app/voices`, `app/local`, `content/people`,
  `content/leaders` or `data/people` directory, or a people component or `lib/people*`
  file (other than `lib/people-redirects.ts`), reappears;
- any source, content or public file links to `/people`, `/big-si`, `/voices` or `/local`;
- the build in `out/` contains a file for any key of the redirect map, a directory for
  one of the four prefixes, or a sitemap, `llms.txt` or search entry for those paths.

If a check fails, do not weaken it: remove the page or link. The redirect map may only
change when the new site changes a slug.

## Changing or removing a redirect

Edit `data/people-redirect-map.json` and keep the keys with a trailing slash. Removing
a key turns that old address into a 404. Only do that if the old address should stop
forwarding, since links and search results elsewhere may still use it.
