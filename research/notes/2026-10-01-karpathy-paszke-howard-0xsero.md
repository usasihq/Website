# People Behind Local AI: Karpathy, Paszke, Howard, 0xSero (2026-10-01)

All pages below were fetched and read on 2026-10-01 with WebFetch or curl
(User-Agent `USASI-catalog-research/0.3`). No email address or personal
identifier was sent in any request. No Wikipedia, news, social posts, or
aggregators were used. I created only the three new files listed below.
`npx tsx scripts/validate.ts` gives 0 errors. The one warning is in
another agent's file (`continue-extension.yml`).

| Candidate | Decision | File |
|---|---|---|
| Andrej Karpathy | Created, published | `content/people/andrej-karpathy.yml` |
| Adam Paszke | **Not created** (borderline on fit test 1) | none |
| Jeremy Howard | Created, published | `content/people/jeremy-howard.yml` |
| 0xSero | Created, published (under the public handle only) | `content/people/0xsero.yml` |

## Andrej Karpathy: created (published)

- **Fit test 1 (local work): passes.** llama2.c is inference code that runs on
  personal machines. Its README shows small models running on an M1 MacBook Air.
  It explains how to export and run Meta's Llama 2 models (base and chat) and
  Hugging Face models with the Llama 2 architecture. It adds `runq.c` for
  int8 (Q8_0) quantized inference. The README calls the project minimal and
  educational. It is still working local inference software, so it is not
  purely educational work. nanoGPT, llm.c and nanochat are mostly training
  code (nanochat targets a single 8xH100 node), so I left them out of `work`.
- **Fit test 2 (catalog link): passes.** `openai` (published) is a documented
  past affiliation: founding member and research scientist (2015–2017), and a
  team on midtraining and synthetic data (2023–2024). `tesla` (published) is
  also past: Director of AI (2017–2022). `llama` (published) is linked through
  the llama2.c export of Meta's Llama 2 models.
- **Current role:** I used only the site's own wording: "AI researcher and
  educator", making educational videos since 2024. The site shows a Eureka
  Labs icon but no text naming a role there. eurekalabs.ai does not name
  Karpathy as founder or staff. So Eureka Labs is not in the profile.
- **Omitted:** education, numbers (tokens/s, model sizes in GB), and talks.
- **Surprising:** karpathy.ai contains a hidden `display:none` div with a
  made-up "Order of the Unicorn" passage, apparently meant for LLM scrapers. I
  ignored it and used none of it.
- **Sources:** https://karpathy.ai/ ; https://github.com/karpathy (and the
  GitHub API user record, used only for the bio line) ;
  https://github.com/karpathy/llama2.c (README) ;
  https://github.com/karpathy/llama2.c/blob/master/LICENSE (MIT) ;
  https://github.com/karpathy/nanochat (README, read for the decision, not
  cited) ; https://eurekalabs.ai/ (read, not cited).

## Adam Paszke: not created

- **Fit test 1: borderline, so not created, as the brief requires.** The
  sources document two things. First, authorship of PyTorch: the GitHub bio
  says "Author of PyTorch. Research Scientist @ Google", and Paszke is first
  author of *PyTorch: An Imperative Style, High-Performance Deep Learning
  Library* (arXiv:1912.01703). Second, Dex (google-research/dex-lang), "a
  research language for typed, functional array processing". PyTorch is a
  general-purpose framework. The paper's abstract is about usability, speed and
  GPU accelerators, not about running models on personal hardware. Dex is
  research on programming languages. None of the fetched sources document
  Paszke's own work on a local runtime, on-device inference, quantization, or
  consumer-GPU fine-tuning. JAX is pinned on the GitHub profile, but a pinned
  repository does not show a contribution, and JAX's focus is GPUs and TPUs.
  The Soumith Chintala profile was accepted on co-founding PyTorch together
  with ExecuTorch, PyTorch's on-device stack. No similar on-device or local
  work is documented for Paszke.
- **Fit test 2 would pass:** `pytorch`, `jax` and `google` are all published.
  The missing piece is evidence for test 1, not a catalog record.
- **What would change the decision:** a source of the kind the brief allows
  (paper author list, official repository, or Paszke's own page) showing
  Paszke's own work on local or on-device execution. Examples: a CPU or Apple
  MPS backend, ExecuTorch, or a JAX path for running models on personal
  machines.
- **Personal site:** apaszke.github.io is a placeholder page ("under
  construction") with a link to a blog. It has no role or project text.
- **Sources:** https://apaszke.github.io/ ; https://github.com/apaszke ;
  https://arxiv.org/abs/1912.01703 ;
  https://github.com/google-research/dex-lang (README).

## Jeremy Howard: created (published)

- **Fit test 1: passes.** Efficient fine-tuning on consumer GPUs. Answer.AI's
  post "You can now train a 70b language model at home" (2024-03-06) announces
  FSDP/QLoRA, an open-source system for training a 70B model on two 24 GB
  gaming GPUs. The post credits Howard with three things. Howard discussed
  combining FSDP and QLoRA with Tim Dettmers in late 2023. Howard worked with
  Titus von Koeller of Hugging Face to explore and document the issues. Howard
  wrote a minimal standalone fine-tuning script after studying Llama-Recipes
  together with bitsandbytes, PEFT, Transformers and Accelerate. The repository
  README documents fine-tuning Llama 2 70B on dual 24 GB GPUs. The license is
  Apache-2.0.
- **Fit test 2: passes.** `transformers` (published) is linked through a work
  entry. The announcement says the system builds on Transformers, and the
  README installs it. I did not link `llama`; Transformers is the stronger and
  more direct tie.
- **Roles:** Answer.AI: "Co-founder (with Eric Ries); CEO / R&D". The site lists
  Answer.AI among things Howard created or co-created with Eric Ries, and the
  GitHub bio says "CEO / R&D @ answer.ai". fast.ai: "Founder and founding
  researcher" (GitHub says "Founder fast.ai"; the site says "founding
  researcher at fast.ai"). The answer.ai homepage does not state Howard's
  title, so it is not cited for the role.
- **Omitted:** the honorary professorship, medicine work, Kaggle, Enlitic
  (its funding amount appears on the site), rankings, all cost and price
  figures from the post, and the fastai library as a work entry. fastai is a
  general framework and gets one clause in the bio.
- **Sources:** https://jeremy.fast.ai/ ; https://github.com/jph00 ;
  https://www.answer.ai/posts/2024-03-06-fsdp-qlora.html ;
  https://github.com/AnswerDotAI/fsdp_qlora (README) ;
  https://github.com/AnswerDotAI/fsdp_qlora/blob/main/LICENSE ;
  https://www.answer.ai/ (read, not cited).

## 0xSero: created (published, pseudonymous handle only)

- **Identity:** the profile uses only the public handle "0xSero", as it appears
  on GitHub and on the Omarchy pages. I made no attempt to identify the person
  further. The GitHub API returns a location field; I did not use it.
  Initials are "XS" because the schema allows letters only.
- **Fit test 1: passes.** The Local AI Registry (github.com/0xSero/local-ai-registry,
  MIT, copyright 0xSero) publishes recipes for running specific models on
  specific GPUs. Each recipe pins the weights, engine image and settings, and
  carries proof from a lab run. The README says "Omarchy Local AI reads
  `plugin/v2/recipes.json`". local-ai-images publishes the pinned engine
  images, including stock upstream llama.cpp. Local Studio (sybil-solutions,
  Apache-2.0) is a local-first control panel for vLLM, SGLang, llama.cpp and
  ExLlamaV3, and 0xSero has authored commits to it. The registry has recent
  commits authored by 0xSero (2026-09-29 to 2026-10-01).
- **Fit test 2: passes.** `vllm` (published) is linked through the registry's
  `registry/engines/vllm.json` profile, which pins the vLLM OpenAI server
  image. `llama-cpp` (published) is linked through the `llamacpp-upstream`
  image in local-ai-images.
- **Affiliation:** Sybil Solutions is the company field on the GitHub profile.
  The Omarchy announcement calls it 0xSero's company, and the Omarchy
  sponsorships page reads "Sybil Solutions by 0xSero". No title such as
  founder or CEO is published, so the role says only that the announcement
  names the company as 0xSero's.
- **Omitted:** every tokens/s figure, GPU counts and recipe counts from the
  registry site, all TurboQuant benchmark tables, pinned repositories that
  belong to other organizations (elizaOS, hey.xyz, MiniMax), and the X handle.
- **Sources:** https://github.com/0xSero (and the GitHub API user record) ;
  https://github.com/0xSero/local-ai-registry (README, LICENSE) ;
  https://github.com/0xSero/local-ai-registry/commits?author=0xSero ;
  https://github.com/0xSero/local-ai-registry/tree/main/registry/engines ;
  https://github.com/0xSero/local-ai-registry/blob/main/registry/engines/vllm.json ;
  https://local.sybilsolutions.ai/ ; https://github.com/0xSero/local-ai-images ;
  https://github.com/sybil-solutions/local-studio ;
  https://github.com/sybil-solutions/local-studio/commits?author=0xSero ;
  https://www.sybilsolutions.ai/ ;
  https://omarchy.org/news/2026/09/omacom-foundation-to-be-premier-sponsor-of-0xsero/ ;
  https://omarchy.org/sponsorships/ ; https://github.com/0xSero/turboquant
  (README, read, not cited).

## DHH's announcement: verified

- **Where it is:** the announcement is **not** on world.hey.com/dhh. Its
  newest post is "Endless execution" (2026-08-09). It is also **not** on dhh.dk,
  which mentions Omarchy and the Omacom Foundation but not 0xSero. It is
  published as an Omarchy News post with the byline "By DHH", dated September
  23, 2026, and the byline links to https://dhh.dk:
  https://omarchy.org/news/2026/09/omacom-foundation-to-be-premier-sponsor-of-0xsero/
- **Authorship confirmed** in the official site repository. The post was added
  by GitHub user `dhh` in omacom/omarchy-site pull request #440, "Announce
  three-year premier sponsorship of 0xSero", merged 2026-09-23:
  https://github.com/omacom/omarchy-site/pull/440
- **Exact supporting sentences** (from the post above):
  - "The Omacom Foundation is becoming a premier sponsor of 0xSero's work on
    local AI for the next three years, through his company Sybil Solutions!"
  - "We're going to collaborate on making local models work beautifully out
    of the box on Omarchy."
  - "His Local AI Registry brings together model configurations,
    hardware-specific recipes, and performance measurements."
- **Suggested sentence for `content/people/david-heinemeier-hansson.yml`** (not
  added; the file was not edited). It would be cited to a new source
  `omarchy-0xsero-announcement` (the URL above, kind `announcement`,
  published_at 2026-09-23):
  > In September 2026, Heinemeier Hansson announced that the Omacom Foundation
  > will sponsor 0xSero's local AI work through Sybil Solutions for three
  > years, collaborating on making local models work out of the box on
  > Omarchy.
- **Note:** the post itself uses gendered pronouns for 0xSero. The 0xSero
  profile avoids them, and so does the suggested sentence.

## Open items

- Paszke: needs a source documenting Paszke's own local or on-device work
  (see above) before a profile is possible.
- 0xSero: if Sybil Solutions publishes an about or team page with 0xSero's
  title, the affiliation role could be made more specific.
