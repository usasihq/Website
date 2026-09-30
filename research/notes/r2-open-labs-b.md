# r2-open-labs-b research notes

Researcher group: r2-open-labs-b. Reviewed 2026-09-29.
Assigned orgs: zyphra, essential-ai, writer, genmo, nomic-ai.
Assigned artifacts: Zamba (`zamba`), Essential AI open model/dataset (verify first), Writer open-weight Palmyra (verify first), Mochi (`mochi`), `nomic-embed`, `gpt4all`.

Validation: `npx tsx scripts/validate.ts` reports 0 errors. The one warning is `continue-extension.yml`, which belongs to another group. A separate script found no unused or missing source IDs in my 21 files.

## Files created

| File | Status | Eligibility |
| --- | --- | --- |
| content/organizations/zyphra.yml | published | eligible, us-headquarters |
| content/organizations/essential-ai.yml | published (with status_note) | eligible, us-headquarters |
| content/organizations/writer.yml | published | eligible, us-headquarters |
| content/organizations/genmo.yml | published | eligible, us-headquarters |
| content/organizations/nomic-ai.yml | published (with status_note) | eligible, us-headquarters |
| content/artifacts/zamba.yml (family) | published | eligible, us-headquarters |
| content/artifacts/zamba2-7b.yml (release) | published | eligible, us-headquarters |
| content/artifacts/zamba2-vl-7b.yml (release) | published | eligible, us-headquarters |
| content/artifacts/rnj.yml (family) | published | eligible, us-headquarters |
| content/artifacts/rnj-1-instruct.yml (release) | published | eligible, us-headquarters |
| content/artifacts/rnj-1-5-instruct.yml (release) | published | eligible, us-headquarters |
| content/artifacts/essential-web.yml (dataset project) | published | eligible, us-governed-project |
| content/artifacts/palmyra.yml (family) | published | eligible, us-headquarters |
| content/artifacts/palmyra-mini.yml (release) | published | eligible, us-headquarters (Qwen-based fine-tune) |
| content/artifacts/palmyra-mini-thinking-b.yml (release) | published | eligible, us-headquarters (NVIDIA/Qwen-based fine-tune) |
| content/artifacts/mochi.yml (family) | published | eligible, us-headquarters |
| content/artifacts/mochi-1-preview.yml (release) | published | eligible, us-headquarters |
| content/artifacts/nomic-embed.yml (family) | published | eligible, us-headquarters |
| content/artifacts/nomic-embed-text-v2-moe.yml (release) | published | eligible, us-headquarters |
| content/artifacts/nomic-embed-text-v1-5.yml (release) | published | eligible, us-headquarters |
| content/artifacts/gpt4all.yml (runtime project) | published | eligible, us-governed-project |

## Organizations

### Zyphra (`zyphra`): published
- **Reason:**
  - The terms of use (updated 2026-05-04) and privacy policy (2026-08-20) name **Zyphra Technologies, Inc., 415 Mission Street, 44th Floor, San Francisco**, under California law with SF venue.
  - The ZAYA1-8B announcement (2026-05-06) says "headquartered in San Francisco, CA", and the PR Newswire version has a SF dateline.
  - The IBM newsroom release (Oct 2025) says "based in San Francisco". I read it but did not cite it.
  - The Zamba2-VL technical report gives the affiliation "Zyphra, San Francisco, CA".
  - Every role on the Ashby job board is in San Francisco.
- **Eligibility basis:** us-headquarters. London is recorded as an other_location (the about page mentions hiring in SF and London).
- **Material change / surprise:** third-party profiles (Builtin, Crunchbase snippets, a Wikipedia-style summary) still say **Palo Alto**. All current official sources say San Francisco, so the company appears to have moved. No official statement of a move was found.
- **Products:** Zyphra Cloud, recorded as an inference-service (serverless inference including a ZAYA1-8B endpoint, reserved capacity, GPU compute). Maia, recorded as an assistant-app; its page gives no availability or pricing terms.
- **Evidence gaps:**
  - Founding year: only third-party sources (2020), so omitted.
  - Legal form / state of incorporation not stated in the terms.
- **Not recorded:** funding and GPU/MW capacity announcements, per the no-funding and no-power-figures rules.

### Essential AI (`essential-ai`): published, with status_note
- **Reason:**
  - The homepage, about page and careers page give the location as San Francisco, CA.
  - The Essential-Web paper lists the affiliation "Essential AI, San Francisco, CA".
- **Eligibility basis:** us-headquarters.
- **Material change:** Ground Level AI (2026-06-20) reported that **NVIDIA hired Essential AI's founder/CEO and several team members to work on Nemotron**, and said neither company had confirmed. This is recorded in status_note as a report, with no individual named in the record.
- **Supporting signals (not recorded as facts):**
  - The Ashby job board (api.ashbyhq.com/posting-api/job-board/essentialai) returned **zero open roles**.
  - The site footer still reads © 2025.
  - The research index has no post after Dec 2025, although rnj-1.5-instruct appeared on HF in 2026 (repo created 2026-04-22).
  - For these reasons I set hiring_url to null.
- **Open question:** whether Essential AI still operates independently. If the coordinator wants stricter treatment, the org could move to draft pending confirmation. Eligibility itself is not affected, since both parties are U.S.
- **Legal name:** the footer says "Essential AI Labs". No terms or privacy page exists (404), so legal_name is null.
- **Products:** none. There is no Essential AI product; Rnj-1 Instruct is hosted by third parties (Together AI, OpenRouter), recorded as a notable fact.

### Writer (`writer`): published
- **Reason:**
  - The company page lists **HQ at 111 Maiden Ln, 4th Floor, San Francisco**, founded 2020. Other offices are in New York, Chicago, Austin and London.
  - The platform services agreement (updated 2026-08-05) names **Writer, Inc.** at the same SF address under California law.
- **Eligibility basis:** us-headquarters.
- **Products:**
  - Palmyra API (hosted-model-api, dev.writer.com; Palmyra X6/X5/X4).
  - WRITER Agent (enterprise-software).
- **Open weights exist, so this is not products-only.** Writer's HF org has 29 models:
  - Older Apache-2.0 Palmyra base models (2023).
  - Palmyra-Med-70B(-32K) and Palmyra-Fin-70B-32K under the **Writer Open Model License**, which is non-commercial unless separately licensed (license dated 2024-05-31, California law).
  - **Palmyra-X-4.3-73B** on HF, gated with manual approval under the same license.
  - The Palmyra-mini family (Sep 2025, Apache 2.0).
- **Not open:** Palmyra X5/X6 appear to be API/platform-only; I found no weights for them.
- **Surprise:** the developer docs now list **Palmyra X6** as the default, with Med/Fin/Creative/Vision on a deprecation timeline.
- **Gap:** no careers URL verified, so hiring_url is null.

### Genmo (`genmo`): published
- **Reason:**
  - The terms of service (2024-09-16) name **Genmo Inc., 2261 Market Street STE 5329, San Francisco, CA 94114** (this looks like a mailbox-style address), with California law and SF County venue.
  - Every role on the Ashby job board is listed at **"San Francisco HQ"**.
  - The homepage footer reads "© Genmo, Inc 2026" (the terms say "Genmo Inc.").
- **Eligibility basis:** us-headquarters.
- **Product:** Genmo Playground (kind `other`: a web video-generation app, login required, no pricing shown). The page is titled **"Mochi 1.1 Playground"**.
- **Surprise:** "Mochi 1.1" appears only in the hosted playground. The HF org contains only mochi-1-preview, and the blog has only the Oct 2024 Mochi 1 post. The "Mochi 1 HD" promised in Oct 2024 was not found. Genmo now positions itself around "world models".
- **Gap:** founding year omitted.

### Nomic AI (`nomic-ai`): published, with status_note
- **Reason:**
  - The careers page states **"headquarters in New York City"**.
  - The terms (updated 2026-04-20) name **Nomic, Inc., a Delaware corporation**, under Delaware law.
  - The GPT4All LICENSE carries "Copyright (c) 2023 Nomic, Inc.".
- **Eligibility basis:** us-headquarters.
- **Material change (major):**
  - Since Nov 2025 ("Announcing a new Nomic Platform", 2026-era site), **Nomic has pivoted to AI agents for architecture, engineering and construction (AEC)**.
  - The homepage, docs and Sept 2026 announcement (strategic funding plus Aurecon/Arcadis partnerships; amount not recorded) do not mention GPT4All or Nomic Embed.
  - GPT4All's last release was **v3.10.0 on 2025-02-25**, and the last commit to main was 2025-05-27.
  - No Nomic Embed model has been added to HF since April 2025.
  - All of this is recorded in status_note.
- **Products:**
  - Nomic Platform (enterprise-software).
  - Agent API (developer-tool).
  - Text embedding API in the Atlas docs (hosted-model-api; serves nomic-embed-text-v1/v1.5 and gte-multilingual-base).
- **Caution:** the Ashby board at `api.ashbyhq.com/posting-api/job-board/nomic` belongs to a **different company** (a Montreal/Boston biotech), not Nomic AI. I did not use it.
- **Gap:** founding year omitted.

## Artifacts

### Zamba (`zamba` family) plus `zamba2-7b` and `zamba2-vl-7b`: published
- **Family timeline:** Zamba-7B (2024-04-16); Zamba2-2.7B (2024-07-28), 1.2B (2024-08-27) and 7B (2024-10-14); Zamba2-VL 1.2B/2.7B/7B (2026-06-02). Instruct-v2 checkpoints were also posted on HF in Feb–Mar 2025, but no official announcement was found, so they are not in the summary.
- **Why these two releases:**
  - Zamba2-VL-7B is the newest Zamba release.
  - Zamba2-7B is its documented language backbone and has an official announcement date.
- **Licenses:**
  - Weights: Apache-2.0 from the card metadata and HF Transformers docs.
  - Code: Zyphra/Zamba2 LICENSE (Apache-2.0) and Zyphra's Transformers fork, zamba2-vl branch (Apache-2.0, HF copyright).
- **Zamba2-7B access:** gated on HF ("agree to share your contact information"; the API shows gated=auto). Recorded in availability.
- **Discrepancy:** the Zamba2-7B card says 2T pretraining tokens plus ~100B annealing, while the announcement says a "3 trillion token pre-training dataset" and the HF docs say "2T and 3T tokens, respectively". I avoided token counts in the records.
- **Provenance:** Zamba2-VL uses the **Qwen2.5-VL vision encoder (Alibaba Cloud)**. This is stated plainly in provenance and eligibility, with eligibility resting on Zyphra.
- **Not in scope but noted:** the ZAYA1 family (Apache 2.0, 2025–2026), Zonos TTS, ZUNA, and the Zyda datasets are candidates for future records.

### Essential AI: `rnj` family, `rnj-1-instruct`, `rnj-1-5-instruct`, `essential-web`: published
- **Existence:** verified. The Hugging Face org has rnj-1, rnj-1-instruct (+GGUF), rnj-1.5-instruct and eai-distill-0.5b, plus datasets including essential-web-v1.0 and the eval-generation datasets.
- **Family slug:** `rnj` is my choice; none was assigned.
- **Licenses and data:**
  - The Rnj weights are Apache-2.0 (LICENSE file in rnj-1-instruct; the rnj-1.5 card links to it).
  - The training datasets are **not named** anywhere; the cards say only "online web data".
  - rnj-1.5 used synthetic SWE trajectories from three **unnamed teacher models**.
- **released_at:**
  - rnj-1-instruct is "2025-12": the blog is dated Dec 5, 2025 and the card's "initial version" Dec 8.
  - rnj-1.5-instruct is "2026", from the card's citation year. There is no announcement; the HF repo was created 2026-04-22.
- **Essential-Web v1.0:**
  - License: ODC-By, plus Common Crawl terms.
  - Labeling model: EAI-Distill-0.5b, fine-tuned from **Qwen2.5-0.5B-Instruct** with **Qwen2.5-32B-Instruct** as teacher. The dataset card calls it "EAI-Taxonomy-0.5b", a naming inconsistency I recorded.
  - Code license: the eai-taxonomy GitHub repo showed no license via the API, so no code license is recorded.
  - stated_limitations is unknown: the paper has no limitations section.

### Writer: `palmyra` family, `palmyra-mini`, `palmyra-mini-thinking-b`: published
- **Why these releases:** Palmyra-mini (Sep 2025) is the latest open generation.
- **Licenses:** both release cards list Apache-2.0.
- **Provenance:**
  - palmyra-mini (and thinking-a) are fine-tuned from **Qwen2.5-1.5B** (Alibaba Cloud; Apache 2.0 per its card).
  - thinking-b is built on **NVIDIA OpenReasoning-Nemotron-1.5B**. NVIDIA's card says that model is **CC-BY-4.0** and was derived from Qwen2.5-1.5B using DeepSeek-R1-0528-generated responses.
- **License tension:** thinking-b's Apache-2.0 label sits on a CC-BY-4.0 base. This is recorded neutrally in license_notes.
- **Discrepancies:** parameter counts differ between the cards (1.7B for all three) and Writer's engineering post (thinking-b 1.5B). I avoided a count for thinking-b.
- **Alternative release considered:** Palmyra-Med-70B-32K (Writer Open Model License, non-commercial) would show the custom license. I did not create it because its lineage (card metadata "Writer/Palmyra-x-004"; text "builds upon Palmyra-Med-70b") is thinly documented. It is mentioned in the family and org records.

### Mochi (`mochi` family) plus `mochi-1-preview`: published
- **Only open release:** mochi-1-preview, released 2024-10-22 under Apache-2.0 (weights per the card; code per the genmoai/mochi LICENSE).
- **Training code:** partial (only a LoRA trainer).
- **Training data:** not described anywhere.
- **run_notes:** VRAM figures are quoted with their stated precision (Genmo's ~60GB single-GPU figure with fp32 text encoder/VAE and BF16 DiT; Diffusers 42GB full-precision and 22GB bf16, both with CPU offload and VAE tiling).
- **Text encoder:** google/t5-v1_1-xxl, per Diffusers. It is recorded in provenance text rather than derived_from because it is a component, not a base model.

### Nomic Embed (`nomic-embed` family) plus `nomic-embed-text-v2-moe` and `nomic-embed-text-v1-5`: published
- **v2-moe:**
  - Released 2025-02. The Nomic v2 blog URL now returns 404, so the date comes from the HF card, the arXiv submission (2025-02-11) and Simon Willison's post (2025-02-12, labeled news).
  - Lineage: v2-moe → v2-moe-unsupervised → nomic-xlm-2048 → FacebookAI/xlm-roberta-base.
  - training_data_information is partial: the card says the data is released, but the contrastors README documents access only to the v1 dataset (Atlas account required).
- **v1.5:**
  - Training data is public, but requires an Atlas account to obtain credentials.
  - Starts from nomic-bert-2048.
- **Other family members:** Nomic Embed Code and Multimodal are built on Qwen2.5-Coder-7B-Instruct / Qwen2.5-VL (Alibaba Cloud). Recorded in family provenance.

### GPT4All (`gpt4all` runtime project): published
- **License:** MIT (Copyright 2023 Nomic, Inc.).
- **Eligibility basis:** us-governed-project.
- **Maintenance:** apparently dormant. The last release was v3.10.0 (2025-02-25) and the last commit 2025-05-27. The repo is not archived and the website still offers downloads. Recorded factually in release_status.
- **Unresolved source conflict:** the README lists a Windows ARM build, while the system_requirements file says ARM PCs are not supported. The record describes the README's builds only.
- **run_notes:** none. The system requirements give RAM/GPU figures without quantization assumptions, so I left them out.

## Open questions for editors
1. Essential AI: is the company still operating after the reported NVIDIA hiring? Consider draft/archive if it is confirmed defunct.
2. Nomic: should GPT4All eventually be marked as unmaintained or archived if Nomic confirms it has stopped work?
3. Zyphra: HQ moved from Palo Alto (older third-party profiles) to San Francisco. No official move announcement was found.
4. Writer: whether to add a Palmyra-Med-70B-32K or Palmyra-X-4.3-73B release record (custom non-commercial license, gated).
