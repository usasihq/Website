import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  JOBS_PREFIXES,
  JOBS_REDIRECT_EXCEPTIONS,
  isJobsPath,
  jobsRedirectTarget,
} from "@/lib/jobs-redirects";
import worker from "@/worker";
import { checkJobsRemoved, findOutViolations, findSourceViolations } from "@/scripts/check-jobs-removed";

const ROOT = process.cwd();

function env(status = 404) {
  const calls: string[] = [];
  return {
    calls,
    env: {
      ASSETS: {
        fetch: async (r: Request | URL | string) => {
          calls.push(typeof r === "string" ? r : r instanceof URL ? r.toString() : r.url);
          return new Response("not found", { status });
        },
      },
    },
  };
}

describe("jobs redirect rules", () => {
  it("sends the directory, a listing, and feed.xml to the same path on aipeoplewiki.com", () => {
    expect(jobsRedirectTarget("/jobs/")).toBe("https://aipeoplewiki.com/jobs/");
    expect(jobsRedirectTarget("/jobs")).toBe("https://aipeoplewiki.com/jobs/");
    expect(jobsRedirectTarget("/jobs/at/openai/research-engineer-1abcde0/")).toBe(
      "https://aipeoplewiki.com/jobs/at/openai/research-engineer-1abcde0/",
    );
    expect(jobsRedirectTarget("/jobs/at/openai/research-engineer-1abcde0")).toBe(
      "https://aipeoplewiki.com/jobs/at/openai/research-engineer-1abcde0/",
    );
    expect(jobsRedirectTarget("/jobs/feed.xml")).toBe("https://aipeoplewiki.com/jobs/feed.xml");
  });

  it("applies the compact exception rules", () => {
    expect(jobsRedirectTarget("/jobs/index/")).toBe("https://aipeoplewiki.com/jobs/hiring/");
    expect(jobsRedirectTarget("/jobs/at/federal/")).toBe("https://aipeoplewiki.com/jobs/");
    expect(jobsRedirectTarget("/jobs/at/federal/data-scientist-0dhppg8/")).toBe("https://aipeoplewiki.com/jobs/");
    expect(jobsRedirectTarget("/jobs/pay/")).toBe("https://aipeoplewiki.com/jobs/");
    expect(jobsRedirectTarget("/jobs/pay/software-engineer/")).toBe("https://aipeoplewiki.com/jobs/");
    expect(jobsRedirectTarget("/jobs/layoffs/california/")).toBe("https://aipeoplewiki.com/jobs/");
    expect(jobsRedirectTarget("/jobs/role/software-engineer/california/")).toBe(
      "https://aipeoplewiki.com/jobs/role/software-engineer/",
    );
    expect(jobsRedirectTarget("/jobs/role/account-executive/california/page/2/")).toBe(
      "https://aipeoplewiki.com/jobs/role/account-executive/",
    );
    expect(jobsRedirectTarget("/sitemaps/jobs-1.xml")).toBe("https://aipeoplewiki.com/sitemap.xml");
  });

  it("uses the lookup for closed listings and deep pagination", () => {
    expect(Object.keys(JOBS_REDIRECT_EXCEPTIONS).length).toBeGreaterThan(140);
    for (const [from, to] of Object.entries(JOBS_REDIRECT_EXCEPTIONS)) {
      expect(jobsRedirectTarget(from), from).toBe(`https://aipeoplewiki.com${to}`);
    }
    expect(jobsRedirectTarget("/jobs/at/abridge/member-of-technical-staff-data-1ch65fx/")).toBe(
      "https://aipeoplewiki.com/jobs/at/abridge/",
    );
    expect(jobsRedirectTarget("/jobs/in/arizona/page/3/")).toBe("https://aipeoplewiki.com/jobs/in/arizona/");
    expect(jobsRedirectTarget("/jobs/in/maryland/woodlawn/")).toBe("https://aipeoplewiki.com/jobs/in/maryland/");
    expect(jobsRedirectTarget("/jobs/page/255/")).toBe("https://aipeoplewiki.com/jobs/");
  });

  it("is single-hop: every target is on aipeoplewiki.com", () => {
    for (const sample of ["/jobs/", "/jobs/at/openai/", "/jobs/index/", "/jobs/pay/research-scientist/", "/jobs/at/federal/x/"]) {
      expect(new URL(jobsRedirectTarget(sample)!).hostname).toBe("aipeoplewiki.com");
    }
  });
});

describe("worker 301s", () => {
  it("answers /jobs/, a sample listing, and an exception URL with one 301 and no static lookup", async () => {
    const cases: [string, string][] = [
      ["/jobs/", "https://aipeoplewiki.com/jobs/"],
      ["/jobs", "https://aipeoplewiki.com/jobs/"],
      ["/jobs/at/openai/research-engineer-1abcde0/", "https://aipeoplewiki.com/jobs/at/openai/research-engineer-1abcde0/"],
      ["/jobs/at/federal/data-scientist-0dhppg8/", "https://aipeoplewiki.com/jobs/"],
    ];
    for (const [p, target] of cases) {
      const { env: e, calls } = env();
      const res = await worker.fetch(new Request(`https://usasi.test${p}`), e);
      expect(res.status, p).toBe(301);
      expect(res.headers.get("location"), p).toBe(target);
      expect(calls, p).toEqual([]);
    }
  });

  it("drops the query string and answers HEAD the same way", async () => {
    const { env: e } = env();
    const get = await worker.fetch(new Request("https://usasi.test/jobs/?q=engineer#top"), e);
    expect(get.status).toBe(301);
    expect(get.headers.get("location")).toBe("https://aipeoplewiki.com/jobs/");
    const head = await worker.fetch(new Request("https://usasi.test/jobs/at/openai", { method: "HEAD" }), e);
    expect(head.status).toBe(301);
    expect(head.headers.get("location")).toBe("https://aipeoplewiki.com/jobs/at/openai/");
  });

  it("does not touch neighbours such as /job or company pages", async () => {
    expect(isJobsPath("/job/")).toBe(false);
    expect(isJobsPath("/companies/openai/")).toBe(false);
    expect(jobsRedirectTarget("/companies/")).toBeNull();
    for (const p of JOBS_PREFIXES) expect(isJobsPath(p)).toBe(true);
  });

  it("leaves people redirects in place", async () => {
    const { env: e, calls } = env();
    const res = await worker.fetch(new Request("https://usasi.test/people/"), e);
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://aipeoplewiki.com/people/");
    expect(calls).toEqual([]);
  });
});

describe("wrangler.jsonc", () => {
  it("runs the worker first for /jobs (bare and nested) so the platform never 307s first", () => {
    const text = fs.readFileSync(path.join(ROOT, "wrangler.jsonc"), "utf8").replace(/^\s*\/\/.*$/gm, "");
    const first = JSON.parse(text).assets.run_worker_first as string[];
    expect(first).toContain("/jobs");
    expect(first).toContain("/jobs/*");
    expect(first).toContain("/jobs/at/*");
    expect(first).toContain("/sitemaps/*");
    expect(first).toContain("/sitemap-jobs-*.xml");
  });
});

describe("pop-back guard", () => {
  it("passes on the repository as it is", () => {
    expect(findSourceViolations(ROOT)).toEqual([]);
    expect(checkJobsRemoved(ROOT, false).filter((v) => !v.startsWith("out/"))).toEqual([]);
  });

  function sandbox(files: Record<string, string>): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "jobs-guard-"));
    fs.mkdirSync(path.join(dir, "data"), { recursive: true });
    fs.writeFileSync(path.join(dir, "data/jobs-redirect-exceptions.json"), "{}");
    fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ scripts: {} }));
    for (const [f, text] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
      fs.writeFileSync(path.join(dir, f), text);
    }
    return dir;
  }

  it("fails when a route, data directory, workflow, or component comes back", () => {
    for (const f of [
      "app/jobs/page.tsx",
      "lib/jobs/load.ts",
      "data/jobs/current.json",
      "data/layoffs/current.json",
      ".github/workflows/refresh-jobs.yml",
      "components/JobsDirectory.tsx",
    ]) {
      expect(findSourceViolations(sandbox({ [f]: "x" })).length, f).toBeGreaterThan(0);
    }
    expect(findSourceViolations(sandbox({ "lib/jobs-redirects.ts": "x" }))).toEqual([]);
  });

  it("fails on nav, footer, home, MDX, and YAML links to /jobs", () => {
    const bad: Record<string, string> = {
      "components/SiteHeader.tsx": 'const nav = [{ href: "/jobs/", label: "Jobs" }];',
      "components/SiteFooter.tsx": "<Link href={`/jobs/`}>x</Link>",
      "app/page.tsx": "<a href='/jobs/'>Jobs</a>",
      "content/pages/x.mdx": "See [jobs](/jobs/).",
      "lib/site-routes.ts": 'export const R = ["/jobs"];',
      "public/llms.txt": "- [Jobs](https://unitedstatesofamericasuperintelligence.com/jobs/)",
    };
    for (const [f, text] of Object.entries(bad)) expect(findSourceViolations(sandbox({ [f]: text })).length, f).toBeGreaterThan(0);
  });

  it("allows the wiki footer link and unrelated paths", () => {
    const ok = {
      "components/SiteFooter.tsx": '<a href="https://aipeoplewiki.com/" rel="noopener">People → AI People Wiki</a>',
      "content/pages/x.mdx": "[hub](/hubs/local-ai/) and https://job-boards.greenhouse.io/anthropic/jobs/1",
    };
    expect(findSourceViolations(sandbox(ok))).toEqual([]);
  });

  it("fails when a built jobs file or sitemap entry exists", () => {
    expect(findOutViolations(sandbox({ "out/jobs/index.html": "<html>" }), true).length).toBeGreaterThan(0);
    expect(findOutViolations(sandbox({ "out/sitemaps/jobs-1.xml": "<urlset/>" }), true).length).toBeGreaterThan(0);
    expect(findOutViolations(sandbox({ "out/index.html": "<html>" }), true)).toEqual([]);
    expect(findOutViolations(sandbox({ "out/sitemap.xml": "<loc>https://unitedstatesofamericasuperintelligence.com/jobs/</loc>" }), true).length).toBeGreaterThan(0);
    expect(findOutViolations(sandbox({}), true).length).toBe(1);
    expect(findOutViolations(sandbox({}), false)).toEqual([]);
  });
});
