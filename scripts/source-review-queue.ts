/** Manual, read-only source check: creates review proposals, never edits catalog facts.
 * npm run review:sources -- --limit 10
 * Hash changes can be cosmetic. A fetch date is never an editorial review date.
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { readRawContent, todayIso } from "../lib/content-loader";
import { validateContent } from "../lib/validate";

const args = process.argv.slice(2);
const limit = Math.min(100, Math.max(1, Number(args[args.indexOf("--limit") + 1]) || 10));
const output = path.resolve("reports/source-review");
fs.mkdirSync(output, { recursive: true });
const snapshotFile = path.join(output, "snapshots.json");
type Snapshot = { hash?: string; fetched_at?: string; attempted_at: string };
const previous: Record<string, Snapshot> = fs.existsSync(snapshotFile) ? JSON.parse(fs.readFileSync(snapshotFile, "utf8")) : {};
const next = { ...previous };
const content = validateContent(readRawContent(), { today: todayIso() });
const sources = new Map<string, string[]>();
for (const record of [...content.organizations, ...content.artifacts]) {
  for (const source of record.sources) sources.set(source.url, [...(sources.get(source.url) ?? []), `${record.slug}#${source.id}`]);
}
const proposals: Array<{ url: string; records: string[]; status: string; checked_at: string; fetched_at?: string; previous_hash?: string; current_hash?: string }> = [];
// Least recently fetched first so repeated bounded runs progress through sources.
const ordered = [...sources.entries()].sort(([a], [b]) => (previous[a]?.attempted_at ?? "").localeCompare(previous[b]?.attempted_at ?? "") || a.localeCompare(b));
for (const [url, records] of ordered.slice(0, limit)) {
  const checked_at = new Date().toISOString();
  next[url] = { ...previous[url], attempted_at: checked_at };
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port || !/^[a-z][a-z0-9.-]*\.[a-z]{2,}$/i.test(parsed.hostname) || /(^|\.)(localhost|local|internal|test)$/i.test(parsed.hostname)) throw new Error("Unsupported public HTTPS source");
    // No redirects: moved sources become review tasks, never hidden fetch chains.
    const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(12000), headers: { "User-Agent": "USASI-source-review/0.2 (manual editorial checks)" } });
    if (!response.ok || !/text\/(html|plain)|application\/(json|xml)/i.test(response.headers.get("content-type") ?? "")) {
      proposals.push({ url, records, status: `manual-review-http-${response.status}`, checked_at }); continue;
    }
    const reader = response.body!.getReader(); const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 2_000_000) { await reader.cancel(); throw new Error("Source too large"); } chunks.push(value); }
    const hash = createHash("sha256").update(Buffer.concat(chunks)).digest("hex");
    next[url] = { hash, fetched_at: checked_at, attempted_at: checked_at };
    proposals.push({ url, records, status: !previous[url]?.hash ? "baseline-needs-editor-review" : previous[url].hash === hash ? "unchanged-bytes-not-revalidated" : "changed-source-needs-editor-review", checked_at, fetched_at: checked_at, previous_hash: previous[url]?.hash, current_hash: hash });
  } catch { proposals.push({ url, records, status: "fetch-failed-needs-editor-review", checked_at }); }
}
fs.writeFileSync(snapshotFile, JSON.stringify(next, null, 2) + "\n");
fs.writeFileSync(path.join(output, "queue.json"), JSON.stringify({ generated_at: new Date().toISOString(), warning: "Proposals only. No catalog fact or review date was changed. Hash differences may be cosmetic.", proposals }, null, 2) + "\n");
console.log(`Wrote ${proposals.length} source-review proposals to reports/source-review/queue.json. No content changed.`);
