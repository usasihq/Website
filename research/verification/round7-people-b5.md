# B5 verification (2026-10-13)

Independent fact-check of all 5 files in `B5/people/`. Every cited source was fetched today, unauthenticated, with curl (`-A "USASI-factcheck/0.3"`), GitHub's public REST API, or WebFetch. No email address or personal identifier went into any request. I checked catalog slugs against ORG_SLUGS.txt and ARTIFACT_SLUGS.txt, found no duplicates in the repository's `content/people` or `content/leaders`, and scanned every file for he/she pronouns, superlatives, counts and money.

## Files

- **christian-cantrell.yml: checked OK.**
  - christiancantrell.com gives the dated employment list:
    - Reve AI, March 2023 to present, "Founder and CPO" and "Chief Product/Prompt Officer";
    - Stability AI, VP of Product, with the Platform, REST API, DreamStudio 1.0 and the Photoshop, Blender and Google Workspace integrations;
    - Adobe, Apr 2005 – Aug 2022, Director of Experience Development and head of Adobe Design Prototyping.
  - The site links github.com/cantrell. The GitHub API still shows "@adobe" as the company, but the dated site list is newer.
  - The stable-diffusion-api-server README states:
    - Apache-2.0;
    - built for the Photoshop plugin;
    - runs on Windows and Linux with NVIDIA GPUs, and experimentally on M1 Macs;
    - loads diffusers-format models.
  - Catalog tie: `adobe` (past role, documented on the person's own site). Patent counts and personal details on the site are not in the profile.
- **lysandre-debut.yml: checked OK.**
  - The GitHub profile says "Chief OS Officer @ HF" and the Hugging Face profile says "chief open-source officer @ hf".
  - Author positions: second-listed on Transformers (arXiv 1910.03771, Hugging Face affiliation) and on DistilBERT (1910.01108). Listed as a co-author in the Datasets paper's (2109.02846) arXiv author metadata.
  - The distilbert-base-uncased card says apache-2.0.
  - Ties: `hugging-face` and `transformers`.
- **pedro-cuenca.yml: corrected.**
  - The writer's notes say the genaibook README was updated after 2025. Its last commit is actually 2024-12-15 (checked with the GitHub API). The Hugging Face profile and the GitHub API state no current role.
  - Role: "Machine learning engineer working on diffusion software, models, and applications" → "Machine learning engineer". It is still marked current: the README presents it in the present tense, and the official Hugging Face blog post "Profiling in PyTorch (Part 2)" (huggingface.co/blog/torch-mlp-fusion, 2026-06-11) lists Cuenca in its byline.
  - I added that post as source `hf-profiling-blog` and cited it in the bio and affiliation. I also set the README source's `published_at` to 2024-12-15.
  - Bio: the opening sentence now attributes the role to the book's author bio and mentions the June 2026 post.
  - Confirmed as written:
    - the Diffusers CITATION.cff and README citation list Pedro Cuenca (Apache-2.0);
    - the swift-transformers post (2023-08-08) is by Cuenca;
    - the Swift Diffusers post (2023-02-24) is by Cuenca and Vaibhav Srivastav;
    - the dalle-mini README lists Cuenca under Authors and in its citation (Apache-2.0);
    - swift-transformers and swift-coreml-diffusers are Apache-2.0.
- **stas-bekman.yml: corrected.**
  - Headline: "Training engineer at Snowflake AI Research; …" → "Software engineer focused on LLM training at Snowflake AI Research; author of an open ML engineering book". The source: stasosphere.com says "software engineer … specialize in training large language models" and "Currently I work at Snowflake AI Research".
  - Confirmed as written:
    - Contextual AI work and Hugging Face 2020–2023, including lead engineer on BLOOM and IDEFICS-80b (own site);
    - Hugging Face profile: "Makes things work and fly at Snowflake AI Research";
    - ALST (2506.13996): first author, and the paper says it is "open-sourced via DeepSpeed and Arctic Training";
    - Universal Checkpointing (2406.18820): co-author;
    - OBELICS (2306.16527): equal-contribution author with a Hugging Face affiliation;
    - ml-engineering repository: CC-BY-SA-4.0.
  - The site mentions where the person lives; that is not in the profile.
- **victor-sanh.yml: corrected.**
  - Role at Rilix: "AI Builder (company listed on GitHub profile)" → "Listed as the current company on Sanh's GitHub profile (no title stated)". The source is the GitHub API: company "@rilixai", which is the org named "Rilix"; bio "AI Builder | Prev @huggingface". "AI Builder" is a bio line, not a title at Rilix.
  - Bio: "a machine learning researcher whose GitHub profile describes them…" → "Victor Sanh's GitHub profile describes Sanh as an AI builder previously at Hugging Face and lists Rilix as the current company".
  - Bio: dropped "BigScience" before "paper". The T0 paper (2110.08207) lists BigScience only as some co-authors' affiliation. Sanh is first author there, with Hugging Face.
  - Confirmed as written:
    - DistilBERT first author, with Hugging Face, and the on-device study;
    - Transformers third author;
    - OBELICS equal and senior contributor;
    - Idefics2 (2405.02246) last author, with Hugging Face;
    - Licenses: T0pp, DistilBERT and idefics2-8b are apache-2.0; OBELICS is cc-by-4.0.

## Totals

- Files checked: 5
- Checked OK: 2
- Corrected: 3 (pedro-cuenca, stas-bekman, victor-sanh)
- Set to draft: 0
- Deleted: 0
- Validator: `5 batch file(s): 0 error(s), 0 warning(s)`
