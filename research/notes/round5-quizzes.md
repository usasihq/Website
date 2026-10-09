# Round 5: explainer quizzes (`round5-quizzes`, 2026-10-08)

## What was created

22 files in `content/quizzes/`, one for each explainer registered in `lib/learn.ts`. Each has `explainer: <slug>`, `updated_at: 2026-10-08`, and 3 questions with 3 or 4 choices. Every question was written from the explainer's MDX file in `content/pages/` alone.

- No web sources were fetched. The task needed only the explainer files.
- `npx tsx scripts/validate.ts` reports 0 errors. The only warning is the existing one for `continue-extension.yml`.
- Answer positions are spread evenly: 22 at index 0, 22 at index 1, 22 at index 2. The 4-choice questions use indexes 2, 0 and 2.
- I checked that the correct answer is not usually the longest choice. It is the longest in about 1 question in 6, which is below chance.
- Each explanation quotes or closely paraphrases the explainer. I checked every quoted phrase against the MDX text.
- Prompts and explanations avoid the validator's banned terms. No prices, power figures, or counts of people are used.

Nothing was skipped.

## Supporting passages

Q1–Q3 follow the order of the questions in each file. Each line gives the passage in the explainer that supports the correct answer.

### how-language-models-work.yml (`learn-how-language-models-work.mdx`)
- Q1 (the weights): "its weights were adjusted again and again so it got better at predicting the next token"; the architecture is "a fixed recipe".
- Q2 (sampling): "Because of the choosing step, the same prompt can produce different replies"; "A prompt does not change the weights".
- Q3 (the library's page): "The year comes from the library's page; the assistant only helped locate it."

### tokens-and-context-windows.yml (`learn-tokens-and-context-windows.mdx`)
- Q1 (different tokenizers): "Different models can use different tokenizers, so the same sentence can produce different counts."
- Q2 (prompt, messages, tools, reply): "the system prompt … every message in the conversation … the definitions of any tools … and the reply being generated".
- Q3 (dropped material is gone): "the model cannot consult what was dropped, and a summary keeps only part of the detail."

### multimodal-models.yml (`learn-multimodal-models.mdx`)
- Q1 (reading is not producing): "Reading a modality is not producing it: a model that describes photos may be unable to create one."
- Q2 (encoder and connector): "a vision encoder … turns each crop into features … a connector pools those features and projects them into 'visual tokens'".
- Q3 (different licenses): "NVIDIA's Parakeet card uses CC BY 4.0 … the MagpieTTS card uses the NVIDIA Open Model License."

### ai-history.yml (`learn-ai-history.mdx`)
- Q1 (1955 title): "The proposal is dated August 31, 1955, and uses the phrase in its title".
- Q2 (EO 14434 terminology): "directs agencies … to use 'Super Intelligence' and 'SI' in place of 'Artificial Intelligence' and 'AI'"; "It does not require changing earlier regulations".
- Q3 (Transformer): "It proposed the Transformer, a network built only on attention".

### open-weight-vs-open-source.yml (`learn-open-weight.mdx`)
- Q1 (availability is not permission): "A download link tells you that the files are available, not what you may do with them."
- Q2 (custom agreement): "An MIT License on a repository of inference code covers that code; it says nothing about weights stored elsewhere".
- Q3 (Open-weight tier): "Open-weight: the public can obtain the weights. The license may still restrict use."

### how-to-read-a-model-card.yml (`learn-model-card.mdx`)
- Q1 (the publisher): "Every statement in a card is the publisher's own account".
- Q2 (unknown): "Record a gap as unknown rather than reading it as 'no'".
- Q3 (131,072 in the files): "the shipped config.json sets a maximum of 131,072 positions, and the card's own vLLM serving example uses 131,072 tokens".

### pretraining-and-post-training.yml (`learn-pretraining-and-post-training.mdx`)
- Q1 (continuing text): "That makes it good at continuing text but not tuned to follow instructions."
- Q2 (RLVR): "gives a reward only when the model's answer is verified as correct".
- Q3 (depends on the license): "whether the base model's license follows the result depends on that license".

### training-data-disclosures.yml (`learn-training-data.mdx`)
- Q1 (No, source terms apply): "A license on a compiled dataset does not, by itself, clear every document inside it."
- Q2 (a gap): "When a source does not say something, that is a gap in the disclosure, not evidence of anything else."
- Q3 (still helps): "The description still helps you understand the model."

### hosted-or-local.yml (`learn-hosted-or-local.mdx`)
- Q1 (where, who, whose terms): "what changes is where the computation happens, who can see the inputs, and whose terms apply."
- Q2 (not automatically private): "Local runtimes can still use the network"; "a runtime exposed on a network, or a shared computer, is not automatically private."
- Q3 (neither always cheaper): "Neither is cheaper in every case."

### how-models-use-tools.yml (`learn-how-models-use-tools.mdx`)
- Q1 (writes a request): "The model never executes anything on its own."
- Q2 (results can carry instructions): "Because tool results go straight back into the model's input, they can carry instructions nobody intended".
- Q3 (least privilege): "Since the assistant cannot send mail, the worst outcome here is a bad draft that Riley reads first."

### agents-and-robotics.yml (`learn-agents-robotics.mdx`)
- Q1 (agent application): "Permissions, sandboxes, and approval prompts are implemented here."
- Q2 (configuration-specific): "true only for a given configuration, and a user or administrator can change it."
- Q3 (record cannot claim them): "It shows that the openpi record cannot claim them, and that whoever deploys it must supply them."

### retrieval-augmented-generation.yml (`learn-retrieval-augmented-generation.mdx`)
- Q1 (search and add to prompt): "a search step finds passages in your documents that look relevant to the question and adds them to the prompt."
- Q2 (exact matches): "embedding models 'can miss crucial exact matches,' such as an error code like 'TS-999'".
- Q3 (cross-team leakage): "a shared index can surface one team's files in another team's answers."

### inference-hardware.yml (`learn-inference-hardware.mdx`)
- Q1 (weights plus working memory): "when its weights, plus the working memory it needs while answering, fit in memory"; "Working memory grows with the context length and with the number of requests handled at once."
- Q2 (slower): "a model split between GPU and system memory runs slower."
- Q3 (not necessarily): "A GPU that one runtime supports may not work with another."

### quantization.yml (`learn-quantization.mdx`)
- Q1 (some accuracy): "The cost is accuracy, because each stored number becomes an approximation".
- Q2 (a quarter to a third): "a 4-bit copy is about a quarter to a third the size of the 16-bit original."
- Q3 (publisher or documented, from the original): "Look to the publisher first"; "Prefer files made from the 16- or 32-bit original, not requantized ones."

### ai-content-provenance.yml (`learn-ai-content-provenance.mdx`)
- Q1 (only no credential): "Lee notes that this shows only that no credential is attached."
- Q2 (truth or accuracy): "Provenance alone cannot tell you whether content is true, accurate, or factual".
- Q3 (near chance on short text): "studies finding detectors little better than chance on short passages".

### reading-evaluations.yml (`learn-evaluations.mdx`)
- Q1 (one system, one task set): "how one system performed on one fixed set of tasks under one set of conditions."
- Q2 (reported vs reproduced): "no one else has necessarily rerun it. A reproduced result was obtained again by another party from published materials".
- Q3 (not comparable): "A 4.0 result is not directly comparable with one on an earlier version."

### safety-testing-and-frameworks.yml (`learn-safety-testing-and-frameworks.mdx`)
- Q1 (developer's account): "All of these are written by the developer about its own work, so read them as its account".
- Q2 (lower bound): "treats any single test as 'a lower bound, rather than a ceiling'".
- Q3 (company policy with thresholds): "a company policy that sets capability thresholds and says what the company will do when a model reaches one."

### how-the-ecosystem-fits-together.yml (`learn-ecosystem.mdx`)
- Q1 (overlap): "Because an organization appears under every role it has, role lists overlap and should not be added together."
- Q2 (no change): "Its reliance on outside foundries does not change that, and it does not make those foundries catalog members."
- Q3 (Deep Cogito's work only): "That covers Deep Cogito's work only; the DeepSeek base model is recorded as provenance".

### careers-in-ai.yml (`learn-careers-in-ai.mdx`)
- Q1 (several occupations): "One AI job title often maps to several official occupations, so the duties matter more than the name."
- Q2 (master's or higher): "research scientists typically need a master's degree or higher, though some federal jobs accept a bachelor's".
- Q3 (employer's site): "USASI does not employ or recruit for these organizations and collects no applications"; "Apply on the employer's own site."

### infrastructure-and-energy-claims.yml (`learn-infrastructure-claims.mdx`)
- Q1 (power vs energy): watts "measure power at a specific moment," while watthours measure "how much electricity is used over a period of time."
- Q2 (contract, not operating): "That describes a contract and expected deliveries, not operating capacity."
- Q3 (only where based): "A headquarters tells you where a company is based, not where its computing runs or how much power it uses."

### ai-and-your-data.yml (`learn-ai-and-your-data.mdx`)
- Q1 (separate step): "Turning training off is a separate step from deleting chats".
- Q2 (out of training, copy kept): "Temporary or incognito chats are kept out of training, but providers still keep a copy for 72 hours to 30 days".
- Q3 (business terms): "Read the business terms that match your plan, not the consumer pages"; "personal accounts bring consumer terms."

### policy-and-standards-sources.yml (`learn-policy-sources.mdx`)
- Q1 (pointer, not the document): "can point you to one of these, but it is not the document itself."
- Q2 (compilations can be out of date): "A compilation can reprint text that is no longer in effect."
- Q3 (voluntary agency guidance): "Agency guidance: frameworks, profiles, and guidelines that an agency publishes, often for voluntary use. The AI RMF is one."

## Uncertain or worth a second look

- `ai-history` Q2 and `policy-and-standards-sources` Q2 cover executive orders. The answers describe only what the explainers say about those orders, with no added commentary.
- `hosted-or-local` Q3 is about cost. It uses no figures and repeats the explainer's point that the answer depends on the reader's situation.
- `infrastructure-and-energy-claims` Q2 quotes the filing's wording but leaves out its megawatt figure. This follows the explainer, which does not republish power figures either.
- `ai-history`, `ai-and-your-data` and others contain dates and day counts. They are used only where the page's point depends on them, such as the proposal date coming before the 1956 meeting, or a temporary chat being kept for a limited period.
