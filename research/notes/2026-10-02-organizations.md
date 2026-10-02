# Organizations batch — 2026-10-02

Researcher notes for the applied-AI, model/agent-builder, and research/evaluation
nonprofit candidates. All dates use 2026-10-02. Requests used WebFetch or curl with
the generic User-Agent `USASI-catalog-research/0.3`; no personal identifiers were
sent. Two sites returned bot checks (pi.ai: Cloudflare challenge; businesswire.com:
HTTP 403); neither was bypassed and neither is cited.

Method notes:

- Several official sites render client-side, so WebFetch returned no text (anduril.com,
  parts of abridge.com, shield.ai legal pages). For those, the page HTML was fetched
  with curl and the server-embedded text was read; the cited URL is the page itself.
- Shield AI press-release text was read through its public WordPress JSON API
  (`/wp-json/wp/v2/posts`); the individual post URLs are cited.
- Job-board locations were read from public ATS APIs (Ashby, Greenhouse, Lever); the
  API URL is cited where a claim depends on it.
- GitHub release dates were confirmed with the GitHub REST API, because the rendered
  releases page omits the year (WebFetch guessed "2024" for Vet; the API shows 2026).
- IRS exempt-organization status for METR, FAR.AI, and Epoch AI comes from the IRS
  EO BMF California extract (`eo_ca.csv`), matched by EIN or name and address. Asset
  and revenue columns in that file were ignored.

## Files created

Organizations (12): `metr`, `far-ai`, `epoch-ai`, `harvey`, `abridge`, `anduril`,
`imbue`, `contextual-ai`, `inflection-ai`, `reka` (published); `shield-ai`, `magic`
(draft, pending_review).

Artifacts (8, all published): `hawk` (METR), `epoch-ai-models` (Epoch AI),
`harvey-lab` (Harvey), `vet` (Imbue), `reka-flash` + `reka-flash-3-1` (Reka),
`contextual-reranker` + `contextual-reranker-v2-2b` (Contextual AI).

`npx tsx scripts/validate.ts` (also `--strict`): 0 errors, no warnings in these files.

## Per candidate

### anduril — published
- Basis: us-headquarters. The Lattice SDK license agreement (raw LICENSE in
  anduril/lattice-sdk-python) says Anduril Industries, Inc. is organized under Delaware
  law with its principal place of business at 1400 Anduril, Costa Mesa, CA; the careers
  page calls Costa Mesa "Anduril HQ". Investor-relations page says it is privately owned.
- Products described only as documented, in neutral terms: Lattice for Command & Control
  (Anduril calls it an AI-enabled battle management platform), Lattice for Mission
  Autonomy, Lattice SDK. No contracts, programs, weapons details, or customer names used.
- Foreign units (Anduril Australia Pty Limited, UK, Japan, Korea, Taiwan, Ireland,
  Finland) recorded as other locations.
- No artifact: the Lattice SDK repositories use Anduril's proprietary SDK license
  (no modification/redistribution), so they are not open-source software records.
- Open: founding year not taken from an official page.

### shield-ai — draft (pending_review, basis undetermined)
- Latest official headquarters statement found is in 2021–2022 press releases ("headquartered
  in San Diego, CA"). 2025 boilerplate lists offices (San Diego, Dallas, Washington DC,
  Boston, Abu Dhabi, Kyiv, Melbourne, Oslo) without naming HQ; the September 2026
  boilerplate names no HQ. Privacy/contact pages give no entity or address. Lever board
  lists most roles in U.S. cities.
- Very likely U.S.-headquartered, but no current official statement; needs a terms page,
  filing, or state registry record to publish. Should be added to CONTENT_REVIEW.md
  (not edited here per file-ownership rules).

### harvey — published
- Basis: us-headquarters. Privacy policy (2026-07-13) names Harvey AI Corporation, 201 3rd
  St, Suite 500, San Francisco, and Harvey AI Ireland Limited (Dublin) as EU subsidiary.
- `ownership_category: privately-held` was confirmed from Harvey's September 2026
  financing announcement, but that source is not cited because its URL slug contains
  funding and valuation figures. A reviewer may prefer `unknown` or another source.
- Artifact: Harvey LAB (Legal Agent Benchmark), MIT, repo harveyai/harvey-labs. Counts of
  tasks/criteria deliberately omitted (README badge and blog give different numbers). The
  tutorial says matter documents are synthetic; recorded as a limitation.

### abridge — published
- Basis: us-headquarters. Privacy policy (2026-08-27) names Abridge AI, Inc., states "We are
  headquartered in the United States," and gives a Philadelphia PMB mailing address.
  Ashby board lists SF, NYC, and Chicago offices; August 2026 press release has an SF
  dateline. Headquarters city not stated officially (third-party sites say Pittsburgh;
  not used). HQ label therefore says "United States".
- Healthcare products described as documented (draft notes for clinician/nurse review).
  No outcome statistics, customer names, or the VA contract used.
- Open: ownership category left `unknown`; no artifacts (none found).

### hippocratic-ai — not created
- No official page reviewed names the legal entity, an address, or a headquarters
  (privacy policy dated 2023-09-13 has none; about/careers/contact pages have none).
  Its press releases are on Business Wire, which returned 403 to automated access.
  Revisit with a terms page, filing, or a press release hosted on its own site.

### inflection-ai — published
- Basis: us-headquarters. Terms of service (2025-12-22) name Inflection AI, Inc. at a San
  Francisco PMB address, California law, Santa Clara County venue. Company calls itself a
  public benefit corporation (July 2026 post).
- Product: Pi (assistant-app). pi.ai is behind a Cloudflare challenge, so the product URL
  points to inflection.ai, which describes Pi and links to it.
- Leadership history (2024) deliberately not recorded. No open releases found.

### magic — draft (pending_review, basis undetermined)
- Only evidence: footer "Magic AI, Inc." and job listings marked "SF". No terms, privacy
  policy, address, or HQ statement on magic.dev. No public product or model release.
- Homepage includes funding figures; not used.

### imbue — published
- Basis: us-headquarters. Website terms (2026-07-06) and privacy notice name Imbue, Inc.;
  California law, San Francisco courts; careers page: "our office in San Francisco".
  No street address or state of incorporation found.
- Artifact: Vet (AGPL-3.0-only; PyPI verify-everything, author Imbue). Sculptor and mngr are
  MIT per their product pages and are listed as products only.

### contextual-ai — published
- Basis: us-headquarters. Privacy policy (2026-02-25): Contextual AI, Inc., 150 W Evelyn Ave,
  Suite 200, Mountain View, CA. Terms: California law, notices to "our headquarters".
- Artifacts: Reranker family + v2 2B release. License CC BY-NC-SA 4.0 (noncommercial).
  Base checkpoint undisclosed; config.json declares Qwen3ForCausalLM, recorded as
  architecture only, without inferring derivation. Training data/method undocumented.
- Open: Contextual also publishes older Apache-2.0 research checkpoints (Archangel, KTO)
  built on Llama/Pythia/Mistral; LMUnit checkpoints are fine-tunes of Qwen2.5-72B and
  Llama-3.1-70B. Not catalogued.

### reka — published (HQ verified)
- Basis: us-headquarters. Privacy policy (effective June 2026) covers Reka AI, Inc. and its
  subsidiaries and says "We are headquartered in the United States"; terms (September
  2026) name Reka AI, Inc. at a Sunnyvale PMB address; June 2026 announcement says
  "headquartered in San Francisco".
- Ambiguity: privacy policy lists "our corporate parent" among data recipients without
  naming one. Treated as template wording; no parent found. Flag for reviewer.
- Material change: June 2026 announcement says Reka "joined forces with Moonvalley"
  (called a merger; Moonvalley team joined Reka). Recorded as a notable fact; Reka remains
  the operating entity. Individual names in that post not recorded.
- Artifacts: Reka Flash family + Reka Flash 3.1 (Apache-2.0, 21B; Flash 3 "pretrained from
  scratch" per Reka). Reka Edge 2603 has a custom license; not catalogued.

### metr — published
- Basis: us-nonprofit-or-lab. Donate page: Model Evaluation and Threat Research, Inc., EIN
  99-1219864, Covina CA mailing address; IRS CA extract lists that EIN as 501(c)(3).
  Careers: all roles on-site in Berkeley, CA (used as HQ label).
- Artifact: Inspect-Hawk (MIT, copyright METR 2026). Vivaria marked deprecated on GitHub.
- Open: founding year not on pages reviewed.

### far-ai — published
- Basis: us-nonprofit-or-lab. Privacy policy: FAR AI, Inc., 501(c)(3), 501 W Broadway Suite
  1540, San Diego; IRS CA extract matches (EIN 92-0692207, same as transparency page).
  Transparency page: incorporated October 2022; previously fiscally sponsored by Players
  Philanthropy Fund. FAR.Labs coworking space in Berkeley.
- HQ label uses the San Diego address of record; no page calls a city its headquarters.
- No artifact: GitHub (AlignmentResearch) repos mostly lack license files in the listing.

### epoch-ai — published (U.S. entity verified)
- Basis: us-nonprofit-or-lab. Privacy notice (2025-01-18): Epoch Artificial Intelligence,
  Inc., 28 Geary St Suite 650, San Francisco. IRS CA extract lists it as 501(c)(3).
  Consulting terms: nonprofit, California law, Alameda County venue.
- Open: where staff work is not stated; any earlier fiscal sponsorship not documented on
  pages reviewed.
- Artifact: Data on AI Models dataset, CC BY 4.0 (license link confirmed in page HTML).
  Model counts in the dataset deliberately omitted.

## Surprising or ambiguous

- Reka's Moonvalley merger (June 2026) and the unnamed "corporate parent" phrase.
- Several organizations publish only PMB/mailbox addresses (Inflection, Reka, Abridge,
  METR, Epoch); records say so rather than presenting them as offices.
- Shield AI stopped naming a headquarters in its boilerplate after 2022.
- CONTENT_REVIEW.md was not edited (outside assignment); `shield-ai` and `magic` should be
  listed there by the owner.
