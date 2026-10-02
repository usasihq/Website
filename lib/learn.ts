/** Explainers: short, sourced guides. Content lives in content/pages/<file>.mdx. */
export type Explainer = { slug: string; title: string; question: string; reviewed: string };

export const EXPLAINERS: Explainer[] = [
  { slug: "open-weight-vs-open-source", title: "What open weight and open source actually mean", question: "If I can download a model, what am I allowed to do with it?", reviewed: "2026-10-01" },
  { slug: "how-to-read-a-model-card", title: "How to read a model card", question: "What should I check before relying on a model?", reviewed: "2026-10-01" },
  { slug: "hosted-or-local", title: "Choosing hosted access or local inference", question: "Should I use an API or run a model on my own machine?", reviewed: "2026-10-01" },
  { slug: "inference-hardware", title: "Understanding inference hardware", question: "What determines whether a model can run on my hardware?", reviewed: "2026-10-01" },
  { slug: "reading-evaluations", title: "How to read an AI evaluation", question: "What can a benchmark result tell me about my own task?", reviewed: "2026-10-01" },
  { slug: "training-data-disclosures", title: "Understanding training data disclosures", question: "What does a provider reveal about the material used to train a model?", reviewed: "2026-10-01" },
  { slug: "how-the-ecosystem-fits-together", title: "How the American AI ecosystem fits together", question: "How do chips, compute providers, labs, software projects, and application companies connect?", reviewed: "2026-10-01" },
  { slug: "agents-and-robotics", title: "Agents and robotics without the hype", question: "What changes when an AI system can use tools or act in the physical world?", reviewed: "2026-10-01" },
  { slug: "infrastructure-and-energy-claims", title: "Reading AI infrastructure and energy claims", question: "What does a data-center announcement tell us about actual operating capacity?", reviewed: "2026-10-01" },
  { slug: "policy-and-standards-sources", title: "Finding AI policy and standards sources", question: "Where can I find the original text behind a policy claim?", reviewed: "2026-10-01" },
];

export const explainer = (slug: string) => EXPLAINERS.find((e) => e.slug === slug);
