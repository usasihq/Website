# Research notes: big-tech group

Reviewed 2026-09-29. `npx tsx scripts/validate.ts` gives 0 errors and 0 warnings across the full content tree.

## Organizations

| Slug | Decision | Basis | Reason |
| --- | --- | --- | --- |
| meta | published | us-headquarters | FY2025 10-K cover page lists Delaware and 1 Meta Way, Menlo Park, CA. |
| microsoft | published | us-headquarters | FY2026 10-K (filed 2026-07-29) lists Washington and One Microsoft Way, Redmond. |
| amazon | published ("Amazon (AWS)") | us-headquarters | FY2025 10-K lists Delaware and 410 Terry Ave N, Seattle. AWS is a segment, so it has no separate record. |
| apple | published | us-headquarters | FY2025 10-K lists California and One Apple Park Way, Cupertino. |
| pytorch-foundation | published | us-control | Directed fund of The Linux Foundation, per the participation agreement and charter PDF. No separate HQ is documented. |
| linux-foundation | published | us-nonprofit-or-lab | 501(c)(6) nonprofit (about page) with a legal postal address in San Francisco (privacy policy). Created only as the parent of pytorch-foundation. |

### Gaps and open questions
- **Meta AI organization.** Meta's own pages name Meta Superintelligence Labs (MSL) as the developer of Muse Spark and Muse Glimmer. The four-team structure (TBD Lab, FAIR, Products and Applied Research, MSL Infra) and the October 2025 layoffs come only from news or secondary sources. Axios returned 403. None of this is cited. I did not create a separate MSL record because no official page documents the unit's structure, and its artifacts are released under Meta's name and license. MSL is mentioned in Meta's notable_facts.
- **Meta URLs.** meta.ai, about.meta.com, meta.com, and ai.meta.com/muse block curl (400/403) or fail WebFetch. The Meta AI product URL therefore points to the about.fb.com Muse Spark announcement, and the Muse agent product URL points to its about.fb.com announcement. `website: https://about.meta.com` could not be fetched directly; it is referenced in the Llama 4 license text.
- **Linux Foundation HQ.** Taken from the privacy policy's legal postal address (548 Market St, PMB 57274, San Francisco), not from an about or contact page (/contact returned 404). This is weaker evidence than a registered office.
- **pytorch-foundation basis.** I chose us-control (a directed fund under a U.S. nonprofit). us-nonprofit-or-lab could also be argued, so an editor should confirm.
- **Apple.** The founding year is not in the 10-K text I read, so `founded` is null. The Apple Intelligence page does not mention third-party models. I did not verify any reported partnerships and left them out.
- **Amazon.** I created no artifact records. Possible future candidates, not researched: Amazon's Chronos time-series models and the Strands Agents SDK.
- **Unverified claims left out.** Reports that Llama was "discontinued" in April 2026 appear only in Wikipedia and blogs. News said Zuckerberg and Wang promised Muse Spark 1.2 open weights "soon" on X. Microsoft MAI's later models (MAI-Image-2, etc.) were only in search snippets.

## Artifacts

| Slug | Decision | Notes |
| --- | --- | --- |
| llama (family) | published | Most recent generation is Llama 4, April 5, 2025. The meta-llama HF org has no newer Llama LLMs. llama.com now redirects to developer.meta.com/ai, then to dev.meta.ai. |
| llama-4-scout-17b-16e | published | Read the model card, LICENSE, AUP, HF metadata (gated: manual), and repo code directory. |
| llama-4-maverick-17b-128e | published | Same sources as Scout. |
| phi (family) | published | |
| phi-4-reasoning-vision-15b | published | Released 2026-03-04. MIT license. |
| phi-4-mini-flash-reasoning | published | Released June 2025. MIT LICENSE file. |
| meta-muse (family) | published | Meta's Muse family from MSL. |
| muse-glimmer-30b | published | Open weights under Apache 2.0, August 2026. |
| microsoft-muse (family) | published | Microsoft Research's Muse, a World and Human Action Model (WHAM), February 2025. |
| wham-1-6b | published | Research-only, non-commercial license. |
| pytorch | published | us-governed-project. |
| mlx | published | Apple's MIT-licensed array framework. Optional item, added because it is verified and clearly relevant. |

### Judgment calls to review
- **Llama 4 weights marked `public`.** Downloads need an access request that Meta approves: the README says a signed URL arrives once approved, and HF gating is "manual". The AUP also withholds the license for Llama 4 *multimodal* models from EU-domiciled individuals and EU-based companies. Both points are in access_conditions, the checklist note, and license_notes. I followed the CONTENT_FORMAT example (a gated, accept-license download counts as public). A strict reading of "partial = access requires approval" would downgrade this and produce the tier "weights-not-public".
- **Llama license applies_to `weights-and-code`.** The license defines "Llama 4" to include model code, weights, and inference code.
- **PyTorch license recorded as SPDX `BSD-3-Clause`.** GitHub reports NOASSERTION because of the multi-party copyright header. The README calls it "BSD-style", and the clause text is the 3-clause BSD. This is explained in license_notes.
- **Phi-4-reasoning-vision-15B license.** The HF repo has no LICENSE file; the card metadata and body say MIT. The GitHub repo has an MIT LICENSE file. I recorded two entries: MIT for weights (card) and MIT for code (GitHub). The EU-format DATACARD lists Microsoft Ireland Operations Limited as "model developer", while the model card names Microsoft Corporation as developer. This is explained in eligibility.
- **Phi-4-mini-flash-reasoning provenance.** Its reasoning fine-tuning data is synthetic output from DeepSeek-R1. This is recorded under provenance. The weights are Microsoft-trained, and no foreign base weights are involved.
- **Evaluation checklist.** Marked `partial` when only reported results were verified. Marked `public` only for Phi-4-mini-flash-reasoning, where ArchScale ships LightEval-based evaluation code.

## "Muse / Muse Glimmer" resolution
- **Meta's Muse family (MSL).** Muse Spark launched 2026-04-08 with closed weights, and 1.1 through 1.3 followed. Meta's announcement says it hopes to open-source future versions. Muse Spark is available through Meta AI and the Meta Model API (self-serve, paid, public preview). Muse Image and Muse Voice Transcribe are listed on dev.meta.ai. Separately, Muse is also a personal-agent app announced 2026-09-08 for the U.S. Hosted items are recorded as products on `meta`. The open-weight **Muse Glimmer** has its own release record.
  - The `meta-models` HF org is confirmed as Meta's because Meta's dev blog (dev.meta.ai) links `huggingface.co/collections/meta-models/muse-glimmer`.
  - Sources conflict on Muse Glimmer's context length: the model card says 131,072+, Meta's dev blog says 128K default, and the HF blog says 32,768. Hardware figures also conflict: the HF blog cites a single 80 GB H100, while the model card cites 24/32 GB quantized. I used only the model card.
  - Muse Glimmer's LICENSE is plain Apache 2.0. The repo also ships a USAGE_POLICY.md with prohibited uses that the LICENSE does not reference, so its legal status is unclear. This is recorded in license_notes.
- **Microsoft Research "Muse"** is unrelated: a WHAM gameplay model from February 2025 (Nature paper; weights on HF under the Microsoft Research License, research-only). It got separate records (`microsoft-muse`, `wham-1-6b`) under distinct slugs to avoid confusion with Meta's family.
- I did not research other uses of the name "Muse".

## Other notes
- The Phi-Ground-Any (May 2026) model is the newest Phi-named model on HF. It is a fine-tune of Phi-3.5-vision, so it was not chosen as a release.
- PyTorch's get-started page has a stale static "Stable (2.7.0)" label in its HTML. I used GitHub releases (v2.14.0, 2026-09-02) and docs (2.14) instead.
- SEC EDGAR was read with curl. The User-Agent contained the placeholder string `contact@example.org` (not a real or user address). After the coordinator's privacy note, no further requests carried any email.
