/**
 * Matching for the "Find AI for my needs" finder. Pure functions so the logic
 * is unit-tested and explainable: every result lists the reasons it matches,
 * the points to check, and the reasons it does not fit.
 */
import type { FinderConfig, FinderTask } from "./schema";

export const TASK_LABELS: Record<FinderTask, string> = {
  "write-code": "Write code",
  "work-with-documents": "Work with my documents",
  "transcribe-audio": "Transcribe recordings",
  "chat-and-write": "Chat, ask questions, and write",
};

export type Where = "local" | "hosted" | "either";
export type Os = "windows" | "macos" | "linux" | "";
export type Gpu = "nvidia" | "amd" | "apple-silicon" | "intel" | "none" | "";
export type Skill = "beginner" | "intermediate" | "advanced";
export type Charges = "none" | "subscription" | "any";

export type FinderInput = {
  task: FinderTask | "";
  where: Where;
  os: Os;
  gpu: Gpu;
  gpuGb: number | null;
  ramGb: number | null;
  skill: Skill;
  charges: Charges;
  account: boolean;
};

export const DEFAULT_INPUT: FinderInput = { task: "", where: "either", os: "", gpu: "", gpuGb: null, ramGb: null, skill: "intermediate", charges: "any", account: true };

export type MemoryVerdict =
  | { kind: "tested"; text: string }
  | { kind: "fits"; text: string }
  | { kind: "too-small"; text: string }
  | { kind: "no-input"; text: string }
  | { kind: "insufficient"; text: string }
  | { kind: "not-applicable"; text: string };

export type Assessment = {
  config: FinderConfig;
  /** "match": every requirement you gave is met; "close": one thing would need to change; "no": more than one. */
  fit: "match" | "close" | "no";
  reasons: string[];
  checks: string[];
  blockers: string[];
  memory: MemoryVerdict;
};

const SKILL_ORDER: Skill[] = ["beginner", "intermediate", "advanced"];
const OS_LABEL: Record<Exclude<Os, "">, string> = { windows: "Windows", macos: "macOS", linux: "Linux" };
const GPU_LABEL: Record<Exclude<Gpu, "">, string> = { nvidia: "NVIDIA", amd: "AMD", "apple-silicon": "Apple silicon", intel: "Intel", none: "no separate graphics card" };

export function memoryVerdict(c: FinderConfig, input: FinderInput): MemoryVerdict {
  if (c.tested) return { kind: "tested", text: `Tested by USASI on ${c.tested.date}: ${c.tested.environment}. ${c.tested.result}` };
  if (c.runs === "hosted") return { kind: "not-applicable", text: "Runs on the provider's servers, so your computer's memory does not limit the model." };
  if (c.runs === "hybrid") return { kind: "not-applicable", text: "The tool runs on your computer, but the model runs on the provider's servers, so your graphics memory does not limit the model." };
  if (!c.memory) return { kind: "insufficient", text: "Insufficient evidence: the publisher does not state a memory figure for a specific variant, so USASI does not estimate one." };
  const need = c.memory.gpu_gb ?? c.memory.system_gb!;
  const unit = c.memory.gpu_gb !== null ? "graphics memory" : "memory";
  // Apple silicon shares one pool of unified memory, entered as system memory. Otherwise compare like with like:
  // a graphics-memory figure with graphics memory, and a memory figure with system memory, never one for the other.
  const unified = input.gpu === "apple-silicon";
  const have = c.memory.gpu_gb !== null ? (unified ? (input.ramGb ?? input.gpuGb) : input.gpuGb) : input.ramGb;
  const ask = c.memory.gpu_gb !== null && !unified ? "graphics memory" : "system memory";
  if (have === null) return { kind: "no-input", text: `The publisher states about ${need} GB of ${unit} for ${c.memory.variant}. Enter your ${ask} to compare.` };
  if (have >= need)
    return { kind: "fits", text: `Estimated to fit, not tested: the publisher's figure for ${c.memory.variant} is about ${need} GB of ${unit}, and you entered ${have} GB.` };
  return { kind: "too-small", text: `Needs a different configuration: the publisher's figure for ${c.memory.variant} is about ${need} GB of ${unit}, and you entered ${have} GB.` };
}

export function assess(c: FinderConfig, input: FinderInput): Assessment {
  const reasons: string[] = [];
  const checks: string[] = [];
  const blockers: string[] = [];
  const local = c.runs === "local";

  if (input.task) reasons.push(`Documented for: ${TASK_LABELS[input.task].toLowerCase()}.`);

  if (input.where === "local") {
    if (c.runs === "local") reasons.push("Runs on your own computer.");
    else if (c.runs === "hybrid") blockers.push("Runs an app on your computer but sends requests to a hosted service.");
    else blockers.push("Runs on the provider's servers, not on your computer.");
  } else if (input.where === "hosted") {
    if (c.runs === "hosted") reasons.push("Hosted: nothing to install on your computer beyond a browser or app.");
    else if (c.runs === "hybrid") reasons.push("Uses a hosted service through an app or tool on your computer.");
    else blockers.push("Runs on your own computer rather than as a hosted service.");
  }

  if (input.os) {
    const ok = c.platforms.values.includes(input.os) || c.platforms.values.includes("web");
    if (ok) reasons.push(c.platforms.values.includes(input.os) ? `Documented for ${OS_LABEL[input.os]}.` : "Works in a web browser.");
    else blockers.push(`Not documented for ${OS_LABEL[input.os]}.`);
  }

  if (local && input.gpu) {
    const acc = c.accelerators.values;
    if (acc.length === 0) checks.push("The documentation does not list supported graphics hardware.");
    else if (input.gpu === "none") {
      if (acc.includes("cpu-only")) reasons.push("Documented to run without a separate graphics card.");
      else blockers.push("The documentation lists graphics hardware; running without it is not documented.");
    } else if (acc.includes(input.gpu)) reasons.push(`Documented to support ${GPU_LABEL[input.gpu]} graphics.`);
    else if (acc.includes("cpu-only")) checks.push(`${GPU_LABEL[input.gpu]} graphics are not listed; it is documented to run on the processor, which may be slower.`);
    else blockers.push(`${GPU_LABEL[input.gpu]} graphics are not among the documented options.`);
  }

  const memory = memoryVerdict(c, input);
  if (memory.kind === "too-small") blockers.push("The publisher's memory figure is higher than what you entered.");
  if (memory.kind === "fits") reasons.push("The publisher's memory figure is within what you entered (estimate, not tested).");
  if (memory.kind === "insufficient" || memory.kind === "no-input") checks.push("Memory fit is not established.");

  if (SKILL_ORDER.indexOf(c.skill) > SKILL_ORDER.indexOf(input.skill)) blockers.push(`Setup is ${c.skill === "advanced" ? "developer-level" : "command-line or extension"} work: ${c.skill_note}`);
  else reasons.push(`Setup fits your comfort level: ${c.skill_note}`);

  const cost = c.cost_basis.value;
  if (input.charges === "none") {
    if (cost === "free-download") reasons.push("No usage charges: free to download and run.");
    else if (cost === "free-tier-with-limits") checks.push(`Has a free tier with limits: ${c.cost_basis.note}`);
    else if (cost === "mixed") checks.push(`Billing depends on how you use it: ${c.cost_basis.note}`);
    else blockers.push(`Involves ongoing charges: ${c.cost_basis.note}`);
  } else if (input.charges === "subscription") {
    if (cost === "usage-billed") blockers.push(`Billed by usage: ${c.cost_basis.note}`);
    else checks.push(c.cost_basis.note);
  } else checks.push(c.cost_basis.note);

  if (c.account_required.value) {
    if (input.account) checks.push("Needs an online account.");
    else blockers.push("Needs an online account.");
  } else reasons.push("No online account needed.");

  const fit = blockers.length === 0 ? "match" : blockers.length === 1 ? "close" : "no";
  return { config: c, fit, reasons, checks, blockers, memory };
}

/** Configurations for a task, assessed and ordered: matches first, fewer caveats first, then by title. */
export function findConfigs(configs: FinderConfig[], input: FinderInput): Assessment[] {
  if (!input.task) return [];
  const rank = { match: 0, close: 1, no: 2 } as const;
  return configs
    .filter((c) => c.tasks.includes(input.task as FinderTask))
    .map((c) => assess(c, input))
    .sort((a, b) => rank[a.fit] - rank[b.fit] || a.checks.length - b.checks.length || a.config.title.localeCompare(b.config.title));
}

/* URL state: shareable, nothing stored in the browser. */

export function parseInput(p: URLSearchParams): FinderInput {
  const num = (v: string | null) => (v && /^\d+(\.\d+)?$/.test(v) ? Number(v) : null);
  const pick = <T extends string>(v: string | null, allowed: readonly T[], fallback: T): T => (v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback);
  return {
    task: pick(p.get("task"), ["write-code", "work-with-documents", "transcribe-audio", "chat-and-write", ""] as const, ""),
    where: pick(p.get("where"), ["local", "hosted", "either"] as const, "either"),
    os: pick(p.get("os"), ["windows", "macos", "linux", ""] as const, ""),
    gpu: pick(p.get("gpu"), ["nvidia", "amd", "apple-silicon", "intel", "none", ""] as const, ""),
    gpuGb: num(p.get("vram")),
    ramGb: num(p.get("ram")),
    skill: pick(p.get("skill"), ["beginner", "intermediate", "advanced"] as const, "intermediate"),
    charges: pick(p.get("charges"), ["none", "subscription", "any"] as const, "any"),
    account: p.get("account") !== "no",
  };
}

export function serializeInput(i: FinderInput): string {
  const p = new URLSearchParams();
  if (i.task) p.set("task", i.task);
  if (i.where !== "either") p.set("where", i.where);
  if (i.os) p.set("os", i.os);
  if (i.gpu) p.set("gpu", i.gpu);
  if (i.gpuGb !== null) p.set("vram", String(i.gpuGb));
  if (i.ramGb !== null) p.set("ram", String(i.ramGb));
  if (i.skill !== "intermediate") p.set("skill", i.skill);
  if (i.charges !== "any") p.set("charges", i.charges);
  if (!i.account) p.set("account", "no");
  return p.toString();
}
