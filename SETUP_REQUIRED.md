# Setup required before launch

Everything below needs a decision, an account, or access that only the site
owner has. The site builds and works without any of it; each missing item is
shown honestly on the site rather than faked.

Nothing has been deployed, no DNS has been changed, and no accounts have been
created.

## 1. Source repository

Configured: `https://github.com/usasihq/Website` (public). "Edit this entry",
"Report a correction", and entry-request links point there. Commits in this
repository use the USASI identity
(`USASI <335780783+usasihq@users.noreply.github.com>`, set in the repository's
local git config), keeping the owner's personal GitHub account out of the history.

- [ ] Confirm Issues are enabled (they are by default) so the forms in
      `.github/ISSUE_TEMPLATE/` work.
- [ ] Set `RAW_CONFIG.repository.url` in `lib/site-config.ts` to
      `https://github.com/<owner>/<repo>` (and `branch` if not `main`).
- [ ] Enable Issues so the forms in `.github/ISSUE_TEMPLATE/` work.

Email (usasihq@gmail.com) remains available on `/about/` and `/contribute/`
for people without a GitHub account.

## 2. Tip link (Support Us)

- [ ] Choose a tip/payment provider and create your own hosted tip page there.
- [ ] Set `RAW_CONFIG.support.tipUrl` (https only) and `providerLabel` in
      `lib/site-config.ts`. Optional: `amountLinks` — only if the provider gives
      you a separate, working URL for each amount; `contactUrl` (https or mailto).
- [ ] Re-read `/support/` and `/privacy/` (`content/pages/support.mdx`,
      `content/pages/privacy.mdx`) and adjust anything your provider's terms
      make inaccurate.

Configured: `https://buymeacoffee.com/usasi` (Buy Me a Coffee). Every page's
Support Us panel links there, and `/support/` shows a QR code generated at build
time from the same URL (verified to decode to it). No amount links are set,
because Buy Me a Coffee amount parameters have not been verified.

## 3. Cloudflare hosting and the domain

Done: the site is live at **https://unitedstatesofamericasuperintelligence.com**
(and `www.`), served by the `usasi` Worker (static assets only) with valid
certificates, the security headers from `public/_headers`, and Brotli
compression. The account's `workers.dev` address and preview URLs are disabled.
Deploys are run with Wrangler (`npm run build && npm run deploy:cloudflare`)
from a machine signed in with `npx wrangler login`.

Remaining owner steps in the Cloudflare dashboard:

- [ ] **Always Use HTTPS**: your domain → SSL/TLS → Edge Certificates → On. Until
      then, `http://` pages load without upgrading to HTTPS (HSTS only takes
      effect after a visitor's first HTTPS visit).
- [ ] Optional: Rules → Redirect Rules → "Redirect from WWW to root" (301). Both
      addresses already serve the site; canonical URLs point to the apex.
- [ ] Keep **Rocket Loader**, **Email Address Obfuscation**, and **Web Analytics
      automatic setup** off (verified off at launch): they inject scripts, which
      the per-page CSP blocks, and analytics would contradict the Privacy page.
- [ ] Optional: automatic deploys from GitHub (see README). Not needed for the
      Local corner, which rotates in the browser.
- [ ] Optional, later: HSTS preload once HTTPS is enforced everywhere.

## 4. Ownership and contact details

Configured in `lib/site-config.ts` (`contact`, `socials`) and shown in the
footer, on `/about/#contact`, in `/.well-known/security.txt`, and in the
homepage's structured data:

- Email: usasihq@gmail.com
- GitHub `usasihq`, Hugging Face `usasihq`, X `@usasihq`, YouTube `@USASIHQ`
- Bluesky `@usasihq.bsky.social`, Truth Social `@Usasihq` (the Truth Social
  profile could not be checked automatically — its site requires a bot
  verification step — so confirm the link opens your profile).

- [ ] `/about/` still says further ownership details have not been published.
      Edit `content/pages/about.mdx` ("Ownership") if you want to add them.
- [ ] `public/.well-known/security.txt` expires 2027-09-29; renew it yearly.
- [ ] `LICENSE` names "USASI contributors" as the copyright holder. Replace it
      with your name or entity if you prefer.

## 5. Local corner

- [ ] The corner profiles real people using public professional information
      only, and says on the page that removal requests are honored. Be ready to
      act on requests sent to usasihq@gmail.com (set the profile to `draft` or
      delete it, then rebuild).
- [ ] Recommended: let featured people know before or when they appear, and
      invite corrections. Opt-in is kinder than surprise.
- [ ] Nothing needed for rotation: the lineup changes in visitors' browsers on
      the 1st of each month. Rebuild only when profiles or lineups change.
- [ ] Optional: set explicit lineups per month in `content/local-corner.yml`.

## 6. Artwork rights

- [ ] Confirm you hold the rights to the supplied artwork
      (`assets/original/USA SUPER LOGO.png`). It is marked "all rights reserved,
      owner's" in `CONTENT_LICENSE.md` and `THIRD_PARTY_NOTICES.md`.
- [ ] Optional: supply a text-free version of the artwork if you want live HTML
      lettering over the image (see README → Images).

## 7. Editorial decisions waiting for you

See `CONTENT_REVIEW.md` for the full queue. The items that need an owner
decision (not just more research) are listed at its top.

## 8. Environment notes

- Node.js 22 is required; ≥ 22.13 is recommended. The machine used to build
  this had Node 22.11, which is why Vitest 4 / Vite 6 and ESLint 9 are pinned.
  (ESLint 9.39 is marked end-of-life upstream; ESLint 10 needs Node ≥ 22.13.)
- Playwright's Chromium is installed in CI with `npx playwright install --with-deps chromium`.
