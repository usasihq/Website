/**
 * Explainers: short, sourced guides. Content lives in content/pages/<file>.mdx
 * and is imported statically in app/learn/content.ts.
 *
 * Takeaways restate what each explainer itself says; they add no new claims.
 * EXPLAINERS is in course order: topics in TOPICS order, and within a topic
 * from introductory to more detailed. Previous/next links follow this order.
 */
export type TopicId = "basics" | "models-and-licenses" | "running-ai" | "evidence" | "industry" | "policy";
export type Level = "Beginner" | "Intermediate";

export type Explainer = {
  slug: string;
  /** MDX file name in content/pages, without the extension. */
  file: string;
  title: string;
  question: string;
  reviewed: string;
  topic: TopicId;
  level: Level;
  takeaways: [string, string, string];
  /** File in research/verification/ recording a separate sentence-by-sentence source check, if one was done. */
  factCheck?: string;
};

export type Topic = { id: TopicId; title: string; description: string };

export const TOPICS: Topic[] = [
  { id: "basics", title: "AI basics", description: "How language models work, the words people use about them, and where today's AI came from." },
  { id: "models-and-licenses", title: "Models, licenses, and openness", description: "What a model release contains, what you may do with it, and how it was made." },
  { id: "running-ai", title: "Using and running AI", description: "Hosted services and local inference, hardware, tools, retrieval, and agents." },
  { id: "evidence", title: "Evidence, testing, and trust", description: "How to read benchmark results, safety documents, and claims about AI-made content." },
  { id: "industry", title: "Industry, infrastructure, and careers", description: "The organizations behind AI, the data centers it runs in, and the jobs around it." },
  { id: "policy", title: "Policy and privacy", description: "Finding the original text of policies and standards, and what happens to your data." },
];

export const EXPLAINERS: Explainer[] = [
  {
    slug: "how-language-models-work",
    file: "learn-how-language-models-work",
    title: "How large language models work",
    question: "What happens between typing a prompt and getting an answer?",
    reviewed: "2026-10-08",
    factCheck: "round4-verify-foundations.md",
    topic: "basics",
    level: "Beginner",
    takeaways: [
      "A model is a file of learned numbers, called weights, plus an architecture; training adjusts the weights so the model gets better at predicting the next token.",
      "A reply is built one token at a time: the model scores every possible next token, a setting such as temperature shapes the pick, and the loop repeats.",
      "Fluent output can still be wrong; Anthropic's guide says its techniques reduce hallucinations but do not eliminate them, so validate critical information.",
    ],
  },
  {
    slug: "tokens-and-context-windows",
    file: "learn-tokens-and-context-windows",
    title: "Tokens and context windows",
    question: "Why do AI tools count tokens, and what happens when a conversation gets too long?",
    reviewed: "2026-10-08",
    factCheck: "round4-verify-foundations.md",
    topic: "basics",
    level: "Beginner",
    takeaways: [
      "A token is a chunk of text, often a word or part of one; different models can use different tokenizers, so the same text can count differently.",
      "In a chat, the context window must hold the system prompt, the whole conversation, attached files, tool definitions, and the reply being generated.",
      "When a conversation outgrows the window, APIs may refuse or truncate, and some tools drop or summarize older turns, so early material may drop out of view.",
    ],
  },
  {
    slug: "multimodal-models",
    file: "learn-multimodal-models",
    title: "Multimodal models: text, images, audio, and video",
    question: "How do models that see and hear differ from text-only models?",
    reviewed: "2026-10-08",
    factCheck: "round4-verify-context.md",
    topic: "basics",
    level: "Intermediate",
    takeaways: [
      "A modality is a kind of data; a model that reads images or audio may still write only text, so check a card's input and output lists separately.",
      "Images and audio are usually converted into tokens, often by a separate encoder, before the language model reads them alongside text.",
      "Terms can differ by modality: Llama 4's use policy withholds license rights for its multimodal models from EU-based individuals and companies.",
    ],
  },
  {
    slug: "ai-history",
    file: "learn-ai-history",
    title: "A short history of AI in the United States",
    question: "Where did today's AI come from?",
    reviewed: "2026-10-08",
    factCheck: "round4-verify-context.md",
    topic: "basics",
    level: "Beginner",
    takeaways: [
      "A proposal dated August 31, 1955, used \"artificial intelligence\" in the title of a planned 1956 summer study at Dartmouth College.",
      "Defense research agencies backed projects from the Shakey robot, which ARPA began supporting in 1966, to DARPA's driverless vehicle races of 2004 to 2007.",
      "A 2021 federal law defines AI, and a September 29, 2026 executive order tells federal agencies to use \"Super Intelligence\" in its place in their own documents.",
    ],
  },
  {
    slug: "open-weight-vs-open-source",
    file: "learn-open-weight",
    title: "What open weight and open source actually mean",
    question: "If I can download a model, what am I allowed to do with it?",
    reviewed: "2026-10-01",
    topic: "models-and-licenses",
    level: "Beginner",
    takeaways: [
      "A download link shows that the files are available, not what you may do with them.",
      "Weights, code, data, and documentation can each come with their own license or use policy.",
      "Read the license for the weights and any policy it brings in; a code license does not cover the weights.",
    ],
  },
  {
    slug: "how-to-read-a-model-card",
    file: "learn-model-card",
    title: "How to read a model card",
    question: "What should I check before relying on a model?",
    reviewed: "2026-10-01",
    topic: "models-and-licenses",
    level: "Beginner",
    takeaways: [
      "A model card is the publisher's own account of what a model is, how it was made, and where it falls short.",
      "Pin down the exact release and maintainer, then read the intended uses, limitations, base model, and data.",
      "Appearing on a model hub does not mean anyone else has checked what a card says.",
    ],
  },
  {
    slug: "pretraining-and-post-training",
    file: "learn-pretraining-and-post-training",
    title: "Pretraining, fine-tuning, and post-training",
    question: "How does a raw model become an assistant, and what does it mean when one model is built on another?",
    reviewed: "2026-10-08",
    factCheck: "round4-verify-making-models.md",
    topic: "models-and-licenses",
    level: "Intermediate",
    takeaways: [
      "A base model is pretrained to predict the next token; post-training stages such as SFT, preference tuning, and RLVR then shape how it responds.",
      "The Llama 3.1 license sets conditions on distributed derivatives, such as a name starting with \"Llama\"; Apache 2.0 lets you license your changes differently.",
      "A card's base_model field may name only the previous stage, so follow the chain and confirm the base in the technical report.",
    ],
  },
  {
    slug: "training-data-disclosures",
    file: "learn-training-data",
    title: "Understanding training data disclosures",
    question: "What does a provider reveal about the material used to train a model?",
    reviewed: "2026-10-01",
    topic: "models-and-licenses",
    level: "Intermediate",
    takeaways: [
      "A disclosure can range from named, downloadable datasets to a short list of broad data types.",
      "Ask which datasets were used, where the data came from, whether you can obtain it, and under what terms.",
      "When a disclosure says nothing about something, that is a gap in the disclosure, not evidence either way.",
    ],
  },
  {
    slug: "hosted-or-local",
    file: "learn-hosted-or-local",
    title: "Choosing hosted access or local inference",
    question: "Should I use an API or run a model on my own machine?",
    reviewed: "2026-10-01",
    topic: "running-ai",
    level: "Beginner",
    takeaways: [
      "Hosted access sends your inputs to a provider; local inference runs downloaded weights on hardware you control.",
      "With hosted access, the provider's data policy sets the privacy boundary, so read its current version.",
      "Local tools can still use the network for downloads, telemetry, or cloud features, so check their settings.",
    ],
  },
  {
    slug: "how-models-use-tools",
    file: "learn-how-models-use-tools",
    title: "How AI models use tools",
    question: "What actually happens when a chatbot searches the web, runs code, or calls an app?",
    reviewed: "2026-10-08",
    factCheck: "round4-verify-using-ai.md",
    topic: "running-ai",
    level: "Intermediate",
    takeaways: [
      "A model never runs a tool itself: it returns a structured request, and the application, or the provider for hosted tools, runs it and returns the result.",
      "Web pages, files, and other tool results can carry prompt injection, and OWASP says it is unclear whether any method fully prevents it.",
      "MCP's security principles say hosts must get user consent before invoking any tool, but the protocol cannot enforce this, so implementors should build it in.",
    ],
  },
  {
    slug: "agents-and-robotics",
    file: "learn-agents-robotics",
    title: "Agents and robotics without the hype",
    question: "What changes when an AI system can use tools or act in the physical world?",
    reviewed: "2026-10-01",
    topic: "running-ai",
    level: "Beginner",
    takeaways: [
      "Separate the model, the agent application that runs it with tools, and, for robots, the hardware and surroundings.",
      "Permissions and human approval are settings in specific software, documented or not in specific sources.",
      "A catalog record usually describes one component, so check that component's own documentation.",
    ],
  },
  {
    slug: "retrieval-augmented-generation",
    file: "learn-retrieval-augmented-generation",
    title: "Retrieval-augmented generation (RAG)",
    question: "How do AI systems answer questions about documents they were never trained on?",
    reviewed: "2026-10-08",
    factCheck: "round4-verify-using-ai.md",
    topic: "running-ai",
    level: "Intermediate",
    takeaways: [
      "RAG searches your documents for passages related to a question and adds them to the prompt, so the model can answer from them without retraining.",
      "Retrieval can miss the right passage or return conflicting versions, and the model can still misread them, so test retrieval and answers separately.",
      "An index is another copy of your documents: check a hosted provider's retention terms, or run embeddings and search on your own hardware.",
    ],
  },
  {
    slug: "inference-hardware",
    file: "learn-inference-hardware",
    title: "Understanding inference hardware",
    question: "What determines whether a model can run on my hardware?",
    reviewed: "2026-10-01",
    topic: "running-ai",
    level: "Intermediate",
    takeaways: [
      "A model runs when its weights and working memory fit in memory the runtime can use, on hardware it supports.",
      "Weight size depends on the parameter count and the precision; quantization lowers precision to save memory.",
      "Fitting is not the same as running well: treat any single memory figure as a starting point, then test.",
    ],
  },
  {
    slug: "quantization",
    file: "learn-quantization",
    title: "Quantization: fitting models on smaller hardware",
    question: "How can a large model run on a laptop, and what do you give up?",
    reviewed: "2026-10-08",
    factCheck: "round4-verify-making-models.md",
    topic: "running-ai",
    level: "Intermediate",
    takeaways: [
      "Quantization stores weights in fewer bits, so a 4-bit file is about a quarter to a third the size of the 16-bit original.",
      "llama.cpp says quantization may introduce some accuracy loss, usually measured with perplexity and KL divergence; test a quantized model on your own tasks.",
      "Prefer quantized files from the publisher or a source that documents how they were made, and files made from the 16- or 32-bit original, not requantized.",
    ],
  },
  {
    slug: "ai-content-provenance",
    file: "learn-ai-content-provenance",
    title: "Labels, watermarks, and content credentials",
    question: "How can you tell whether an image, video, audio clip, or text was made with AI?",
    reviewed: "2026-10-08",
    factCheck: "round4-verify-trust.md",
    topic: "evidence",
    level: "Beginner",
    takeaways: [
      "No single test reliably shows whether content was made with AI; Content Credentials, watermarks, and detectors can each miss.",
      "Content Credentials record how a file was made and edited, but they can be stripped, so a file without them proves nothing either way.",
      "Watermark checks find only marks from tools that add them, and AI detectors make errors, especially on short text and writing by non-native English speakers.",
    ],
  },
  {
    slug: "reading-evaluations",
    file: "learn-evaluations",
    title: "How to read an AI evaluation",
    question: "What can a benchmark result tell me about my own task?",
    reviewed: "2026-10-01",
    topic: "evidence",
    level: "Intermediate",
    takeaways: [
      "A benchmark result describes one system on one fixed set of tasks under one set of conditions.",
      "Check the tasks, scoring, model version, prompting, attempts, variation, and possible training-data overlap.",
      "A result its publisher reports is not the same as one that someone else has reproduced.",
    ],
  },
  {
    slug: "safety-testing-and-frameworks",
    file: "learn-safety-testing-and-frameworks",
    title: "How AI developers test models for safety",
    question: "What are system cards, red teaming, and frontier safety frameworks, and how should I read them?",
    reviewed: "2026-10-08",
    factCheck: "round4-verify-trust.md",
    topic: "evidence",
    level: "Intermediate",
    takeaways: [
      "System cards, red-team results, and safety frameworks are written by the developer about its own work, so read them as the developer's account.",
      "Anthropic, OpenAI, Google DeepMind, and Meta each publish a framework setting capability thresholds and what the company will do when a model reaches one.",
      "Signs of an independent check include named outside testers and their access, reviewers publishing in their own words, and methods others can re-run.",
    ],
  },
  {
    slug: "how-the-ecosystem-fits-together",
    file: "learn-ecosystem",
    title: "How the American AI ecosystem fits together",
    question: "How do chips, compute providers, labs, software projects, and application companies connect?",
    reviewed: "2026-10-01",
    topic: "industry",
    level: "Beginner",
    takeaways: [
      "AI products rest on layers: chips, compute providers, model developers, open-source software, and applications.",
      "Many organizations work in more than one layer, and much of the work depends on contributors in other countries.",
      "USASI catalogs organizations with a documented U.S. basis; it does not claim the supply chain is all American.",
    ],
  },
  {
    slug: "careers-in-ai",
    file: "learn-careers-in-ai",
    title: "Careers in AI: roles, skills, and paths",
    question: "What kinds of jobs exist around AI, and how do people prepare for them?",
    reviewed: "2026-10-08",
    factCheck: "round4-verify-people.md",
    topic: "industry",
    level: "Beginner",
    takeaways: [
      "AI work includes research, software, data, chip design, infrastructure, data-center, electrical, product, policy, legal, safety, and evaluation roles.",
      "AI job titles rarely match one official occupation, so compare a posting's duties with the BLS Occupational Outlook Handbook and O*NET.",
      "Routes in include degrees, registered apprenticeships, and two-year college programs; separate a posting's requirements from its preferences.",
    ],
  },
  {
    slug: "infrastructure-and-energy-claims",
    file: "learn-infrastructure-claims",
    title: "Reading AI infrastructure and energy claims",
    question: "What does a data-center announcement tell us about actual operating capacity?",
    reviewed: "2026-10-01",
    topic: "industry",
    level: "Intermediate",
    takeaways: [
      "A data-center announcement usually describes plans, not computing that is running today.",
      "Separate the stage, the quantity (power or energy), the boundary, and who owns, operates, and uses the site.",
      "Note the date a statement applies to; a company's headquarters answers none of these questions.",
    ],
  },
  {
    slug: "ai-and-your-data",
    file: "learn-ai-and-your-data",
    title: "What happens to what you type into an AI service",
    question: "Does an AI service keep my conversations or use them to train its models?",
    reviewed: "2026-10-08",
    factCheck: "round4-verify-people.md",
    topic: "policy",
    level: "Beginner",
    takeaways: [
      "Consumer AI apps often let the provider train on your chats unless you opt out; business, school, and API versions usually exclude your content by default.",
      "Turning training off is separate from deleting chats, and temporary or incognito chats are still kept for 72 hours to 30 days in this page's consumer examples.",
      "Terms differ by product, plan, account, and app version and they change, so note the date and scope of any policy page you rely on.",
    ],
  },
  {
    slug: "policy-and-standards-sources",
    file: "learn-policy-sources",
    title: "Finding AI policy and standards sources",
    question: "Where can I find the original text behind a policy claim?",
    reviewed: "2026-10-01",
    topic: "policy",
    level: "Intermediate",
    takeaways: [
      "Name the document type first: a law, a regulation, an executive order, agency guidance, or a standard.",
      "On the original text, check its date, whom it applies to, its status, and whether something replaced it.",
      "Names, addresses, and terms change, so keep the URL and date of the version you actually read.",
    ],
  },
];

export const explainer = (slug: string) => EXPLAINERS.find((e) => e.slug === slug);
export const topic = (id: TopicId) => TOPICS.find((t) => t.id === id)!;

/** Explainers grouped by topic, in TOPICS order; topics with no explainers are left out. */
export function explainersByTopic(): { topic: Topic; explainers: Explainer[] }[] {
  return TOPICS.map((t) => ({ topic: t, explainers: EXPLAINERS.filter((e) => e.topic === t.id) })).filter((g) => g.explainers.length > 0);
}

/** Previous and next explainers in course order. */
export function adjacentExplainers(slug: string): { prev?: Explainer; next?: Explainer } {
  const i = EXPLAINERS.findIndex((e) => e.slug === slug);
  if (i < 0) return {};
  return { prev: EXPLAINERS[i - 1], next: EXPLAINERS[i + 1] };
}

/** Up to `n` other explainers in the same topic, then from neighbouring topics. */
export function relatedExplainers(slug: string, n = 3): Explainer[] {
  const self = explainer(slug);
  if (!self) return [];
  const same = EXPLAINERS.filter((e) => e.topic === self.topic && e.slug !== slug);
  const order = TOPICS.map((t) => t.id);
  const near = EXPLAINERS.filter((e) => e.topic !== self.topic).sort(
    (a, b) => Math.abs(order.indexOf(a.topic) - order.indexOf(self.topic)) - Math.abs(order.indexOf(b.topic) - order.indexOf(self.topic)),
  );
  return [...same, ...near].slice(0, n);
}

/* ------------------------------------------------------------------ */
/* Learning paths                                                      */
/* ------------------------------------------------------------------ */

export type PathStep =
  | { kind: "explainer"; slug: string; note: string }
  | { kind: "hub"; slug: string; note: string }
  | { kind: "page"; href: string; label: string; note: string };

export type LearningPath = {
  id: string;
  title: string;
  audience: string;
  description: string;
  steps: PathStep[];
};

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "new-to-ai",
    title: "New to AI",
    audience: "For anyone starting from scratch",
    description: "What a language model is, how it reads and writes, what happens to what you type, and how to look up a model before you use it.",
    steps: [
      { kind: "explainer", slug: "how-language-models-work", note: "Start here: what happens between a prompt and an answer." },
      { kind: "explainer", slug: "tokens-and-context-windows", note: "The unit models read and write, and why length limits matter." },
      { kind: "explainer", slug: "multimodal-models", note: "Models that work with images, audio, and video as well as text." },
      { kind: "explainer", slug: "ai-and-your-data", note: "What a service may keep, and how to check its policy." },
      { kind: "explainer", slug: "how-to-read-a-model-card", note: "How to check a specific model before relying on it." },
      { kind: "page", href: "/glossary/", label: "Glossary", note: "Look up any term you meet along the way." },
    ],
  },
  {
    id: "choosing-and-running-models",
    title: "Choosing and running a model",
    audience: "For people who want to download or self-host a model",
    description: "Read the license, check the model card, decide between hosted and local, and work out whether a model fits your hardware.",
    steps: [
      { kind: "explainer", slug: "open-weight-vs-open-source", note: "What a download does and does not let you do." },
      { kind: "explainer", slug: "how-to-read-a-model-card", note: "Pin down the exact release and its stated limits." },
      { kind: "explainer", slug: "hosted-or-local", note: "Privacy, maintenance, and cost on each side." },
      { kind: "explainer", slug: "inference-hardware", note: "Memory, precision, and runtime support." },
      { kind: "explainer", slug: "quantization", note: "How smaller files trade precision for memory." },
      { kind: "hub", slug: "local-ai", note: "Runtimes, frameworks, and models documented for local use." },
    ],
  },
  {
    id: "building-with-ai",
    title: "Building with AI",
    audience: "For developers and technical teams",
    description: "How models call tools, answer from your documents, run as agents, and get adapted through fine-tuning.",
    steps: [
      { kind: "explainer", slug: "how-models-use-tools", note: "Function calling, hosted tools, and the Model Context Protocol." },
      { kind: "explainer", slug: "retrieval-augmented-generation", note: "Answering from documents a model was not trained on." },
      { kind: "explainer", slug: "agents-and-robotics", note: "Where permissions and human approval actually live." },
      { kind: "explainer", slug: "pretraining-and-post-training", note: "How base models become assistants, and what fine-tuning changes." },
      { kind: "hub", slug: "agents", note: "Agent protocols, SDKs, and coding agents in the catalog." },
      { kind: "hub", slug: "developer-tools", note: "Libraries, inference servers, and SDKs." },
    ],
  },
  {
    id: "checking-claims",
    title: "Checking claims about AI",
    audience: "For journalists, researchers, students, and policy readers",
    description: "Read benchmark results, safety documents, content labels, data disclosures, infrastructure announcements, and policy texts with care.",
    steps: [
      { kind: "explainer", slug: "reading-evaluations", note: "What a benchmark result can and cannot show." },
      { kind: "explainer", slug: "safety-testing-and-frameworks", note: "System cards, red teaming, and published safety frameworks." },
      { kind: "explainer", slug: "ai-content-provenance", note: "Labels, watermarks, and content credentials." },
      { kind: "explainer", slug: "training-data-disclosures", note: "What a provider reveals about training data." },
      { kind: "explainer", slug: "infrastructure-and-energy-claims", note: "Plans, power, and operating capacity." },
      { kind: "explainer", slug: "policy-and-standards-sources", note: "Finding and dating the original policy text." },
    ],
  },
  {
    id: "understanding-the-industry",
    title: "Understanding the industry",
    audience: "For readers who want the big picture",
    description: "Where today's AI came from, how chips, compute, labs, and software fit together, and the work people do in the field.",
    steps: [
      { kind: "explainer", slug: "ai-history", note: "A short, sourced history from 1955 to today." },
      { kind: "explainer", slug: "how-the-ecosystem-fits-together", note: "The layers from chips to applications." },
      { kind: "hub", slug: "foundation-models", note: "The labs that build general-purpose models." },
      { kind: "hub", slug: "chips-and-compute", note: "Chip designers, accelerators, and cloud providers." },
      { kind: "explainer", slug: "careers-in-ai", note: "Roles, skills, and ways into the field." },
      { kind: "page", href: "/jobs/", label: "Jobs", note: "Current openings at organizations in the catalog." },
    ],
  },
];

export const learningPath = (id: string) => LEARNING_PATHS.find((p) => p.id === id);

/** Steps whose target exists (an explainer in the registry, or a published hub). */
export function availableSteps(path: LearningPath, hubSlugs: Set<string>): PathStep[] {
  return path.steps.filter((s) => (s.kind === "explainer" ? Boolean(explainer(s.slug)) : s.kind === "hub" ? hubSlugs.has(s.slug) : true));
}

/** Paths that include an explainer. */
export const pathsForExplainer = (slug: string) => LEARNING_PATHS.filter((p) => p.steps.some((s) => s.kind === "explainer" && s.slug === slug));
