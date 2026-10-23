import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  MOVED_PREFIXES,
  PEOPLE_REDIRECT_MAP,
  isMovedPath,
  peopleRedirectTarget,
} from "@/lib/people-redirects";
import worker from "@/worker";
import { checkPeopleRemoved, findOutViolations, findSourceViolations } from "@/scripts/check-people-removed";

const ROOT = process.cwd();
const keys = Object.keys(PEOPLE_REDIRECT_MAP);

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

describe("redirect map", () => {
  it("covers only the moved prefixes, with trailing slashes, and targets only aipeoplewiki.com", () => {
    expect(keys.length).toBeGreaterThan(900);
    for (const k of keys) {
      expect(k, k).toMatch(/^\/(people|big-si|voices|local)\/(.*\/)?$/);
      expect(PEOPLE_REDIRECT_MAP[k], k).toMatch(/^https:\/\/aipeoplewiki\.com\/[a-z0-9/-]*$/);
    }
  });

  it("includes the four section roots", () => {
    for (const k of ["/people/", "/big-si/", "/voices/", "/local/"]) expect(PEOPLE_REDIRECT_MAP[k]).toBeDefined();
  });

  it("is single-hop: no target is itself an old USASI path", () => {
    for (const t of Object.values(PEOPLE_REDIRECT_MAP)) expect(new URL(t).hostname).toBe("aipeoplewiki.com");
  });
});

describe("worker 301s", () => {
  it("answers every key, in slash and non-slash form, with one 301 and no static lookup", async () => {
    for (const k of keys) {
      for (const p of [k, k.slice(0, -1)]) {
        const { env: e, calls } = env();
        const res = await worker.fetch(new Request(`https://usasi.test${p}`), e);
        expect(res.status, p).toBe(301);
        expect(res.headers.get("location"), p).toBe(PEOPLE_REDIRECT_MAP[k]);
        expect(calls, p).toEqual([]);
      }
    }
  });

  it("drops the query string and answers HEAD the same way", async () => {
    const { env: e } = env();
    const get = await worker.fetch(new Request("https://usasi.test/people/jim-fan?utm_source=x#top"), e);
    expect(get.status).toBe(301);
    expect(get.headers.get("location")).toBe("https://aipeoplewiki.com/people/jim-fan/");
    const head = await worker.fetch(new Request("https://usasi.test/big-si/elon-musk", { method: "HEAD" }), e);
    expect(head.status).toBe(301);
    expect(head.headers.get("location")).toBe("https://aipeoplewiki.com/people/elon-musk/");
  });

  it("sends unknown slugs to the static 404, not a redirect", async () => {
    for (const p of ["/people/no-such-person/", "/people/no-such-person", "/big-si/nobody", "/voices/x/", "/local/x/", "/people/at/", "/people/Jim-Fan/", "/people/__proto__/", "/people/constructor"]) {
      const { env: e, calls } = env(404);
      const res = await worker.fetch(new Request(`https://usasi.test${p}`), e);
      expect(res.status, p).toBe(404);
      expect(res.headers.get("location"), p).toBeNull();
      expect(calls.length, p).toBe(1);
    }
  });

  it("does not touch neighbours such as /local-ai or /peoples", async () => {
    expect(isMovedPath("/local-ai/")).toBe(false);
    expect(isMovedPath("/peoples/")).toBe(false);
    expect(peopleRedirectTarget("/hubs/local-ai/")).toBeNull();
    for (const p of MOVED_PREFIXES) expect(isMovedPath(p)).toBe(true);
  });
});

describe("wrangler.jsonc", () => {
  it("runs the worker first for every moved prefix, bare and nested", () => {
    const text = fs.readFileSync(path.join(ROOT, "wrangler.jsonc"), "utf8").replace(/^\s*\/\/.*$/gm, "");
    const first = JSON.parse(text).assets.run_worker_first as string[];
    for (const p of MOVED_PREFIXES) {
      expect(first, p).toContain(p);
      expect(first, p).toContain(`${p}/*`);
    }
    expect(first).toContain("/jobs/at/*");
  });
});

describe("pop-back guard", () => {
  it("passes on the repository as it is", () => {
    expect(findSourceViolations(ROOT)).toEqual([]);
    expect(checkPeopleRemoved(ROOT, false).filter((v) => !v.startsWith("out/"))).toEqual([]);
  });

  function sandbox(files: Record<string, string>): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "guard-"));
    fs.mkdirSync(path.join(dir, "data"), { recursive: true });
    fs.writeFileSync(path.join(dir, "data/people-redirect-map.json"), JSON.stringify({ "/people/a/": "https://aipeoplewiki.com/people/a/" }));
    for (const [f, text] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
      fs.writeFileSync(path.join(dir, f), text);
    }
    return dir;
  }

  it("fails when a route, content directory, or component comes back", () => {
    for (const f of ["app/people/page.tsx", "app/big-si/page.tsx", "app/voices/page.tsx", "app/local/page.tsx", "content/people/a.yml", "content/leaders/a.yml", "components/PeopleDirectory.tsx", "lib/people-search.ts"]) {
      expect(findSourceViolations(sandbox({ [f]: "x" })).length, f).toBeGreaterThan(0);
    }
    expect(findSourceViolations(sandbox({ "lib/people-redirects.ts": "x" }))).toEqual([]);
  });

  it("fails on nav, footer, home, MDX, and YAML links to the moved paths", () => {
    const bad: Record<string, string> = {
      "components/SiteHeader.tsx": 'const nav = [{ href: "/people/", label: "People" }];',
      "components/SiteFooter.tsx": "<Link href={`/big-si/`}>x</Link>",
      "app/page.tsx": "<a href='/voices/'>Voices</a>",
      "content/pages/x.mdx": "See [local](/local/).",
      "content/hubs/x.yml": "  href: /people/school/mit/",
      "lib/site-routes.ts": 'export const R = ["/people"];',
      "public/llms.txt": "- [Jim](https://unitedstatesofamericasuperintelligence.com/people/jim-fan/)",
    };
    for (const [f, text] of Object.entries(bad)) expect(findSourceViolations(sandbox({ [f]: text })).length, f).toBeGreaterThan(0);
  });

  it("allows the single outbound link and unrelated paths", () => {
    const ok = {
      "components/SiteFooter.tsx": '<a href="https://aipeoplewiki.com/" rel="noopener">People → AI People Wiki</a>',
      "content/pages/x.mdx": "[hub](/hubs/local-ai/) and next/font/local and https://example.com/people/careers/",
    };
    expect(findSourceViolations(sandbox(ok))).toEqual([]);
  });

  it("fails when a built file exists for a redirect-map key or a moved prefix", () => {
    for (const f of ["out/people/a/index.html", "out/people/a.html", "out/people/index.html", "out/local/index.html"]) {
      expect(findOutViolations(sandbox({ [f]: "<html>" }), true).length, f).toBeGreaterThan(0);
    }
    expect(findOutViolations(sandbox({ "out/index.html": "<html>" }), true)).toEqual([]);
    expect(findOutViolations(sandbox({ "out/sitemap.xml": "<loc>https://unitedstatesofamericasuperintelligence.com/people/a/</loc>" }), true).length).toBeGreaterThan(0);
    expect(findOutViolations(sandbox({}), true).length).toBe(1);
    expect(findOutViolations(sandbox({}), false)).toEqual([]);
  });
});
