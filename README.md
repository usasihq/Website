# United States of America Superintelligence (USASI)

*American AI, infrastructure, and innovation.*

An independent, **unofficial** catalog of U.S. AI organizations and U.S.-led open
models, software, datasets, and evaluation tools, with a source for every
claim. Two equal directories — **Companies & Labs** and **Open Models &
Tools** — plus a comparison workspace, a published methodology, and an optional
tip link.

> Independent project. Not a United States government website.

- Domain: `unitedstatesofamericasuperintelligence.com`
- Stack: Next.js 16 (App Router, static export) · TypeScript · Tailwind CSS 4 ·
  YAML content validated with Zod · MDX for editorial pages · lucide-react
- Output: plain static files in `out/`. No server, database, accounts, CMS,
  analytics, or cookies.

Before going live, read **[SETUP_REQUIRED.md](SETUP_REQUIRED.md)** — it lists
the owner decisions and configuration this repository cannot make for you.

---

## Quick start

Requires Node.js 22 (see `.nvmrc`; CI uses the latest 22.x). Node ≥ 22.13 is
recommended — a few dev tools warn on 22.11.

```bash
npm ci
npm run dev             # http://localhost:3000 (development server)
npm run build           # validate → data exports → static export in out/ → post-build checks
npm run preview:static  # serve out/ like a static host at http://localhost:4321
```

`npm run dev` is for editing only. Always check the exported site with
`npm run build && npm run preview:static` (or `npm run preview:cloudflare`).

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload. |
| `npm run validate` | Validates every YAML record: schemas, unique slugs and source IDs, relationships, source references, eligibility/publication consistency, dates, family/release structure, placeholder text. Exit code 1 on errors. |
| `npm run typecheck` | TypeScript, no emit. |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules). |
| `npm test` | Vitest unit tests (schema rejection, catalog filtering, reverse links, search/filters/URL state, openness tiers, every matrix cell → its records, support configuration). |
| `npm run test:e2e` | Playwright against the built `out/`: journeys, URL state, 404s, drafts excluded, headers/CSP, keyboard and mobile menu, axe accessibility, layouts at 360/390/768/1280/1920 px with screenshots in `reports/screenshots/`. Run `npm run build` first. |
| `npm run test:basepath` | Builds a second export under `/usasi` (GitHub Pages project-site layout) into `.out-basepath/`, checks its links, and runs the base-path tests. |
| `npm run build` | `validate` → `prepare:data` → `next build` (static export) → `scripts/postbuild.mjs` (per-page CSP, leak checks). |
| `npm run check:links` | Verifies every internal link, asset, and `#fragment` in `out/`. |
| `npm run check:sources` | Requests every cited source URL and writes `reports/source-check.json`. Editorial tool only: never edits content and is not part of the build. |
| `npm run report:reviews` | Lists records whose evidence review is older than 180 days (`-- --max-age N`), pending eligibility, and stale product reviews. Read-only. |
| `npm run preview:static` | Dependency-free static server for `out/` that applies `_headers` and compression (`-- --base /usasi --dir .out-basepath` for base paths). |
| `npm run preview:cloudflare` | Serves `out/` in Cloudflare's local Workers runtime (`wrangler dev`) with the real asset routing, `_headers`, and 404 handling. No account needed. |
| `npm run deploy:cloudflare` | `wrangler deploy` — requires your Cloudflare login or API token. Not run by anything automatically. |
| `npm run prepare:images` | Regenerates hero derivatives, `og.png`, and the touch icon from the untouched original artwork. |

## Repository layout

```
app/                     routes (App Router); every page is prerendered
  companies/[slug]/      organization detail
  open/[slug]/           artifact / model family / model release detail
  matrix/                comparison workspace
  …                      about, compact, methodology, disclaimer, changelog,
                         contribute, support, privacy, not-found, sitemap, robots
components/              UI (server components, plus small client islands for
                         search, filters, and the mobile menu)
content/
  organizations/*.yml    one organization per file
  artifacts/*.yml        one model family / release / project per file
  changelog/*.yml        genuine catalog changes
  featured.yml           homepage editorial selection (with explanation)
  pages/*.mdx            editorial pages
lib/
  schema.ts              Zod schemas (the content contract)
  validate.ts            cross-record validation
  catalog.ts             build-time catalog: published-only view, derived relations
  openness.ts            rubric v0.1 checklists and tier computation
  search.ts              search, filters, sorting, URL state (client-safe)
  matrix.ts              comparison cells defined as directory filters
  site-config.ts         owner configuration (tip link, repository)
scripts/                 validation, data export, post-build, checks, preview server
tests/unit, tests/e2e    Vitest and Playwright suites; tests/fixtures holds
                         synthetic fixtures that never enter the site
assets/original/         the supplied artwork, untouched
research/                research briefs, notes, and fact-check logs (never exported)
```

## Editing content

Records are YAML. The full field reference with examples is
**[docs/CONTENT_FORMAT.md](docs/CONTENT_FORMAT.md)**. The essentials:

1. **One file per record**, named `<slug>.yml`, in `content/organizations/` or
   `content/artifacts/`.
2. **Every public statement cites sources.** Claims are `{ text, source_ids }`;
   each ID matches an entry in the record's `sources` list (`id`, `title`,
   `url`, `publisher`, `kind`, `published_at`, `accessed_at`). Only cite pages
   you opened and read.
3. **Unknown stays unknown.** Use `null` or `status: unknown`. Dates keep their
   documented precision (`2025`, `2025-08`, or `2025-08-14`).
4. **Relationships live in one place.** An artifact lists its
   `organization_slugs`; organization pages derive their "related artifacts"
   from that. Organizations point to a parent with `parent_org_slug`.
5. **Families vs. releases.** A model family record (`record_level: family`)
   summarizes a line and carries no licenses or checklist. Each release
   (`record_level: release`, with `family_slug`) carries its own licenses,
   availability, and checklist. Software, datasets, and eval tools are
   `record_level: project`.
6. **Publication.** `draft` records never appear anywhere public.
   `published` requires `eligibility.status: eligible`. `archived` keeps a
   labeled historical page (noindex) but is excluded from directories, search,
   counts, exports, and the sitemap; it requires `archive_note`.
7. Run `npm run validate`, then `npm run build`.

### Adding an organization

Copy the sample in `docs/CONTENT_FORMAT.md` to
`content/organizations/<slug>.yml`. Fill in documented roles, ownership
category, legal form (only if verified), headquarters, sectors, products (each
with an official URL and sources), and an eligibility assessment per
[ELIGIBILITY.md](ELIGIBILITY.md). Research units get their own record only when
they publish distinct artifacts, with `parent_org_slug` and
`parent_relationship`.

### Adding an artifact

Create `content/artifacts/<slug>.yml`. For a model, add or reuse a family record
and create one record per assessed release. Fill the type-specific checklist
from [OPENNESS.md](OPENNESS.md); the openness tier is computed automatically and
is never typed by hand.

### Review dates

| Field | Meaning | Who changes it |
| --- | --- | --- |
| `released_at` | Documented artifact release date, or `null` | Only with a source |
| `updated_at` | Last substantive edit to the record | Any editor making a real change |
| `last_reviewed` | Last time an editor re-checked the evidence | Only the editor who re-checked |
| build date | Website generation time (footer, `catalog.json`) | The build — never written into records |

`npm run report:reviews` lists records due for re-review.

### Changelog and homepage selection

Add a file under `content/changelog/` for each genuine catalog or policy change.
`content/featured.yml` holds the homepage's editorial selection (up to six per
directory) and must explain why the entries were chosen; tips never affect it.

### Rules and rubrics

- [ELIGIBILITY.md](ELIGIBILITY.md) — who qualifies and how edge cases are assessed.
- [OPENNESS.md](OPENNESS.md) — USASI rubric v0.1: checklists, statuses, and tiers.
- [CONTENT_REVIEW.md](CONTENT_REVIEW.md) — the internal queue: unresolved candidates, evidence gaps, and editorial calls to revisit.

## The tip link

Support Us appears above the footer on every page. It stays honest when nothing
is configured ("Tips will be available here soon." and no payment link).

To enable tips, edit **`lib/site-config.ts`** → `RAW_CONFIG.support`:

```ts
support: {
  enabled: true,
  // …
  tipUrl: "https://<your hosted tip page>",   // https only; validated at build time
  providerLabel: "<Provider name>",
  amountLinks: [],                           // only with a distinct, working URL per amount
  contactUrl: null,
},
```

The build rejects non-https, `javascript:`, `data:`, credential-bearing, and
malformed URLs, and rejects amount links without a general tip URL. The site
never processes payments, loads provider scripts, or stores anything about
supporters: the button is an ordinary outbound link. Update the Privacy and
Support pages if your provider or arrangement changes.

Set `repository.url` in the same file (`https://github.com/<owner>/<repo>`) to
turn on **Report a correction**, **Edit this entry**, and contribution links.
Until then those actions explain that the repository is not yet available.

## Images

The supplied artwork is kept byte-for-byte in `assets/original/USA SUPER LOGO.png`
(SHA-256 recorded in `THIRD_PARTY_NOTICES.md`). No text-free version was
supplied, so the homepage shows the branded artwork intact with the live heading,
search, and actions beneath it.

`npm run prepare:images` regenerates, from that original:

- `public/images/hero/hero-{640,960,1280,1672}.{avif,webp,jpg}` — responsive
  derivatives (downscale only; 1672 px is the native width),
- `public/hero.png` — an identical copy at a stable URL,
- `public/og.png` — 1200×630 social image,
- `app/apple-icon.png` — from `app/icon.svg`.

If you later supply a text-free version of the artwork, place it next to the
original and update `components/Hero.tsx` to layer live HTML branding over it;
do not crop or regenerate the branded original.

## Deployment

The same static build deploys anywhere. Nothing here deploys automatically:
each workflow does nothing until you opt in.

### Cloudflare Workers (primary)

The site is an assets-only Worker (`wrangler.jsonc`): no Worker script runs, so
requests are served from Cloudflare's static asset storage.

- `public/_headers` sets strict security headers (CSP with `frame-ancestors
  'none'`, HSTS, `nosniff`, `X-Frame-Options`, Referrer-Policy,
  Permissions-Policy, COOP), immutable caching for hashed assets, and CORS on
  `/data/*` so others can use the open catalog export.
- Every HTML page also carries a `<meta>` Content-Security-Policy whose
  `script-src` lists SHA-256 hashes of that page's own inline scripts, so only
  the site's scripts can run (added by `scripts/postbuild.mjs`).
- `not_found_handling: "404-page"` serves the styled `404.html` with a real 404
  status; `html_handling: "auto-trailing-slash"` redirects `/companies` →
  `/companies/` (307).
- Cloudflare compresses responses (Brotli) automatically.

Manual deploy from your machine:

```bash
npm run build
npx wrangler login      # opens Cloudflare in your browser
npm run deploy:cloudflare
```

CI deploy: `.github/workflows/deploy-cloudflare.yml` deploys `main` and uploads
a preview version for each same-repository pull request, once you set the
repository variable `CLOUDFLARE_DEPLOY=true` and the secrets
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Alternatively, connect the
repository in the Cloudflare dashboard (Workers Builds) with build command
`npm run build` and deploy command `npx wrangler deploy`.

Custom domain, www redirect, and zone settings: see `SETUP_REQUIRED.md`.

### Vercel

Vercel detects `output: "export"` and serves `out/`. Import the repository with
the Next.js preset (build command `npm run build`, output directory `out`), set
`NEXT_PUBLIC_SITE_URL` to your production origin, and leave
`NEXT_PUBLIC_BASE_PATH` empty. `public/_headers` is ignored on Vercel; copy the
headers into `vercel.json` if you need them there (the per-page CSP `<meta>`
still applies).

### GitHub Pages

`.github/workflows/deploy-pages.yml` builds and deploys once you enable Pages
with source "GitHub Actions" and set `GITHUB_PAGES_DEPLOY=true`. For a custom
domain, leave `PAGES_BASE_PATH` empty; for `https://<owner>.github.io/<repo>/`
set `PAGES_BASE_PATH=/<repo>` and `PAGES_SITE_URL=https://<owner>.github.io`.
`public/.nojekyll` is included. GitHub Pages serves `404.html` for unknown paths
and `index.html` for directory URLs; `_headers` is ignored there.

### Static-hosting behavior (all hosts)

- `trailingSlash: true`: every page is `<route>/index.html`, so deep links and
  refreshes work on any static server.
- Asset and page URLs honor `NEXT_PUBLIC_BASE_PATH` (tested by
  `npm run test:basepath`).
- `sitemap.xml`, `robots.txt`, canonical URLs, and social metadata use
  `NEXT_PUBLIC_SITE_URL` + base path.
- Visitors never contact source websites to read an entry; a source site being
  down never affects the build.

## Licenses

- Code: MIT ([LICENSE](LICENSE)).
- Original catalog prose: CC BY 4.0 ([CONTENT_LICENSE.md](CONTENT_LICENSE.md)).
- Artwork: owner's, not licensed for reuse; fonts: SIL OFL 1.1; third-party names
  and marks belong to their owners ([THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)).
