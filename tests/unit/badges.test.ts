import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  formatRank,
  rankBadge,
  rankBadgeAlt,
  rankBadgeMessage,
  rankBadgePath,
  rankBadgeSnippets,
  rankBadgeSvg,
} from "@/lib/badges";
import { githubEntries } from "@/lib/github/projects";
import { hfModelEntries } from "@/lib/huggingface/items";
import { collectRankBadges, writeRankBadgeFiles } from "../../scripts/generate-badges";

describe("rank badge build hook", () => {
  it("is generated in prepare:data, not the Playwright OG card render", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
    expect(pkg.scripts["prepare:data"]).toContain("generate-badges.ts");
    expect(pkg.scripts["prepare:cards"]).not.toMatch(/badge/i);
    expect(pkg.scripts.build).toContain("prepare:data");
  });
});

describe("rank badge wording and URLs", () => {
  it("formats ranks the same way the pages do", () => {
    expect(formatRank(1)).toBe("1");
    expect(formatRank(104)).toBe("104");
    expect(formatRank(9507)).toBe("9,507");
    expect(() => formatRank(0)).toThrow(/positive/);
  });

  it("keeps a short, consistent message and a longer alt", () => {
    expect(rankBadgeMessage("github", 104)).toBe("GitHub #104");
    expect(rankBadgeMessage("huggingface", 12)).toBe("Models #12");
    expect(rankBadgeAlt("github", 104)).toBe("Ranked #104 in AI on GitHub");
    expect(rankBadgeAlt("huggingface", 12)).toBe("Ranked #12 among Hugging Face models");
    expect(rankBadgePath("github", "openai--codex")).toBe("/badges/github/openai--codex.svg");
    expect(rankBadgePath("huggingface", "openai--gpt-oss-120b")).toBe("/badges/huggingface/openai--gpt-oss-120b.svg");
    expect(() => rankBadgePath("github", "../x")).toThrow(/unsafe/);
  });

  it("builds README snippets that link the badge to the page", () => {
    const s = rankBadgeSnippets(
      "https://unitedstatesofamericasuperintelligence.com/github/openai--codex/",
      "https://unitedstatesofamericasuperintelligence.com/badges/github/openai--codex.svg",
      "github",
      104,
    );
    expect(s.markdown).toBe(
      "[![Ranked #104 in AI on GitHub](https://unitedstatesofamericasuperintelligence.com/badges/github/openai--codex.svg)](https://unitedstatesofamericasuperintelligence.com/github/openai--codex/)",
    );
    expect(s.html).toContain('href="https://unitedstatesofamericasuperintelligence.com/github/openai--codex/"');
    expect(s.html).toContain('src="https://unitedstatesofamericasuperintelligence.com/badges/github/openai--codex.svg"');
    expect(s.html).toContain('alt="Ranked #104 in AI on GitHub"');
  });
});

describe("rank badge SVG", () => {
  it("is a compact shields-style template matching the listed badge colors", () => {
    const svg = rankBadgeSvg("github", 104);
    expect(svg.startsWith("<svg ")).toBe(true);
    expect(svg).toContain('height="20"');
    expect(svg).toContain('fill="#0b1224"');
    expect(svg).toContain('fill="#4cc9ff"');
    expect(svg).toContain("USASI");
    expect(svg).toContain("GitHub #104");
    expect(svg).toContain("USASI: Ranked #104 in AI on GitHub");
    expect(svg).not.toContain("<script");
    expect(svg.length).toBeLessThan(1200);
  });

  it("grows only with the digit count", () => {
    const one = rankBadgeSvg("github", 1);
    const many = rankBadgeSvg("github", 9507);
    const width = (s: string) => Number(s.match(/width="(\d+)"/)![1]);
    expect(width(many)).toBeGreaterThan(width(one));
    expect(width(many)).toBeLessThan(160);
  });
});

describe("rank badges stay in sync with the live lists", () => {
  it("emits one badge per GitHub project and Hugging Face model, using that row's rank", () => {
    const github = githubEntries();
    const models = hfModelEntries();
    const started = Date.now();
    const badges = collectRankBadges();
    const ms = Date.now() - started;
    expect(badges.length).toBe(github.length + models.length);
    expect(new Set(badges.map((b) => b.path)).size).toBe(badges.length);
    const firstGh = rankBadge("github", github[0].slug, github[0].rank);
    const firstHf = rankBadge("huggingface", models[0].slug, models[0].rank);
    expect(badges[0]).toEqual(firstGh);
    expect(badges.find((b) => b.path === firstHf.path)).toEqual(firstHf);
    expect(firstGh.svg).toContain(`GitHub #${github[0].rank.toLocaleString("en-US")}`);
    expect(firstHf.svg).toContain(`Models #${models[0].rank.toLocaleString("en-US")}`);
    expect(ms).toBeLessThan(5_000);
  });

  it("writes only changed files and deletes stale rank badges, never listed.svg", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "usasi-badges-"));
    const a = rankBadge("github", "acme--kit", 3);
    const b = rankBadge("huggingface", "acme--model", 9);
    const first = writeRankBadgeFiles(root, [a, b]);
    expect(first.written).toBe(2);
    expect(fs.existsSync(path.join(root, "badges/listed.svg"))).toBe(false);
    fs.writeFileSync(path.join(root, "badges/listed.svg"), "<svg id='listed'/>");
    fs.writeFileSync(path.join(root, "badges/github/old.svg"), "<svg/>");
    const again = writeRankBadgeFiles(root, [a]);
    expect(again.written).toBe(0);
    expect(again.unchanged).toBe(1);
    expect(again.removed).toBe(2);
    expect(fs.existsSync(path.join(root, a.path.slice(1)))).toBe(true);
    expect(fs.existsSync(path.join(root, b.path.slice(1)))).toBe(false);
    expect(fs.existsSync(path.join(root, "badges/github/old.svg"))).toBe(false);
    expect(fs.readFileSync(path.join(root, "badges/listed.svg"), "utf8")).toBe("<svg id='listed'/>");
    fs.rmSync(root, { recursive: true, force: true });
  });
});
