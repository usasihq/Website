/**
 * npm run check:sources [-- --published-only] [-- --concurrency 6]
 *
 * Requests every cited source URL and reports ones that fail. This is an
 * editorial tool, deliberately separate from `npm run build`: an unreachable
 * source never blocks rendering already-verified content, and this script
 * never edits records, licenses, eligibility, or review dates. It writes
 * reports/source-check.json and prints a summary for an editor to act on.
 *
 * Many sites block automated clients (403/429) — those are listed as
 * "blocked", not "broken", and need a manual check in a browser.
 */
import fs from "node:fs";
import path from "node:path";
import { readRawContent, todayIso } from "../lib/content-loader";
import { validateContent } from "../lib/validate";

const args = process.argv.slice(2);
const publishedOnly = args.includes("--published-only");
const concurrency = Number(args[args.indexOf("--concurrency") + 1]) || 6;
const USER_AGENT = "USASI-source-check/0.1 (editorial link checker)";

const content = validateContent(readRawContent(), { today: todayIso() });
const uses = new Map<string, Array<{ record: string; source: string }>>();
for (const record of [...content.organizations, ...content.artifacts]) {
  if (publishedOnly && record.publication_status !== "published") continue;
  for (const s of record.sources) {
    const list = uses.get(s.url) ?? [];
    list.push({ record: record.slug, source: s.id });
    uses.set(s.url, list);
  }
}

type Result = { url: string; status: number | null; outcome: "ok" | "redirect" | "blocked" | "broken" | "error"; finalUrl?: string; error?: string };

async function check(url: string): Promise<Result> {
  const attempt = async (method: "HEAD" | "GET") => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    try {
      return await fetch(url, { method, redirect: "follow", signal: controller.signal, headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml,*/*" } });
    } finally {
      clearTimeout(timer);
    }
  };
  try {
    let res = await attempt("HEAD");
    if (res.status === 405 || res.status === 403 || res.status === 400 || res.status === 404) res = await attempt("GET");
    const redirected = res.url && res.url !== url;
    const outcome: Result["outcome"] =
      res.status < 400 ? (redirected ? "redirect" : "ok") : res.status === 401 || res.status === 403 || res.status === 429 || res.status === 999 ? "blocked" : "broken";
    return { url, status: res.status, outcome, finalUrl: redirected ? res.url : undefined };
  } catch (err) {
    return { url, status: null, outcome: "error", error: err instanceof Error ? err.message : String(err) };
  }
}

const urls = [...uses.keys()];
const results: Result[] = [];
let next = 0;
await Promise.all(
  Array.from({ length: concurrency }, async () => {
    while (next < urls.length) {
      const url = urls[next++];
      results.push(await check(url));
    }
  }),
);

results.sort((a, b) => a.url.localeCompare(b.url));
fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync(
  path.join("reports", "source-check.json"),
  JSON.stringify({ checked_at: new Date().toISOString(), results: results.map((r) => ({ ...r, cited_by: uses.get(r.url) })) }, null, 2) + "\n",
);

const by = (o: Result["outcome"]) => results.filter((r) => r.outcome === o);
for (const outcome of ["broken", "error", "blocked"] as const) {
  const list = by(outcome);
  if (!list.length) continue;
  console.log(`\n${outcome.toUpperCase()} (${list.length})`);
  for (const r of list) {
    const cited = uses.get(r.url)!.map((u) => `${u.record}#${u.source}`).join(", ");
    console.log(`  ${r.status ?? "—"}  ${r.url}\n        cited by ${cited}${r.error ? `\n        ${r.error}` : ""}`);
  }
}
console.log(
  `\n${urls.length} unique URLs: ${by("ok").length} ok, ${by("redirect").length} redirected, ${by("blocked").length} blocked by the site, ${by("broken").length} broken, ${by("error").length} network errors.\nReport: reports/source-check.json (nothing in /content was changed)`,
);
if (by("broken").length + by("error").length > 0) process.exitCode = 1;
