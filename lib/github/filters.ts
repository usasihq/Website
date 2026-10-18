/**
 * Inclusion rules for AI on GitHub. Pure functions, shared by the refresh
 * script, validation, and tests. Each rule is a transparent text test on the
 * repository's own name, description, and topics; a small reviewed denylist
 * (data/github/denylist.yml) covers what the rules miss, with a reason per entry.
 */
import type { DenylistEntry, GithubProject } from "./schema";

/** Raw repository item as returned by GET /search/repositories. Only the fields we read. */
export type RawRepo = {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string; type: string } | null;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  license: { spdx_id: string | null; name: string | null } | null;
  topics?: string[];
  created_at: string;
  pushed_at: string;
  default_branch: string;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
};

export const EXCLUSION_REASONS = {
  fork: "Fork of another repository",
  archived: "Archived or disabled by its owner",
  list: "Curated list or collection of links",
  education: "Course, tutorial, book, interview prep, or roadmap",
  prompts: "Collected or leaked system prompts, or jailbreaks",
  deepfake: "Deepfake or face-swap tool",
  "non-ai": "Mainly not an AI project",
  other: "Excluded on review (see denylist note)",
} as const;
export type ExclusionReason = keyof typeof EXCLUSION_REASONS;

const lower = (s: string | null | undefined) => (s ?? "").toLowerCase();

/** Remove GitHub :shortcode: emoji, collapse whitespace, trim to max characters on a word boundary. */
export function cleanDescription(raw: string | null | undefined, max = 300): string {
  let s = (raw ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/:[a-z0-9_+-]{2,40}:/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (s.length > max) {
    const cut = s.slice(0, max - 1);
    const space = cut.lastIndexOf(" ");
    s = `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:–—-]+$/, "")}…`;
  }
  return s;
}

const LIST_DESC = /\b(curated|awesome)\s+(list|collection|resources?)\b|\b(a |the )?(list|collection|compilation) of\b.*\b(links|resources|papers|projects|tools|repositories|repos|apps|websites|ai tools|frameworks|libraries)\b|^\W*(a |the )?(curated |comprehensive )?list of\b|\bawesome[- ]list\b|\bpaper ?list\b|\breading list\b|(论文|资源|项目|工具)(合集|大全|汇总)|导航大全/i;
const EDU_WORDS = /\b(course|courses|coursework|tutorials?|textbook|e-?book|book|books|handbook|interview|interviews|roadmaps?|lectures?|lecture notes|curriculum|syllabus|cheat ?sheets?|study notes|learning notes|lessons|bootcamp|homework|exercises|for beginners|beginner's guide|learning path|study guide|study plan|studying|cookbook|e-learning|\d+(st|nd|rd|th) edition)\b|教程|课程|笔记|学习路线|面试|电子书|入门|学习资料|精读|原书/i;
const EDU_TOPICS = new Set(["course", "courses", "tutorial", "tutorials", "book", "books", "ebook", "interview", "interview-questions", "interview-preparation", "roadmap", "lecture-notes", "curriculum", "education", "learning-resources", "cheatsheet"]);
const PROMPT_RE = /\bsystem[ _-]?prompts?\b.*\b(leak|leaked|collect|collection|extracted|full|official|of)\b|\b(leaked|leaks?)\b.*\bprompts?\b|(?<!\b(no|without|zero)[ -])\bjailbreak|\bdan prompt/i;
const DEFENSIVE = /\b(detect|detection|defen[cs]e|defend|guard|guardrails?|protect|protection|scanner|scan|red[- ]?team|security|safety|robustness|evaluat|adversar|emulation|pentest|malicious)/i;
const DEEPFAKE_RE = /\bdeep[- ]?fakes?\b|\bface[- ]?swap|\bfaceswap|\bface[- ]?swapping|\bdeep-live-cam\b/i;

/** Signals that a repository is about AI/ML. A repository needs at least one. */
const AI_TEXT = /\b(a\.?i\.?|ai-powered|artificial intelligence|machine[- ]learning|ml|deep[- ]learning|neural|llms?|vlms?|gpts?|chatgpt|language models?|foundation models?|transformers?|diffusion|agents?|agentic|chatbots?|openai|anthropic|claude|gemini|llama|mistral|qwen|deepseek|ollama|rag|retrieval|embeddings?|vector (database|search|store)|inference|models?|training|fine-?tun\w*|computer vision|vision|nlp|natural language|speech|tts|asr|text[- ]to[- ](speech|image|video)|speech[- ]to[- ]text|whisper|ocr|reinforcement|tensors?|pytorch|tensorflow|jax|keras|onnx|cuda|gpus?|copilot|generative|genai|image generation|segmentation|object detection|yolo|recognition|classification|predict\w*|mlops|data science|autonomous|robot\w*|mcp|prompts?|tokens?|multimodal|semantic)\b/i;
const AI_TOPICS = new Set([
  "artificial-intelligence", "machine-learning", "deep-learning", "llm", "llms", "large-language-models", "ai-agents", "agents",
  "generative-ai", "llmops", "rag", "transformers", "pytorch", "diffusion", "stable-diffusion", "computer-vision", "nlp",
  "reinforcement-learning", "mlops", "ai", "chatgpt", "openai", "local-llm", "inference", "speech-recognition", "text-to-speech",
  "multimodal", "neural-network", "neural-networks", "tensorflow", "llama", "gpt", "langchain", "mcp", "agent", "ml",
]);

/** Ordered rules. The first that matches gives the reason. */
export function exclusionReason(repo: RawRepo, denylist: Map<string, DenylistEntry> = new Map(), reviewedAi: ReadonlySet<string> = new Set()): ExclusionReason | null {
  if (repo.fork) return "fork";
  if (repo.archived || repo.disabled) return "archived";
  const denied = denylist.get(lower(repo.full_name));
  if (denied) return denied.reason;
  const name = lower(repo.name);
  const desc = cleanDescription(repo.description, 2000);
  const topics = (repo.topics ?? []).map(lower);
  const text = `${name.replace(/[-_.]/g, " ")} ${desc}`;
  if (/^awesome|[-_]awesome$|awesome[-_]/.test(name) || topics.includes("awesome-list") || topics.includes("awesome") || LIST_DESC.test(desc)) return "list";
  if (EDU_WORDS.test(text) || topics.some((t) => EDU_TOPICS.has(t))) return "education";
  // Topics alone are not enough for these two ("jailbreak" also means unlocking phones; face tools tag "deepfake").
  if (PROMPT_RE.test(text) || topics.some((t) => t === "system-prompts" || t === "leaked-prompts" || t === "llm-jailbreak" || t === "chatgpt-jailbreak" || t === "ai-jailbreak" || t === "jailbreak-prompts")) {
    if (!DEFENSIVE.test(desc)) return "prompts";
  }
  const swapTopic = topics.some((t) => t === "face-swap" || t === "faceswap") || (topics.includes("deepfake") && /\b(swap|manipulat)/i.test(desc));
  if (DEEPFAKE_RE.test(text) || swapTopic) {
    if (!DEFENSIVE.test(desc)) return "deepfake";
  }
  if (!AI_TEXT.test(text) && !topics.some((t) => AI_TOPICS.has(t)) && !reviewedAi.has(lower(repo.full_name))) return "non-ai";
  return null;
}

/** Map a raw search item to the stored record (factual fields only). */
export function toProject(repo: RawRepo): GithubProject {
  const homepage = (repo.homepage ?? "").trim();
  const spdx = repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION" ? repo.license.spdx_id : null;
  const licenseName = repo.license?.name && repo.license.name !== "Other" ? repo.license.name : repo.license?.name ? "Other" : null;
  return {
    id: repo.id,
    full_name: repo.full_name,
    owner: repo.owner?.login ?? repo.full_name.split("/")[0],
    owner_type: repo.owner?.type === "Organization" ? "Organization" : "User",
    name: repo.name,
    description: cleanDescription(repo.description),
    html_url: repo.html_url,
    homepage: /^https:\/\/[^\s<>"']+$/.test(homepage) && homepage.length <= 400 ? homepage : null,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    open_issues: repo.open_issues_count,
    language: repo.language || null,
    license_spdx: spdx,
    license_name: licenseName,
    topics: (repo.topics ?? []).filter((t) => /^[a-z0-9][a-z0-9-]{0,49}$/.test(t)).slice(0, 20),
    created_at: new Date(repo.created_at).toISOString().replace(/\.\d{3}Z$/, "Z"),
    pushed_at: new Date(repo.pushed_at).toISOString().replace(/\.\d{3}Z$/, "Z"),
    default_branch: repo.default_branch,
  };
}

export function compareProjects(a: Pick<GithubProject, "stars" | "full_name">, b: Pick<GithubProject, "stars" | "full_name">): number {
  return b.stars - a.stars || a.full_name.localeCompare(b.full_name);
}

/** owner--repo, lowercase, [a-z0-9-] only; "--" appears only as the separator. */
export function baseSlug(fullName: string): string {
  const part = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "x";
  const [owner, repo = ""] = fullName.split("/");
  return `${part(owner)}--${part(repo)}`;
}

/** Slugs for a ranked list; a collision (e.g. foo.js vs foo-js) gets -2, -3 … in rank order. */
export function assignSlugs(projects: readonly Pick<GithubProject, "full_name">[]): string[] {
  const used = new Set<string>();
  return projects.map((p) => {
    const base = baseSlug(p.full_name);
    let slug = base;
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
    used.add(slug);
    return slug;
  });
}
