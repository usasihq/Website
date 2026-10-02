# Glossary additions — notes (2026-10-01)

File edited: `content/pages/glossary.mdx` only. 12 entries were added, inserted in alphabetical order among the existing 22 (34 in total). The intro states no count, so it was not changed. No other page states a glossary count.

Format matches the existing entries: `<h2 id>`, a plain definition, an "In this catalog" note, and one example linked to a published record. There are no imports, components, tables, or strikethrough. The file compiles with `@mdx-js/mdx`. A scratch script confirmed the alphabetical order, unique ids, that every methodology anchor exists (openness, sources, eligibility, tiers), and that every `/open/` and `/companies/` link goes to a record with `publication_status: published`.

Requests: WebFetch, or curl with User-Agent `USASI-catalog-research/0.3`. No personal identifiers were sent.

## Entries added

| Anchor | Example record | Outside source(s) linked |
|---|---|---|
| `accelerator` | intel (Gaudi 3) | none (general definition). Intel Gaudi product page re-read to check the example |
| `checkpoint` | smollm3-3b | PyTorch tutorial, Saving and Loading Models |
| `data-center` | crusoe | none (general definition). Crusoe data-centers page re-read to check the example |
| `foundation` | agentic-ai-foundation | AAIF charter (PDF, amended July 29, 2026) |
| `gguf` | rnj-1-instruct | ggml docs/gguf.md |
| `mixture-of-experts` | trinity-mini | Shazeer et al. 2017, arXiv 1701.06538 |
| `nonprofit` | eleutherai | IRS 501(c)(3) exemption requirements page; IRS business leagues (501(c)(6)) page |
| `open-stack` | olmo-3-1025-7b | none (USASI rubric; methodology#tiers) |
| `parent-company` | google-deepmind | SEC Rule 405 (17 CFR 230.405) on eCFR |
| `power-and-energy` | thinking-machines-lab | EIA, Measuring electricity |
| `restricted-weights` | dinov3-vit7b16 | none (USASI rubric; methodology#tiers) |
| `tokenizer` | openelm-3b-instruct | Hugging Face Transformers docs, Tokenization algorithms |

## Sources read today (2026-10-01)

1. U.S. EIA, "Measuring electricity", https://www.eia.gov/energyexplained/electricity/measuring-electricity.php (no date on page). Supports the W, kW, MW, and GW definitions, the watthour, and kWh as one kilowatt for one hour. MWh is not on the page; the glossary gives it as the same prefix applied, which is a definition, not a sourced figure.
2. Thinking Machines Lab, "Thinking Machines Lab and NVIDIA Announce Long-Term Gigawatt-Scale Strategic Partnership" (Mar 10, 2026), https://thinkingmachines.ai/news/nvidia-partnership/. The title is confirmed. The body states a gigawatt figure. Under methodology#sources, the glossary does not repeat it.
3. SEC Rule 405, 17 CFR 230.405 "Definitions of terms". The definitions of control, parent, subsidiary, and affiliate were read in full. **Access note:** WebFetch of `https://www.ecfr.gov/current/title-17/section-230.405` returned a 302 to `unblock.federalregister.gov`, which is a bot check, and it was not bypassed. The same section was read through the official eCFR versioner API (`/api/versioner/v1/full/2026-09-01/title-17.xml?section=230.405`). The glossary links the human-readable eCFR URL, which should load in a normal browser. If editors want only links that were fetched directly, swap it for the API URL or a govinfo annual-edition PDF.
4. IRS, "Exemption requirements - 501(c)(3) organizations" (last reviewed 28-Jun-2026), https://www.irs.gov/charities-non-profits/charitable-organizations/exemption-requirements-501c3-organizations. Also read: IRS, "Exempt purposes - Internal Revenue Code Section 501(c)(3)" (same date), which gives the list of purposes paraphrased in the entry.
5. IRS, "Business leagues" (last reviewed 28-Jun-2026), https://www.irs.gov/charities-non-profits/other-non-profits/business-leagues.
6. IRS EO BMF extract, District of Columbia, https://www.irs.gov/pub/irs-soi/eo_dc.csv. Lists ELEUTHERAI INSTITUTE with subsection 03 and ruling 202311. Only the 501(c)(3) status, the D.C. location, and the ruling month are used; the street address and financial fields are not used.
7. AAIF charter, https://raw.githubusercontent.com/aaif/foundation/main/foundation-charter.pdf (amended July 29, 2026). Read sections 1(a)–(c) (directed fund, Governing Board, project governance per project charter), 11(a) (LF custody and final authority over funds), and 8 (trademarks).
8. ggml-org/ggml `docs/gguf.md`, https://github.com/ggml-org/ggml/blob/master/docs/gguf.md (read through the raw file; the GitHub URL returns 200).
9. Hugging Face API and repository for EssentialAI/rnj-1-instruct-GGUF: ungated, contains `Rnj-1-Instruct-8B-Q4_K_M.gguf`.
10. Shazeer et al., "Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer", arXiv 1701.06538 (submitted Jan 23, 2017).
11. arcee-ai/Trinity-Mini model card: 26B parameters with 3B active; 128 experts, 8 active and 1 shared; ungated.
12. PyTorch, "Saving and Loading Models" (last updated Jun 26, 2025), https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html. Describes a general checkpoint that includes the optimizer state.
13. HuggingFaceTB/SmolLM3-3B-checkpoints README and refs API: checkpoints every 40,000 pretraining steps and 133 branches, including long-context, mid-training, and SFT stages.
14. Hugging Face Transformers docs, "Tokenization algorithms", https://huggingface.co/docs/transformers/tokenizer_summary.
15. apple/OpenELM-3B-Instruct model card, API metadata (no tokenizer files in the repository), and `generate_openelm.py`. The script's default tokenizer is `meta-llama/Llama-2-7b-hf` and it raises an error if no HF access token is given. The meta-llama/Llama-2-7b-hf API metadata shows `gated: manual`.
16. facebook/dinov3-vit7b16-pretrain-lvd1689m API metadata: `gated: manual`.
17. Intel Gaudi AI accelerator product page, which lists the PCIe card, OAM mezzanine card, and UBB baseboard and gives PyTorch support. Crusoe data-centers page, which mentions direct liquid-to-chip cooling.

Examples that rely only on the linked published record: open-stack (Olmo 3 7B; the tier comes from `computeTier()`) and parent-company (the Google DeepMind eligibility explanation).

## Computed tiers checked (computeTier, 2026-10-01)

- olmo-3-1025-7b: Open-stack. This is the only published release that computes Open-stack today, so the open-stack entry and the existing open-source-ai entry both use it.
- dinov3-vit7b16: Restricted weights. The others are llama-4-maverick-17b-128e, llama-4-scout-17b-16e, and sam-3-1. SAM 3.1 was already used under gated-download, so DINOv3 was chosen because its public training code makes the "weights decide the tier" point.

## Candidates not added

- **National laboratory:** no catalog record mentions a national laboratory. NIST is a federal agency, not a DOE national lab.
- **Cloud region:** appears once (oracle.yml).
- **Speculative decoding:** appears in 7 records (e.g., nemotron-3-5-lightning-30b-a3b, lfm2-5-2-6b, muse-glimmer-30b, tensorrt-llm, sglang). It was left out to stay within 12. It is a good candidate for the next batch. Suggested source: Leviathan et al., arXiv 2211.17192 (not fetched today).

## Findings for editors (not fixed; outside this assignment)

1. **Crusoe's data-centers page states a power-capacity figure (in GW).** The crusoe record correctly omits it, consistent with methodology#sources.
2. **OpenELM tokenizer access.** The record marks OpenELM 3B Instruct's weights Public (ungated), but its example script needs Meta's Llama 2 tokenizer from a gated repository (manual approval). The record's run notes and provenance mention that the tokenizer is separate, but not that it is gated. Editors may want to add this to the run notes.
3. **OpenELM 3B Instruct computes Open-weight**, even though its training code and recipe are Public. It has only a legacy data assessment and no v0.2 `training_data_information`. This is the same pattern noted earlier for the Olmo 3.1 records.
