# people-a: Local corner research notes (2026-09-29)

Validation: `npx tsx scripts/validate.ts` gives 0 errors. The one warning is in `artifacts/continue-extension.yml`, which is not in this group. The six profiles below have no errors or warnings.

Method:

- Every page was fetched today with WebFetch. No email address or personal identifier went into any request. The GitHub API returned 403, so profiles were read from the github.com HTML pages. OpenReview showed a bot-verification page; I did not bypass it and do not use OpenReview as a source.
- I used only the source types rule 2 allows: the person's own site or GitHub/HF profile, official organization pages and bylines, project repositories and governance docs, and paper author lists. Search results also turned up LinkedIn, Crunchbase, YC, ZoomInfo, Tracxn, news articles, Wikipedia, and conference speaker pages. I did not cite any of them or rely on them for any claim.
- I left out every personal detail that search snippets surfaced (schools, age, nationality, where people met, investing activity, fellowships).

| Candidate | Decision | Current role (source) | Contribution (source) | Catalog tie |
| --- | --- | --- | --- | --- |
| Jeffrey Morgan | **created, published** | Co-founder and CEO of Ollama (MotherDuck blog author byline); currently building Ollama (own GitHub profile) | One of the founders of the Ollama project (MotherDuck talk page); ongoing commits to ollama/ollama (repo commit list); 2024 talk on running small models locally | artifact `ollama` |
| Michael Chiang | **not created** | No rule-2 source gives his full name together with a role. His GitHub profile (mchiang0610) shows the display name "Michael" and the bio "Ollama", with no surname and no role. The Ollama funding post is signed "Jeff & Michael" and gives no surnames or titles. Every source that states "co-founder" is LinkedIn, Crunchbase, YC, news, or a conference speaker page. | — | — |
| Awni Hannun | **created, published** | Member of the Technical Staff at Anthropic (own site, GitHub bio). **He is no longer at Apple.** He was a Research Scientist there and is recorded as a past affiliation (current: false). | Co-created MLX (own site). The MLX README credits him as one of four initial developers. | artifact `mlx`, orgs `anthropic`, `apple` |
| Andriy Mulyar | **created, published** | CEO, Nomic (Nomic news bylines dated 2025-11-03 and 2026-09-03) | Co-author of the GPT4All report (arXiv 2311.04931) and named in the gpt4all README citation. The Nomic Embed report's contributions section says he set early direction, reviewed code, and worked on model design and data curation. | org `nomic-ai`, artifacts `gpt4all`, `nomic-embed` |
| Brandon Duderstadt | **created, published** | Founder of Calcifer Computing (own site: "an organization I founded"; bio: "He is building Calcifer Computing"). His Nomic role is past: "Previously, I cofounded Nomic" and "founding CEO of Nomic AI". | Co-author of the GPT4All report and named in the README citation. The Nomic Embed contributions section says he made design contributions across the full stack and wrote the base data-curation pipeline. | org `nomic-ai` (past), artifacts `gpt4all`, `nomic-embed` |
| Woosuk Kwon | **created, published** | Co-founder and CTO of Inferact (own site, GitHub); vLLM lead maintainer (vLLM governance doc) | Co-created and co-leads vLLM (own site); first author of the PagedAttention/vLLM paper (arXiv 2309.06180; also the README citation) | artifact `vllm` |
| Joshua Lochner | **created, published** | GitHub bio: "Currently working on Transformers.js", company field @huggingface. No job title is published in an allowed source, so the role is recorded as "Working on Transformers.js". | Byline author of the HF blog posts announcing Transformers.js v3 (2024) and v4 (2026) | org `hugging-face` (Transformers.js is a separate project from the `transformers` artifact, so `artifact_slug` is null) |

## Points a reviewer may want to check

- **Jeffrey Morgan.** The only source for the "Co-founder and CEO" title is MotherDuck's author page, a blog byline from 2024 on another company's site. His own GitHub profile ("Building @ollama") confirms that he is currently at Ollama, but it does not give a title. If a byline on a third-party organization's blog does not qualify, switch the profile to draft.
- **Joshua Lochner.** The role wording comes from his own GitHub bio, not from a job title. If the site needs a formal title, switch the profile to draft.
- **Awni Hannun.** The assignment described him as "MLX at Apple". Both of his own current pages say he is now at Anthropic, and the profile reflects that.
- **Nomic.** Nomic's site now describes an AI platform for architecture, engineering, and construction firms. GPT4All and Nomic Embed are described only through the reports and repository.
