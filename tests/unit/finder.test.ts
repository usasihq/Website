import { describe, expect, it } from "vitest";
import { assess, DEFAULT_INPUT, findConfigs, memoryVerdict, parseInput, serializeInput, type FinderInput } from "@/lib/finder";
import { FinderConfig } from "@/lib/schema";

const src = { id: "doc", title: "Docs", url: "https://example.org/docs", publisher: "Example", accessed_at: "2026-10-08" };
const claim = (text: string) => ({ text, source_ids: ["doc"] });

const base = FinderConfig.parse({
  slug: "local-coder",
  title: "Local coding assistant example",
  tasks: ["write-code"],
  runs: "local",
  summary: claim("A local coding setup."),
  components: [{ role: "runtime", name: "Runtime", url: "https://example.org/runtime" }],
  platforms: { values: ["linux", "windows"], source_ids: ["doc"] },
  accelerators: { values: ["nvidia", "cpu-only"], source_ids: ["doc"] },
  memory: { variant: "Example 20B, 4-bit", gpu_gb: 16, system_gb: null, statement: claim("Runs within 16GB of memory.") },
  skill: "intermediate",
  skill_note: "Install from the command line.",
  account_required: { value: false, source_ids: ["doc"] },
  cost_basis: { value: "free-download", note: "Free to download and run.", source_ids: ["doc"] },
  data_location: claim("Processing happens on your computer."),
  getting_started: ["Install the runtime.", "Download the model."],
  getting_started_source_ids: ["doc"],
  limitations: [claim("Long contexts need more memory.")],
  unverified: ["USASI has not tested this configuration."],
  publication_status: "published",
  updated_at: "2026-10-08",
  last_reviewed: "2026-10-08",
  sources: [src],
});
const hosted = FinderConfig.parse({ ...base, slug: "hosted-coder", runs: "hosted", memory: null, platforms: { values: ["web"], source_ids: ["doc"] }, accelerators: { values: [], source_ids: [] }, account_required: { value: true, source_ids: ["doc"] }, cost_basis: { value: "subscription", note: "Requires a paid plan.", source_ids: ["doc"] }, skill: "beginner" });

const input = (patch: Partial<FinderInput>): FinderInput => ({ ...DEFAULT_INPUT, task: "write-code", ...patch });

describe("finder memory labels", () => {
  it("never claims a fit without a publisher figure, and separates estimate from test", () => {
    expect(memoryVerdict(base, input({ gpuGb: 16 })).kind).toBe("fits");
    expect(memoryVerdict(base, input({ gpuGb: 16 })).text).toMatch(/not tested/);
    expect(memoryVerdict(base, input({ gpuGb: 8 })).kind).toBe("too-small");
    expect(memoryVerdict(base, input({})).kind).toBe("no-input");
    expect(memoryVerdict({ ...base, memory: null }, input({ gpuGb: 24 })).kind).toBe("insufficient");
    const systemFigure = { ...base, memory: { ...base.memory!, gpu_gb: null, system_gb: 16 } };
    expect(memoryVerdict(systemFigure, input({ gpuGb: 24 })).kind).toBe("no-input");
    expect(memoryVerdict(systemFigure, input({ ramGb: 32 })).kind).toBe("fits");
    expect(memoryVerdict(base, input({ gpu: "apple-silicon", ramGb: 24 })).kind).toBe("fits");
    expect(memoryVerdict(hosted, input({ gpuGb: 4 })).kind).toBe("not-applicable");
    expect(memoryVerdict({ ...base, runs: "hybrid", memory: null }, input({ gpuGb: 4 })).kind).toBe("not-applicable");
    expect(memoryVerdict({ ...base, tested: { date: "2026-10-08", environment: "Linux, 16 GB GPU", result: "Ran at default context." } }, input({})).kind).toBe("tested");
  });
});

describe("finder matching", () => {
  it("explains matches and blockers", () => {
    const a = assess(base, input({ where: "local", os: "linux", gpu: "nvidia", gpuGb: 16, charges: "none" }));
    expect(a.fit).toBe("match");
    expect(a.reasons.join(" ")).toMatch(/your own computer/);
    const b = assess(base, input({ where: "local", os: "macos", gpuGb: 8 }));
    expect(b.fit).toBe("no");
    expect(b.blockers).toEqual(expect.arrayContaining([expect.stringMatching(/macOS/), expect.stringMatching(/memory figure is higher/)]));
  });

  it("respects charges and accounts", () => {
    expect(assess(hosted, input({ charges: "none" })).blockers.join(" ")).toMatch(/ongoing charges/);
    expect(assess(hosted, input({ account: false })).blockers).toContain("Needs an online account.");
    expect(assess(hosted, input({ where: "local" })).fit).not.toBe("match");
  });

  it("orders matches first and filters by task", () => {
    const results = findConfigs([hosted, base], input({ where: "local", os: "linux", gpuGb: 16 }));
    expect(results.map((r) => r.config.slug)).toEqual(["local-coder", "hosted-coder"]);
    expect(findConfigs([base], input({ task: "transcribe-audio" }))).toEqual([]);
    expect(findConfigs([base], { ...DEFAULT_INPUT })).toEqual([]);
  });

  it("round-trips answers through the URL and ignores bad values", () => {
    const i = input({ where: "local", os: "linux", gpu: "nvidia", gpuGb: 16, ramGb: 32, skill: "advanced", charges: "none", account: false });
    expect(parseInput(new URLSearchParams(serializeInput(i)))).toEqual(i);
    expect(parseInput(new URLSearchParams("task=hack&vram=abc&os=beos"))).toEqual({ ...DEFAULT_INPUT });
  });
});
