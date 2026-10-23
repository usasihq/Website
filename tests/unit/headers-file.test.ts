import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * public/_headers as Cloudflare's asset worker reads it: "*" becomes ".*",
 * ":name" one path segment; the first rule that sets a header replaces the
 * served value, and any later matching rule appends to it.
 */
function rules() {
  const out: { pattern: string; regex: RegExp; set: [string, string][] }[] = [];
  for (const raw of fs.readFileSync(path.join(process.cwd(), "public/_headers"), "utf8").split("\n")) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;
    if (!/^\s/.test(raw)) {
      const pattern = raw.trim();
      const body = pattern
        .split("*")
        .map((p) => p.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"))
        .join(".*")
        .replace(/:([A-Za-z]\w*)/g, "[^/]+");
      out.push({ pattern, regex: new RegExp(`^${body}$`), set: [] });
    } else {
      const line = raw.trim();
      const i = line.indexOf(":");
      out.at(-1)!.set.push([line.slice(0, i).trim().toLowerCase(), line.slice(i + 1).trim()]);
    }
  }
  return out;
}

const contentTypes = (url: string) => rules().filter((r) => r.regex.test(url)).flatMap((r) => r.set.filter(([k]) => k === "content-type").map(([, v]) => v));

describe("_headers transport security", () => {
  it("asks browsers to upgrade http and remember HTTPS", () => {
    const file = fs.readFileSync(path.join(process.cwd(), "public/_headers"), "utf8");
    expect(file).toContain("upgrade-insecure-requests");
    expect(file).toMatch(/Strict-Transport-Security: max-age=31536000; includeSubDomains/);
  });
});

describe("_headers content types", () => {
  it("declares UTF-8 HTML for every directory URL, once", () => {
    for (const url of ["/", "/jobs/", "/jobs/index/", "/jobs/at/openai/research-engineer-abc1234/", "/companies/"]) {
      expect(contentTypes(url), url).toEqual(["text/html; charset=utf-8"]);
    }
  });

  it("leaves files with their own types alone", () => {
    for (const url of ["/data/jobs.json", "/data/search-index.json", "/og/jobs/hiring-index.jpg", "/og.png", "/sitemap.xml", "/sitemaps/jobs-1.xml", "/robots.txt", "/_next/static/chunks/a.css", "/news/feed.xml", "/badges/listed.svg", "/badges/github/openai--codex.svg"]) {
      expect(contentTypes(url), url).toEqual([]);
    }
    expect(contentTypes("/opensearch.xml")).toEqual(["application/opensearchdescription+xml; charset=utf-8"]);
  });

  it("stays within Cloudflare's limits", () => {
    expect(rules().length).toBeLessThanOrEqual(100);
    for (const r of rules()) expect((r.pattern.match(/\*/g) ?? []).length).toBeLessThanOrEqual(1);
  });
});
