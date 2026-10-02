# Corrections pass — 2026-10-02

All sources were fetched on 2026-10-02 with WebFetch or `curl -A 'USASI-catalog-research/0.3'`. No personal identifiers were sent. `last_reviewed` was not advanced on any record, because no record was re-checked in full. Tiers were not edited. They are computed, and the results are listed below. `npx tsx scripts/validate.ts` reports 0 errors. Its one warning (continue-extension) comes from another agent's file and predates this pass.

## 1. Gemma 4 license URL (gemma-4-12b, gemma-4-26b-a4b, gemma-4-31b, gemma)

- **Source says:** `https://ai.google.dev/gemma/docs/gemma_4_license` returns HTTP 301 to `/gemma/apache_2`. The target page's canonical URL is `https://ai.google.dev/gemma/apache_2`. Its page title is "Apache License 2.0", and the full Apache 2.0 text has no Gemma-specific preamble. The Legal sidebar labels it "Gemma 4 license". The Gemma Terms of Use (last modified April 1, 2026) still say they cover the models in their appendix. For Gemma 4 terms they link directly to `/gemma/apache_2`. The Hugging Face cards' front matter still shows `license: apache-2.0`, with `license_link` pointing at the old URL (which redirects).
- **Changed:** In all four files, link, license and source URLs now point to `https://ai.google.dev/gemma/apache_2`. The `gemma-4-license` and `gemma-terms` sources now have accessed_at and reviewed_at set to 2026-10-02. The license entries and license_notes have `reviewed_at: 2026-10-02`, and updated_at is 2026-10-02.
- **Side effect:** The weight licenses now carry a fact-level reviewed date, so `componentRights(weights)` for the three releases moves from unknown to qualifying-license (Apache-2.0). The tier stays Open-weight.
- **Not changed (outside the assignment):** `content/organizations/google-deepmind.yml` still cites the old `gemma_4_license` URL. It redirects correctly, but an editor may want to update it.

## 2. Olmo 3 training-data information

- **olmo-3-7b-instruct, now partial (tier Open-weight → Open-stack):**
  - The model card describes the SFT, DPO and RLVR stages and links Dolci-Instruct-SFT, Dolci-Instruct-DPO and Dolci-Instruct-RL.
  - Some of those links are redirect slugs: `dolci-3-instruct-dpo-with-metadata` points to Dolci-Instruct-DPO, and `Dolci-Instruct-RL-7B` points to Dolci-Instruct-RL.
  - Each dataset card describes its composition and names the 7B Instruct line as its use: the SFT card names Olmo-3-7B-Instruct-SFT, the DPO card says it preference-tunes Olmo 3 Instruct 7B, and the RL card names Olmo-3-7B-Instruct.
  - All three are ungated and ODC-BY; the RL card states ODC-BY only in its body, not its metadata.
  - Pretraining data is linked from the base card. One caveat: the card's stage text names the *Think* datasets alongside the Instruct ones, and this is noted in the record.
  - Added the sources dolci-instruct-dpo, dolci-instruct-rl and mc-olmo3-7b-base.
- **olmo-3-1-32b-think, now partial (tier Open-weight → Open-stack):**
  - The model card documents its post-training data differently, and less accurately. Its metadata lists `allenai/Dolci-Think-RL`, which redirects to Dolci-Think-RL-32B. But its stage-by-stage section is copied from the 7B card: it names and links the 7B datasets.
  - Release-specific support comes from elsewhere. The technical report (arXiv 2512.13961v2) says 3.1 Think 32B continued the Olmo 3 Think 32B RL run, with extra epochs on Dolci Think RL.
  - The Dolci-Think-SFT-32B, -DPO-32B and -RL-32B cards describe their composition and state 32B Think use.
  - The Dolma 3 Mix (6T) card says it was used to pretrain Olmo-3-1125-32B. The 32B base card links `dolma3_mix-5.5T-1125`, which redirects to dolma3_mix-6T.
  - The note records the card's inconsistency.
- **Not done:** No `training_data_access` assessment was added; the base record has none either. The legacy items were not touched.

## 3. NVIDIA Nemotron data availability

- **NVIDIA's page:** `developer.nvidia.com/nemotron` now redirects to `/topics/ai/nemotron`. It describes Nemotron as open models "with open weights, training data, and recipes". It also says the training data "used for these models" is open on Hugging Face. This is a family-level marketing statement; it names no release.
- **Release cards (Super 120B-A12B, Lightning 3.5 30B-A3B, Ultra 550B-A55B):**
  - Each says NVIDIA releases its final pre- and post-training data. An ungated sample set is provided; the remaining code, math and multilingual data require gating and approval.
  - Each lists "Private Non-publicly Accessible Datasets" from third parties (e.g., Scale HLE, HackerRank Coding) and from NVIDIA.
  - The Ultra recipe also says the 1M-context long-context data is not open source.
  - The release-specific sources therefore contradict the general page, and the catalog's existing legacy notes were accurate.
- **Changed:** Added `training_data_access: partial` (reviewed 2026-10-02) to the three release records, citing each model card; Ultra also cites its recipe. The legacy items were left untouched. The tier is unchanged (Open-weight).
- **Open question:** `training_data_information` (v0.2) is still unassessed for all three. The cards disclose datasets in detail, and the recipes and training code are public. A future review may find "partial", which would move Super and Lightning to Open-stack; Ultra's recipe is partial. This was outside this assignment.
- **Not changed:** The family record `nemotron.yml` cites `developer.nvidia.com/nemotron`, which now redirects to `/topics/ai/nemotron`.

## 4. EmbeddingGemma access conditions

- **Source says (still conflicting):** The HF API and page data have `gated: "manual"`. The gate prompt says to log in, acknowledge Google's usage license, and "Requests are processed immediately." The page also says the repository is publicly accessible but its files require accepting conditions. HF's gated-models documentation defines manual approval as the author choosing which users can access the model. Google's overview still links Hugging Face, Kaggle and Vertex.
- **Changed:** Rewrote the availability `access_conditions` and the weights note to describe both signals, citing a new source (hf-gated-docs); both are reviewed 2026-10-02. The weights status is unchanged (public).
- **Editor decision needed:** If manual approval actually applies, the rubric would make the weights "partial" (Restricted weights). The sources conflict, so I did not change the status.

## 5. Granite 4.2 context length (3B, 8B, 30B)

- **Source says:** For all three sizes, the model card states "Natively Supports 128K (Long-context extension to 512K)" and lists a "512K Context Window" among key capabilities. However:
  - its architecture table gives a sequence length of 131072;
  - its vLLM and SGLang examples use 131072;
  - `config.json` sets `max_position_embeddings: 131072` with `rope_scaling: null`;
  - the card gives no instructions for reaching 512K.
- **Changed:**
  - Rewrote the summary sentence to state both the card's claim and the config value.
  - Added a run note listing each statement.
  - Added an `hf-config` source per record; the model-card accessed_at is now 2026-10-02.
- **Noticed, not changed:** The 30B `config.json` sets rope_theta to 50,000,000, while the card's text says θ = 10,000,000. The catalog does not record RoPE θ.

## 6. Physical Intelligence website

- **Unchanged.** Every request to www.physicalintelligence.company, physicalintelligence.company, www.pi.website and pi.website returned HTTP 429 from Vercel (curl), or 403 (WebFetch). This looks like a bot check, so I did not try to get around it.
- **Other company pages:** The company's openpi README on GitHub still links `https://www.physicalintelligence.company/` and its blog and research pages. The GitHub org lists no website, and the Ashby job board API mentions neither domain.
- The record's careers URL (pi.website/join-us, reviewed 2026-10-01 by another pass) suggests the move may be real, but I could not confirm it today. `website` stays as it is, and no changelog entry was made.

## Computed tiers after this pass

- Gemma 4 12B / 26B-A4B / 31B: Open-weight (unchanged)
- Olmo 3 7B base: Open-stack (unchanged)
- Olmo 3 7B Instruct and Olmo 3.1 32B Think: Open-stack (were Open-weight)
- Nemotron 3 Super / 3.5 Lightning / 3 Ultra: Open-weight (unchanged)
- EmbeddingGemma 300M: Open-weight (unchanged)
- Granite 4.2 3B / 8B / 30B: Open-weight (unchanged)
