# Round 3: AI infrastructure group (2026-10-01)

Validation: `npx tsx scripts/validate.ts` reports 0 errors. The only 2 warnings are in other agents' files (vercel, continue-extension).

## How I gathered evidence

- **SEC filings (Arista, CoreWeave):** EDGAR blocks curl that uses a generic User-Agent. I read the filings with WebFetch and in the browser pane, searching the page text with JavaScript. I sent no personal data in any request.
- **Company pages:** read with curl (UA `USASI-catalog-research/0.3`) or WebFetch.
- **GitHub metadata for wandb:** read through `gh api`. The anonymous API was rate-limited.

## Decisions

| Slug | Decision | Basis | HQ (source) |
| --- | --- | --- | --- |
| crusoe | published | us-headquarters | Denver, CO (legal center: current recruiting privacy notice says "headquartered in Denver, Colorado") |
| arista-networks | published | us-headquarters | Santa Clara, CA (10-K FY2025 and 10-Q Q2 2026 cover pages) |
| etched | published | us-headquarters | San Jose, CA (site footer "Etched HQ"; privacy notice: Etched, Inc., Delaware corp.) |
| d-matrix | published | us-headquarters | Santa Clara, CA (terms of use entity and address; contact page; press datelines) |
| lightmatter | published | us-headquarters | Mountain View, CA (about and contact pages say "Mountain View (HQ)") |
| sifive | published | us-headquarters | Santa Clara, CA (locations page "Headquarters"; terms notice address) |
| weights-and-biases | published | us-control | San Francisco, CA (MSA principal place of business); parent `coreweave` (subsidiary) |
| wandb-sdk (artifact) | published | us-governed-project | MIT license read from the raw LICENSE file; PyPI shows the same license |

## Per-candidate notes and gaps

**Crusoe**
- The HQ wording differs across sources.
  - The legal center says Denver. The 2021 Denver-HQ press page has been re-dated "August 18, 2026" on the site, so I did not cite it.
  - Recent releases are datelined San Francisco.
  - Third-party sites say "dual HQ Denver/San Francisco".
- Both cities are in the U.S., so eligibility does not change. Denver is recorded as HQ and San Francisco as an office.
- The legal name is left null because the company's own pages name different entities:
  - Crusoe Technologies LLC (current cloud terms of service and recruiting notice)
  - Crusoe Energy Systems LLC (website privacy notice)
  - "Crusoe, Inc" (site footer)
- Data-center power and size figures were omitted.

**Arista**
- Products are limited to the AI items that the 10-K and the product pages document: Etherlink, the 7800R4, and the 7700R4 DES.
- `founded` is null. The about page says "founded and incorporated in 2008" but also describes 2004 roots as Arastra. The 10-K text I searched gives no year.
- The VeloCloud acquisition (closed June 30, 2025) is recorded without the price.

**Etched — surprising**
- The current site no longer uses the name "Sohu" or the phrase "transformer-only".
- It now describes rack-scale "frontier inference clusters" with A0 silicon on TSMC N4P. Etched says it shipped its first rack in August 2026.
- The record follows the current site. The "transformer ASIC" framing in the assignment comes from older coverage.
- `founded` is null because no official page states a year.
- The site carries prominent funding and valuation claims. They were excluded.

**d-Matrix**
- The site uses three entity names: "d-Matrix Corporation" (terms), "d-Matrix Corp." (privacy policy), and "© d-Matrix, Inc." (footer). The legal name is null.
- The site does not say "headquarters" anywhere. HQ rests on the terms-of-use entity and address, which follows ELIGIBILITY.md, and on the Santa Clara datelines.
- EDGAR has only an unrelated SPV Form D under the d-Matrix name, so I did not use it.

**Lightmatter**
- The HQ is now Mountain View.
- Older legal pages (terms effective 2022, privacy policy effective 2024) give Boston addresses. This is noted in the eligibility explanation.

**SiFive**
- I used SiFive's own pages only. I did not cite the funding press release.
- Processor IP is recorded as product kind `hardware`, and the access text says it is licensable IP. A reviewer may prefer `other`.

**Weights & Biases — material change**
- CoreWeave's 10-K note 4 says CoreWeave acquired all outstanding equity interests of Weights and Biases, Inc. on May 5, 2025.
- On **2026-09-30** CoreWeave launched **CoreWeave Forge**. W&B SaaS sign-in moved to id.coreweave.com, wandb.ai pages are moving to coreweave.com in phases, and docs.wandb.ai now redirects to docs.coreweave.com.
- The current MSA (updated 2026-09-30) names **Weights and Biases, LLC**, a Delaware LLC at 400 Alabama St, San Francisco. The entity apparently converted from Inc. to LLC. I did not find a document stating the conversion, so I only report what each source says.
- I kept W&B as a separate subsidiary record because the entity, the brand, the MSA, and the wandb repo continue.
- Revisit if W&B is fully folded into CoreWeave Forge. The website URL may change.
- I did not edit `coreweave.yml`. It still lists "Weights & Biases" as a product with a wandb.ai URL and does not mention Forge. That record's owner should update it.

**wandb-sdk**
- Version 0.30.0 (PyPI, 2026-09-09). MIT license, code only.
- The W&B server/platform is commercial and is not covered by the license.
- `coreweave` is included in `organization_slugs` as the parent and docs publisher. It is not listed as a maintainer.
