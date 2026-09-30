# Research notes: r2-giants-platform

Reviewed 2026-09-29. `npx tsx scripts/validate.ts` reports no errors or warnings in this group's files. The one remaining error is in `artifacts/slimpajama.yml`, which belongs to another group.

## Organizations

| Slug | Decision | Basis | Reason |
| --- | --- | --- | --- |
| spacex | published | us-headquarters | The Q2 2026 10-Q and the 8-K of 2026-08-14 list a Texas corporation at 1 Rocket Road, Starbase, TX. |
| cloudflare | published | us-headquarters | The FY2025 10-K and the Q2 2026 10-Q list a Delaware corporation at 101 Townsend St, San Francisco. |
| servicenow | published | us-headquarters | The FY2025 10-K lists a Delaware corporation at 2225 Lawson Lane, Santa Clara. An April 2026 press release says "Based in Santa Clara". |
| linkedin | published | us-control | Microsoft completed the acquisition on 2016-12-08 (LinkedIn pressroom). Microsoft's FY2026 10-K Exhibit 21 lists LinkedIn Corporation (United States). parent: microsoft / subsidiary. |

**Edited existing file:** `content/organizations/xai.yml`. Only `parent_org_slug: spacex` and `parent_relationship: subsidiary` changed; the diff was checked. **Follow-up for the xai owner or an editor:** xai's `status_note` still ends with "SpaceX has no record in this catalog, so no parent link is shown." That sentence is now stale. I did not change it because my assignment allowed only the parent fields.

### spacex
- **Material changes, from filings:**
  - SpaceX completed its acquisition of X.AI Holdings Corp. on 2026-02-02 (10-Q).
  - Its IPO completed in June 2026, and the stock trades on Nasdaq as SPCX (10-Q).
  - It completed its acquisition of Anysphere, Inc. (Cursor) on 2026-08-14, and Anysphere is now a wholly owned subsidiary (8-K, Item 2.01). **This affects the `anysphere` record owned by another group.**
- **AI role:** SpaceX reports three segments: Space, Connectivity, and AI. The AI segment covers Grok, AI solutions, X, and AI compute infrastructure. The Q2 release says SpaceX entered cloud services agreements to provide compute capacity and continued the Colossus II build-out. I left out the power figures (GW), revenue, and the deal value.
- **Products:** left empty on purpose. The Grok products are already on the `xai` record, and listing them twice would double-count them in /matrix. Cursor belongs to `anysphere`.
- **Gaps:**
  - sec.gov blocks curl with a generic User-Agent (403). The 424B4 prospectus is larger than the WebFetch limit, so I did not re-verify the Palo Alto "AI HQ" claim that `xai` makes. It is not used in my record.
  - spacex.com renders empty for WebFetch. The founding year (2002) comes from the "About SpaceX" text in the Q2 earnings release (EX-99.1).

### cloudflare
- **Replicate:** the acquisition is verified as completed. The 10-K Business Combinations note (R21) says Cloudflare acquired all outstanding shares of Replicate on 2025-12-01. The deal was announced 2025-11-17. replicate.com still operates under its own brand. I recorded it as a product and left out the purchase price.
- **Products:** Workers AI, AI Gateway, and Replicate, each checked against docs or pages I fetched.
- **Gap:** `founded: 2009` is based on the 10-K statement "incorporated in Delaware in July 2009". That is the incorporation year, not necessarily the founding year.

### servicenow
- **Blocked pages:** servicenow.com product pages returned 403 (WebFetch) or hung (curl). The product URLs therefore point to ServiceNow newsroom press releases from 2026-04-09 and 2026-05-05, which I did read. An editor may want to swap in product-page URLs.
- **Not included:**
  - Now Assist is not listed as a product because I had no fetchable official page for it. It is mentioned in notable_facts through the 10-K.
  - The founding year is not in the 10-K text I read, so `founded` is null.
- **Notable facts:**
  - BigCode co-stewardship, from the StarCoder2 report.
  - ServiceNow trained StarCoder2-3B, from the HF blog.
  - Fast-LLM, which is Apache 2.0 and made by ServiceNow AI Research.
  - The Moveworks acquisition, from the 10-K.

### linkedin
- **Headquarters:** Sunnyvale, CA comes from LinkedIn's legal-notice mailing address page (LinkedIn Corporation, 1000 W. Maude Ave). That page does not use the word "headquarters", so this is weaker evidence, similar to the linux-foundation case. The pressroom About page lists Sunnyvale among its U.S. offices. LinkedIn Ireland Unlimited Company is the controller for the EU, EEA, and Switzerland.
- **Scope:** as assigned, the record covers only open-source AI work (Liger Kernel). There are no products, and sectors is empty.

## Artifacts

| Slug | Decision | License(s) | Notes |
| --- | --- | --- | --- |
| apriel (family) | published | none (family) | Maintained by ServiceNow's SLAM lab. |
| apriel-1-6-15b-thinker | published | MIT (card metadata and License section; no LICENSE file in the repo) | Released 2025-12-09 per the HF blog. |
| superapriel-15b-instruct | published | MIT (weights), Apache-2.0 (Fast-LLM code) | Released 2026-04 per arXiv 2604.19877. training_code is `public`: the paper says the Fast-LLM training code is released, and `fast_llm_external_models/apriel2` exists on main. |
| starcoder2 (family) | published | none (family) | Multi-organization governance assessment written. |
| starcoder2-15b | published | BigCode OpenRAIL-M v1 (custom, spdx null) for weights; Apache-2.0 for repo code | Trained by NVIDIA. nvidia is added to organization_slugs. |
| starcoder2-3b | published | same as starcoder2-15b | Trained by ServiceNow. |
| liger-kernel | published | BSD-2-Clause (LICENSE file, © LinkedIn Corporation) | Latest release v0.8.3 (2026-09-16, per the GitHub releases feed and PyPI). |

### Provenance: foreign base weights (important)

- The Apriel 1.5 report (arXiv 2510.01141) says Apriel-1.5-15b-Thinker started from **Mistral AI's Pixtral-12B-Base-2409**, depth-upscaled from 40 to 48 layers.
- Apriel 1.6 builds on 1.5. SuperApriel inherits its shared weights from 1.6 and keeps a Pixtral vision encoder.
- All three Apriel records put this under `provenance` and state that the base is not treated as U.S.-developed. Eligibility rests on ServiceNow as the maintainer, following the fine-tune rule.
- The Apriel-1.6 model card itself does not mention Pixtral; the link comes only from the 1.5 report.
- I did not verify Mistral AI's country from a legal page (legal.mistral.ai showed no entity or address), so the records say "published by Mistral AI" and nothing more.

### StarCoder2 governance
- The report (arXiv 2402.19173) says BigCode is "stewarded by ServiceNow and Hugging Face". The HF blog says "led jointly by Hugging Face and ServiceNow". bigcode-project.org lists both as supporters.
- Maintainers are recorded as three entries:
  - the BigCode project, with organization_slug null
  - Hugging Face
  - ServiceNow
- The Hugging Face side relies on the existing hugging-face dual-country assessment and on the HF privacy policy, which I re-read today.
- The Stack v2 is gated. Its terms say bulk content download needs an agreement with Software Heritage and Inria, so training_data_information is `partial`.

### Judgment calls to review
- **Apriel-1.6 training_code is `partial`.** Fast-LLM and VERL are public, but I found no release-specific training configurations.
- **SuperApriel training_recipe is `partial`.** The paper is detailed, but I could not confirm that complete configurations are published. If an editor judges it `public`, the tier would still not reach open-stack, because training data is only partial.
- **Evaluation materials are `partial` for every release.** The Apriel 1.5 paper claims its "evaluation protocols" are released under MIT, but that is for 1.5, not the releases I recorded. The BigCode Evaluation Harness is referenced but not confirmed to cover every reported evaluation.
- **StarCoder2-15B memory figure left out.** The card shows 32,251 MB after the bfloat16 example without an explicit precision label, so I kept only the explicitly labeled 8-bit and 4-bit figures. The 3B card labels all four figures, and all four are included.
- **StarCoder2-3B card inconsistency.** Its summary says 17 programming languages, but its Limitations section says 600+. The record uses the summary figure and attributes it to the card. The card also lists the training framework as a placeholder, so I say the card "does not name" it.
- **Apriel-1.6 vLLM custom Docker image.** The card points to a Docker image under an individual's Docker Hub account. The run note mentions "a custom Docker image" without naming the account.

## Not done or out of scope
- Other Apriel releases (Apriel-5B, Apriel-Nemotron-15b-Thinker, Apriel-1.5, AprielGuard, Apriel-H1) and StarCoder2-7B / 15B-Instruct have no release records. They are mentioned in the family summaries.
- The Stack v2 and Fast-LLM could be future `dataset` / `framework` records.
- I did not use GitHub API data: the shared IP was rate-limited. Repo facts come from WebFetch of the GitHub pages, raw files, the releases.atom feed, and PyPI JSON.
