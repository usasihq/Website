import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { jobHref, shortCode, titleSlug } from "@/lib/jobs/job-url";

type SpaceApp = {
  filterJobs: (jobs: Job[], query: Record<string, unknown>) => Job[];
  formatPay: (row: Job) => string;
  hydrateJob: (raw: Record<string, string>) => Job;
  parseCsv: (text: string) => Record<string, string>[];
  shortCode: (id: string) => string;
  titleSlug: (title: string) => string;
  usasiPage: (row: Record<string, string>) => string;
};

type Job = Record<string, unknown> & {
  title: string;
  employer: string;
  payLabel: string;
};

const loadSpace = async (): Promise<SpaceApp> =>
  import(pathToFileURL(path.resolve("hf-space/app.js")).href) as Promise<SpaceApp>;

const SPACE_COLORS = new Set(["red", "yellow", "green", "blue", "indigo", "purple", "pink", "gray"]);
const PICTOGRAPHIC = /^\p{Extended_Pictographic}$/u;

function spaceYaml(readme: string): Record<string, string | string[]> {
  const block = readme.match(/^---\n([\s\S]*?)\n---/)?.[1];
  if (!block) throw new Error("missing README YAML header");
  const out: Record<string, string | string[]> = {};
  let listKey: string | null = null;
  for (const line of block.split("\n")) {
    const listItem = line.match(/^  - (.+)$/);
    if (listItem && listKey) {
      (out[listKey] as string[]).push(listItem[1].trim());
      continue;
    }
    const field = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!field) continue;
    listKey = null;
    const [, key, raw] = field;
    if (raw === "") {
      listKey = key;
      out[key] = [];
    } else {
      out[key] = raw.replace(/^['"]|['"]$/g, "");
    }
  }
  return out;
}

describe("static Hugging Face Space", () => {
  it("is a free static Space, not Gradio", () => {
    const readme = readFileSync("hf-space/README.md", "utf8");
    expect(readme).toMatch(/^---[\s\S]*\nsdk:\s*static\n/m);
    expect(readme).not.toMatch(/sdk:\s*gradio/);
    expect(existsSync("hf-space/index.html")).toBe(true);
    expect(existsSync("hf-space/app.js")).toBe(true);
    expect(existsSync("hf-space/style.css")).toBe(true);
    expect(existsSync("hf-space/app.py")).toBe(false);
    expect(existsSync("hf-space/requirements.txt")).toBe(false);
    const deploy = readFileSync("scripts/hf-space-deploy.ts", "utf8");
    expect(deploy).toContain('sdk: "static"');
    expect(deploy).toContain("index.html");
    expect(deploy).toContain("app.js");
    expect(deploy).toContain("style.css");
    expect(deploy).toContain("deletePaths: REMOVE_STALE_FILES");
  });

  it("uses README YAML that Hugging Face Space config will accept", () => {
    const yaml = spaceYaml(readFileSync("hf-space/README.md", "utf8"));
    expect(typeof yaml.title).toBe("string");
    expect(String(yaml.title).length).toBeGreaterThan(0);
    expect(String(yaml.title).length).toBeLessThanOrEqual(40);
    expect(yaml.emoji).toMatch(PICTOGRAPHIC);
    expect(yaml.emoji).not.toBe("🇺🇸");
    expect(SPACE_COLORS.has(String(yaml.colorFrom))).toBe(true);
    expect(SPACE_COLORS.has(String(yaml.colorTo))).toBe(true);
    expect(yaml.sdk).toBe("static");
    expect(yaml.app_file).toBe("index.html");
    expect(yaml.pinned).toBe("false");
    expect(yaml.license).toBe("mit");
    expect(String(yaml.short_description).length).toBeGreaterThan(0);
    expect(String(yaml.short_description).length).toBeLessThanOrEqual(60);
    expect(Array.isArray(yaml.tags) && yaml.tags.length).toBeGreaterThan(0);
    expect(readFileSync("hf-space/index.html", "utf8")).toContain("style.css");
  });

  it("matches the site's job-page codes when the dataset has no page column", async () => {
    const space = await loadSpace();
    expect(space.titleSlug("Senior Software Engineer, Inference (C++/CUDA)")).toBe(titleSlug("Senior Software Engineer, Inference (C++/CUDA)"));
    expect(space.titleSlug("R&D Lead")).toBe("r-and-d-lead");
    expect(space.shortCode("openai:ashby:openai:abc")).toBe(shortCode("openai:ashby:openai:abc"));
    expect(space.shortCode("openai:ashby:openai:abc")).toBe("0e1cf02");
    const href = jobHref({ id: "acme-ai:greenhouse:acme:1", title: "Research Engineer", organization_slug: "acme-ai" });
    expect(space.usasiPage({ id: "acme-ai:greenhouse:acme:1", title: "Research Engineer", employer_slug: "acme-ai" })).toBe(
      `https://unitedstatesofamericasuperintelligence.com${href}`,
    );
    expect(space.usasiPage({ page: "https://unitedstatesofamericasuperintelligence.com/jobs/at/kept/" })).toBe(
      "https://unitedstatesofamericasuperintelligence.com/jobs/at/kept/",
    );
  });

  it("parses quoted CSV and filters client-side", async () => {
    const space = await loadSpace();
    const csv = [
      "id,title,employer,employer_slug,locations,workplace,remote,employment_type,salary_min,salary_max,salary_currency,salary_period,posted_at,official_url,page",
      'a,"Research Scientist, NLP",Acme,acme-ai,"San Francisco, CA",hybrid,false,full-time,180000,220000,USD,year,2026-10-01T00:00:00.000Z,https://example.com/a,',
      "b,Remote Writer,Beta,beta-ai,Remote,remote,true,contract,,,,,2026-09-01T00:00:00.000Z,https://example.com/b,",
      "c,On-site Intern,Acme,acme-ai,Austin TX,on-site,false,internship,25,35,USD,hour,2026-08-01T00:00:00.000Z,https://example.com/c,",
    ].join("\n");
    const jobs = space.parseCsv(csv).map(space.hydrateJob);
    expect(jobs).toHaveLength(3);
    expect(jobs[0].title).toBe("Research Scientist, NLP");
    expect(space.formatPay(jobs[0])).toBe("$180,000–$220,000 / year");
    expect(space.filterJobs(jobs, { keyword: "research scientist" })).toHaveLength(1);
    expect(space.filterJobs(jobs, { company: "Acme" })).toHaveLength(2);
    expect(space.filterJobs(jobs, { state: "CA" })).toHaveLength(1);
    expect(space.filterJobs(jobs, { location: "austin" })).toHaveLength(1);
    expect(space.filterJobs(jobs, { workplace: "remote" })).toHaveLength(1);
    expect(space.filterJobs(jobs, { remoteOnly: true })).toHaveLength(1);
    expect(space.filterJobs(jobs, { employment: "full-time" })).toHaveLength(1);
    expect(space.filterJobs(jobs, { hasPay: true })).toHaveLength(2);
  });
});
