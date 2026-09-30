# Research notes: enterprise-1

Reviewed 2026-09-29. All cited pages were fetched that day. `npx tsx scripts/validate.ts` reports no errors or
warnings in this group's files. The 4 errors it does report are `olmo*.yml` → unknown `dolma`, which belong to
another group.

## Process incident (privacy)

Early in the session I sent about ten `curl` requests to `www.sec.gov`, `data.sec.gov` and `efts.sec.gov` with a
User-Agent header that contained the user's email address. That broke the privacy rule. After the coordinator
flagged it, every later request used WebFetch or a generic User-Agent. Every SEC filing cited in the records was
also opened with WebFetch.

## Organizations

| Slug | Decision | Basis | Reason |
| --- | --- | --- | --- |
| palantir | published | us-headquarters | FY2025 10-K and Q2 2026 10-Q list principal executive offices at 19505 Biscayne Blvd., Aventura, FL |
| snowflake | published | us-headquarters | FY2026 10-K and Q2 FY2027 10-Q list 135 Constitution Dr., Menlo Park, CA |
| databricks | published | us-headquarters | About page: "Headquartered in San Francisco" |
| scale-ai | published | us-headquarters | About page: "Headquarters: San Francisco, CA" |
| perplexity | published | us-headquarters | 2023 SEC Form D (principal place of business in San Francisco, Delaware corp.) plus GSA eLibrary contractor listing (San Francisco address) |
| salesforce | published | us-headquarters | FY2026 10-K and Q2 FY2027 10-Q: Salesforce Tower, San Francisco |
| adobe | published | us-headquarters | FY2025 10-K: principal executive offices and "corporate headquarters" in San Jose, CA; Q3 2026 10-Q confirms |

### Material changes and HQ wording (recorded as the sources state them)

- **Palantir**: moved from Denver to Aventura, Florida. The FY2025 10-K cover (filed 2026-02-17) lists Aventura, gives
  "518 17th Street, Denver" as the former address, and Item 2 says Denver "was the location of our corporate
  headquarters". Recorded in `status_note`. News reports describe the Aventura address as a co-working space. I did
  not cite that and did not include it.
- **Snowflake**: the FY2025 10-K and every 10-Q through the quarter ended 2025-10-31 say "a globally distributed
  workforce and no corporate headquarters" and designate Bozeman, MT as the principal executive office for SEC
  purposes. The FY2026 10-K (filed 2026-03-20) and later filings list Menlo Park and drop the no-HQ footnote. The HQ
  label reads "Menlo Park, California (designated principal executive office)" and the history is in `status_note`.
  The FY2026 10-K never uses the word "headquarters" for Menlo Park.
- **Scale AI**: the June 12, 2025 official post calls it a "significant new investment" from Meta. It says Meta
  "will hold a minority of Scale's outstanding equity", that Scale "remains an independent" company, and that Wang
  joined Meta while staying a Scale board director. Recorded without percentages or valuation. The About page now
  also announces Francis deSouza as CEO. I left that out of the record because the brief says not to add staff
  claims. Ownership is set to `privately-held` with no parent.
- **Snowflake product naming**: the docs URL for Snowflake Intelligence now redirects to "Snowflake CoWork". The iOS
  app is still listed as "Snowflake Intelligence", and the March 2026 10-K uses "Snowflake Intelligence". The record
  uses CoWork and does not claim an official rename.
- **Salesforce**: the 10-K now calls its platform "Agentforce 360 Platform", and Data Cloud is now "Data 360
  (Formerly Data Cloud)" per the official page title.

### Evidence gaps and open questions

- **Perplexity**: perplexity.ai returned HTTP 403 to every fetch (homepage, about, terms, privacy, careers, Comet),
  so there is no first-party HQ source. The HQ claim rests on government records: a 2023 Form D and the GSA
  eLibrary. The two give different SF street addresses (341 Moultrie St. vs 181 Fremont St.); only the city is
  recorded. `hiring_url` is null because perplexity.ai/careers returned 403. Comet is not listed as a product
  because I could not fetch its page. Worth rechecking from a browser.
- **Databricks**: `ownership_category: privately-held` has no first-party source. News says it was still private as
  of mid-2026, and no S-1 was found. `legal_name` is null because it was not verified.
- **Scale AI**: `legal_name` is null because it was not verified.
- **Adobe**: Firefly (the app) uses product kind `other` because it is a generative creative app, not an assistant.
  Firefly Services (the API) is `hosted-model-api`.
- **Palantir**: the product pages (platforms/aip, foundry, gotham) render with JavaScript, so WebFetch got only their
  titles. The product claims cite the 10-K and the AIP docs page instead. The `defense` sector rests on 10-K
  language about Gotham and "allied defense and intelligence operations".

## Artifacts

| Slug | Level | Decision | Notes |
| --- | --- | --- | --- |
| dbrx | family | archived | Historical. Official distributions removed and DBRX retired from Databricks services |
| dbrx-base | release | archived | Weights `not_public` now; Databricks Open Model License (custom, spdx null) |
| dbrx-instruct | release | archived | Same as dbrx-base; provenance points to dbrx-base |
| snowflake-arctic | family | published | Optional item; fully verified |
| snowflake-arctic-base | release | published | Apache-2.0 weights (model card) and code (GitHub LICENSE); ungated |
| snowflake-arctic-instruct | release | published | Same as Base; provenance points to snowflake-arctic-base |

### DBRX findings (why archived)

- The Hugging Face org `databricks` shows **0 public models**. Only datasets remain, including
  databricks-dolly-15k. `databricks/dbrx-base`, `databricks/dbrx-instruct` and even `databricks/dolly-v2-12b` return
  401, which is how Hugging Face answers for private or removed repos. For comparison, gated Meta repos return 200.
- Hugging Face Transformers docs: "The original `databricks/dbrx-instruct` checkpoint was closed". The
  `transformers-community/dbrx-instruct` re-upload that the docs point to also returns 401.
- `github.com/databricks/dbrx`, the repo the license names as defining "DBRX", returns 404.
- The Databricks retired-models policy lists DBRX as retired on pay-per-token and fine-tuning (2025-04-30) and on
  provisioned throughput (2025-12-19). The April 2025 release notes confirm the first two.
- The license page and Acceptable Use Policy (both dated 2024-03-27) are still live, and I read them. Recorded
  terms: no using DBRX, derivatives or outputs to improve other LLMs; a separate license above 700M MAU; the AUP
  applies.
- The original Hugging Face model cards could not be read: Hugging Face returns 401 and WebFetch cannot fetch
  web.archive.org. The release records therefore rely on the Databricks announcement, the license, and the
  Transformers docs. Checklist: `weights` is `not_public` (with a note on the history), `inference_code` is `public`
  (Transformers `DbrxForCausalLM`), `training_recipe` and `evaluation_materials` are `partial`, and training code and
  data information are `unknown`.
- Third-party re-uploads of DBRX exist on Hugging Face (e.g. mlx-community, alpindale). They are mentioned in the
  family availability note and not treated as official.

### Arctic notes

- The Arctic GitHub README says "We released Arctic in April of 2023". The model cards say "April, 24th 2024". I used
  the model-card date. The README line looks like a typo.
- `training_code` is unknown: the repo's `training/arctic` folder has only a LoRA fine-tuning script and a converter.
  Training-data information and the training recipe are unknown because the Medium cookbook pages returned 403.
- The run note quotes the model card: 8xH100, bf16 with DeepSpeed FP8 (or FP6), and `max_memory` of 150GiB per GPU.

## Leads for other/future records (not created)

- Perplexity has open-weight models on Hugging Face: pplx-embed (MIT, derived from Qwen3), PII-Tracer, and
  Qwen-derived "pplx-computer" variants. Base-model provenance is not U.S.; flag it if anyone catalogs them.
- Salesforce AI Research lists about 185 models on Hugging Face, with licenses that vary by release (BSD-3-Clause,
  Apache-2.0, CC-BY-NC-4.0).
- Snowflake also uses the Arctic name for other models (e.g. embedding models, which I did not verify). The
  `snowflake-arctic` family covers only the 480B dense-MoE language model.
