/**
 * Writes one shields-style SVG rank badge per AI on GitHub project and per
 * AI on Hugging Face model into public/badges/{github,huggingface}/<slug>.svg.
 *
 * Called from `npm run prepare:data` (and therefore from `npm run build` and
 * `npm run dev`). String templates only: no Playwright, no fonts, no JPEGs.
 * Ranks are the same `rank` fields the pages already display.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rankBadge, type RankBadgeKind } from "../lib/badges";
import { githubEntries } from "../lib/github/projects";
import { hfModelEntries } from "../lib/huggingface/items";

const KINDS: RankBadgeKind[] = ["github", "huggingface"];

export function collectRankBadges() {
  return [
    ...githubEntries().map((e) => rankBadge("github", e.slug, e.rank)),
    ...hfModelEntries().map((e) => rankBadge("huggingface", e.slug, e.rank)),
  ];
}

/** Write badges under `publicDir` (usually public/). Removes stale rank files only. */
export function writeRankBadgeFiles(
  publicDir: string,
  badges: { path: string; svg: string }[],
): { written: number; unchanged: number; removed: number; ms: number } {
  const started = Date.now();
  const wanted = new Map<string, string>();
  for (const b of badges) {
    if (!b.path.startsWith("/badges/") || !b.path.endsWith(".svg")) throw new Error(`refusing to write ${b.path}`);
    wanted.set(b.path, b.svg);
  }
  for (const kind of KINDS) fs.mkdirSync(path.join(publicDir, "badges", kind), { recursive: true });

  let written = 0;
  let unchanged = 0;
  for (const [rel, svg] of wanted) {
    const file = path.join(publicDir, rel.slice(1));
    try {
      if (fs.readFileSync(file, "utf8") === svg) {
        unchanged += 1;
        continue;
      }
    } catch {
      /* missing */
    }
    fs.writeFileSync(file, svg);
    written += 1;
  }

  let removed = 0;
  for (const kind of KINDS) {
    const dir = path.join(publicDir, "badges", kind);
    for (const name of fs.readdirSync(dir)) {
      const rel = `/badges/${kind}/${name}`;
      if (wanted.has(rel)) continue;
      fs.rmSync(path.join(dir, name), { force: true });
      removed += 1;
    }
  }
  return { written, unchanged, removed, ms: Date.now() - started };
}

export function generateRankBadges(publicDir = path.join(process.cwd(), "public")) {
  const badges = collectRankBadges();
  const stats = writeRankBadgeFiles(publicDir, badges);
  const github = badges.filter((b) => b.path.startsWith("/badges/github/")).length;
  const models = badges.length - github;
  console.log(
    `badges: ${github} GitHub + ${models} Hugging Face models → public/badges (${stats.written} written, ${stats.unchanged} unchanged, ${stats.removed} removed, ${stats.ms} ms)`,
  );
  return { badges, stats, github, models };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) generateRankBadges();
