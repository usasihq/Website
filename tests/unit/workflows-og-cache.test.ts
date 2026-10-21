import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const workflows = path.join(process.cwd(), ".github/workflows");
const read = (file: string) => fs.readFileSync(path.join(workflows, file), "utf8");

const OG_CACHE_KEY =
  "og-${{ hashFiles('lib/page-cards.ts', 'scripts/page-cards.ts', 'scripts/hero-render.ts', 'scripts/github-heroes.ts', 'scripts/hf-heroes.ts', 'data/github/projects.json', 'data/huggingface/*.json') }}";

function jobTimeoutMinutes(yaml: string): number {
  const match = yaml.match(/^    timeout-minutes: (\d+)/m);
  if (!match) throw new Error("missing job-level timeout-minutes");
  return Number(match[1]);
}

describe("production workflows share CI's OG card cache", () => {
  it.each(["ci.yml", "refresh-jobs.yml", "deploy-cloudflare.yml"] as const)("%s restores public/og with the same cache key", (file) => {
    const yaml = read(file);
    expect(yaml).toContain("public/og");
    expect(yaml).toContain(".cache");
    expect(yaml).toContain(OG_CACHE_KEY);
    expect(yaml).toMatch(/restore-keys:\s*og-/);
  });

  it("gives Refresh Jobs and Deploy enough time for a cold Chromium render plus deploy", () => {
    expect(jobTimeoutMinutes(read("ci.yml"))).toBeGreaterThanOrEqual(120);
    expect(jobTimeoutMinutes(read("refresh-jobs.yml"))).toBeGreaterThanOrEqual(90);
    expect(jobTimeoutMinutes(read("deploy-cloudflare.yml"))).toBeGreaterThanOrEqual(90);
  });
});

describe("post-deploy indexing", () => {
  it("runs Google Indexing and IndexNow after a successful Refresh Jobs deploy", () => {
    const yaml = read("refresh-jobs.yml");
    const deploy = yaml.indexOf("npx wrangler deploy");
    const google = yaml.indexOf("npm run jobs:index");
    const indexnow = yaml.indexOf("npm run indexnow");
    expect(deploy).toBeGreaterThan(-1);
    expect(google).toBeGreaterThan(deploy);
    expect(indexnow).toBeGreaterThan(deploy);
    expect(yaml).toContain("continue-on-error: true");
  });

  it("runs IndexNow after a successful Cloudflare deploy", () => {
    const yaml = read("deploy-cloudflare.yml");
    const deploy = yaml.indexOf("npx wrangler deploy");
    const indexnow = yaml.indexOf("npm run indexnow");
    expect(deploy).toBeGreaterThan(-1);
    expect(indexnow).toBeGreaterThan(deploy);
  });
});
