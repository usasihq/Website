# Round 3 — AI developer platforms and model builders (2026-10-01)

Assignment: organizations github, vercel, replit, cartesia, inception-labs, world-labs;
artifacts spec-kit, ai-sdk, plus at most one open artifact for Cartesia or World Labs.
None of these slugs existed before this round. Validator: 0 errors in these files.

## Organizations

| Slug | Decision | Basis | Key evidence |
| --- | --- | --- | --- |
| github | published | us-control (parent `microsoft`, `subsidiary`) | Microsoft blog: acquisition completed 2018-10-26; MSFT FY2026 10-K reports GitHub in the Intelligent Cloud segment; GitHub privacy statement: GitHub, Inc., 88 Colin P. Kelly Jr. St., San Francisco, and Microsoft named as an affiliate; ToS: GitHub, Inc., California law |
| vercel | published | us-headquarters | Vercel blog (Mar 2026): "our new San Francisco headquarters"; Apr 2026 recap; ToS/privacy: Vercel Inc., California address, California law; EDGAR: Delaware corporation, SF business address |
| replit | published | us-headquarters | Careers page: "Foster City HQ"; privacy policy: Replit, Inc., Foster City, CA; ToS: California law |
| cartesia | published | us-headquarters | ToS: Cartesia AI, Inc., 555 De Haro St., San Francisco; California law |
| inception-labs | published | us-headquarters | ToS: INCEPTION AI, INC., 2317 Broadway Ave, Redwood City, CA; privacy policy names Inception AI, Inc. |
| world-labs | published | us-headquarters (pending acquisition in `status_note`) | ToS: World Labs Technologies, Inc., 640 2nd St., San Francisco; AMD press release: "Headquartered in San Francisco" |

## Artifacts

| Slug | Decision | Basis | License |
| --- | --- | --- | --- |
| spec-kit | published (framework) | us-governed-project (GitHub) | MIT (LICENSE: Copyright GitHub, Inc.); SUPPORT.md: maintained by GitHub staff and the community; reviewed v1.0.13 (2026-09-29) |
| ai-sdk | published (framework) | us-governed-project (Vercel) | Apache-2.0 (LICENSE: Copyright 2023 Vercel, Inc.); reviewed ai@7.0.127 (2026-10-01) |
| sparkjs | published (framework), new slug chosen this round | us-governed-project (World Labs) | MIT (LICENSE: Copyright 2025 World Labs Technologies, Inc.); reviewed v2.3.1 (2026-10-01) |

`sparkjs` = World Labs' Spark 3D Gaussian splatting renderer (github.com/sparkjsdev/spark,
sparkjs.dev). I used `sparkjs` rather than `spark` to avoid confusion with Apache Spark.
I chose it over a Cartesia artifact because it is actively released, its ownership is clear
(README "Built by World Labs" plus a World Labs copyright line), and it has a plain MIT license.
Cartesia candidates not created: `edge` (Apache-2.0, last updated February 2025, bundles Llamba
weights distilled from Llama-3.x, so provenance is more complicated) and the Line SDK (Apache-2.0).

## Material changes and surprises

- **World Labs / AMD.** AMD announced a definitive agreement to acquire World Labs on
  2026-09-28, expected to close by the end of 2026 subject to regulatory approvals. I recorded
  it as pending in `status_note`. The record stays `privately-held` with no parent, per
  ELIGIBILITY.md. Reassess when the acquisition closes (likely `amd` parent, `subsidiary` or
  `research-unit`). The deal value is deliberately left out.
- **GitHub Models was retired** on 2026-07-30 according to GitHub Docs, so it is not listed as a
  product. It is recorded as a notable fact.
- **GitHub is absent from Exhibit 21** of Microsoft's FY2026 10-K, which lists only selected
  subsidiaries. Parent evidence instead rests on the 2018 completion announcement, the 10-K
  segment description, and GitHub's privacy statement. The `parent_evidence` claim says this.
- I left out the 2025 news reports that GitHub moved into Microsoft's CoreAI group. They are
  third-party news tied to a leadership change, and I found no official org-structure page.
- **Inception's exact name** is Inception AI, Inc., based in Redwood City, CA. "Inception Labs"
  is only the domain and brand (inceptionlabs.ai). The GitHub org `inception-labs` belongs to an
  unrelated Milwaukee health organization with a different verified domain (inceptionlabs.org).
  No Inception models appear on Hugging Face (the API query for author `inceptionlabs` returned
  nothing). Some Inception blog pages showed today's date as the post date, so I cited none of
  those dates.
- **Vercel's address:** the current ToS and privacy policy give a Covina, CA mailbox. The SF
  headquarters comes from Vercel's own 2026 blog posts. The EDGAR record (Delaware, SF business
  address) dates from a 2021 Form D. No funding data was used.
- **Cartesia:** Llamba-8B's model card says Apache-2.0, but the Llamba paper says the models are
  distilled from Llama-3.x. I did not assess how the Llama license affects them; the record gives
  both facts. The H-Net checkpoints on Hugging Face have no model card or license field, so they
  are not mentioned.
- **Replit** published replit-code-v1-3b (weights CC BY-SA 4.0, code Apache 2.0) and
  replit-code-v1_5-3b (Apache 2.0). Both are mentioned only in notable facts and the openness
  summary.
- **SEC fetching:** sec.gov rejects the generic UA through curl, so I read the filings with
  WebFetch. No personal identifiers were sent.

## Evidence gaps / open questions

- Founding years were not given on the official pages I fetched, so `founded` is null for all six.
- GitHub: no official page says "wholly owned subsidiary" in so many words. The basis is the
  completed acquisition plus current 10-K reporting.
- Cartesia and World Labs: state of incorporation was not documented, so `legal_form` is null.
- Replit: the pricing page lists paid Core, Pro, and Enterprise plans but no free tier, so the
  record does not claim one.
- hiring_url is set only where I fetched the careers page (vercel, replit). No `careers` feed
  blocks were added.
