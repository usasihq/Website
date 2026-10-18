/**
 * npm run github:refresh [-- --offline] [-- --max-pages N]
 *
 * Refreshes data/github/projects.json from the PUBLIC GitHub REST search API
 * (no authentication, no account or email in any header). Network access
 * happens here only; the build reads the committed snapshot.
 *
 * Unauthenticated search allows 10 requests a minute, so calls are spaced
 * ~7 s apart and the run stops cleanly on 403/429, keeping what it has. Raw
 * results are cached in .cache/github/ so `--offline` re-applies the filters
 * without the network. If a run gets fewer repositories than the previous
 * snapshot's fetched_count * 0.8, the snapshot is kept (pass --force to write).
 * After the searches it looks up data/github/includes.yml and the catalog's
 * own GitHub repositories (`--includes-only` does just that, merged into the
 * cached run).
 */
import fs from "node:fs";
import path from "node:path";
import { compareProjects, exclusionReason, toProject, type ExclusionReason, type RawRepo } from "../lib/github/filters";
import { catalogGithubRepos, denylistMap, reviewedAiRepos, GITHUB_DATA_PATH, readDenylist, readGithubDataset, readIncludes, writeGithubDataset } from "../lib/github/load";
import type { GithubDataset } from "../lib/github/schema";

export const GITHUB_TOPICS = [
  "artificial-intelligence", "machine-learning", "deep-learning", "llm", "large-language-models", "ai-agents", "agents",
  "generative-ai", "llmops", "rag", "transformers", "pytorch", "diffusion", "stable-diffusion", "computer-vision", "nlp",
  "reinforcement-learning", "mlops", "ai", "chatgpt", "openai", "local-llm", "inference", "speech-recognition",
  "text-to-speech", "multimodal", "llama", "gpt", "neural-network", "tensorflow", "ai-agent", "mcp", "claude-code",
  "vector-database",
];
/** Free-text searches for well-known projects that carry none of the topics above. */
export const GITHUB_TEXT_QUERIES = ["llm", "machine learning", "deep learning", "language model", "speech recognition", "neural network"];
const MIN_STARS = 500;
const USER_AGENT = "USASI-catalog-research/0.3";
const PAUSE_MS = 7_000;
const CACHE = path.join(process.cwd(), ".cache/github/raw-search.json");

const args = process.argv.slice(2);
const offline = args.includes("--offline");
const force = args.includes("--force");
const maxPagesArg = args.indexOf("--max-pages");
const maxPages = maxPagesArg >= 0 ? Number(args[maxPagesArg + 1]) : 10;
// --only-new: run only the queries the cache has not completed, and merge (for adding queries without a full run).
const onlyNew = args.includes("--only-new");
// --includes-only: look up only data/github/includes.yml and the catalog's repositories, and merge into the cached run.
const includesOnly = args.includes("--includes-only");

type Cache = { fetched_at: string; queries: string[]; items: Record<string, RawRepo> };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const githubQueries = () => [
  ...GITHUB_TOPICS.map((t) => `topic:${t} stars:>=${MIN_STARS}`),
  ...GITHUB_TEXT_QUERIES.map((t) => `${t.includes(" ") ? `"${t}"` : t} in:name,description stars:>=${MIN_STARS}`),
];

async function fetchAll(base?: Cache): Promise<Cache> {
  const items: Record<string, RawRepo> = { ...(base?.items ?? {}) };
  const done: string[] = [...(base?.queries ?? [])];
  let calls = 0;
  outer: for (const q of githubQueries()) {
    if (done.includes(q)) continue;
    const topic = q;
    for (let page = 1; page <= maxPages; page++) {
      if (calls > 0) await sleep(PAUSE_MS);
      calls++;
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=100&page=${page}`;
      let res: Response;
      try {
        res = await fetch(url, {
          headers: { Accept: "application/vnd.github+json", "User-Agent": USER_AGENT, "X-GitHub-Api-Version": "2022-11-28" },
        });
      } catch (err) {
        console.log(`github: network error on ${topic} p${page}: ${(err as Error).message}; stopping.`);
        break outer;
      }
      if (res.status === 403 || res.status === 429) {
        const reset = res.headers.get("x-ratelimit-reset");
        console.log(`github: rate limited (${res.status}) on ${topic} p${page}${reset ? `, resets ${new Date(Number(reset) * 1000).toISOString()}` : ""}; stopping with what we have.`);
        break outer;
      }
      if (res.status === 422) break; // past the 1,000-result window
      if (!res.ok) {
        console.log(`github: HTTP ${res.status} on ${topic} p${page}; skipping the rest of this topic.`);
        break;
      }
      const body = (await res.json()) as { total_count: number; items: RawRepo[] };
      for (const item of body.items) items[String(item.id)] = item;
      process.stdout.write(`github: ${topic} p${page} +${body.items.length} (unique ${Object.keys(items).length}, total ${body.total_count})\n`);
      if (body.items.length < 100 || page * 100 >= Math.min(body.total_count, 1000)) break;
    }
    done.push(q);
  }
  return { fetched_at: base?.fetched_at ?? new Date().toISOString().replace(/\.\d{3}Z$/, "Z"), queries: done, items };
}

const HEADERS = { Accept: "application/vnd.github+json", "User-Agent": USER_AGENT, "X-GitHub-Api-Version": "2022-11-28" };

/**
 * Projects the searches can miss. Must-includes are fetched one by one with
 * GET /repos (unauthenticated: 60 requests an hour, so the list stays short).
 * The catalog's own repositories (about 200) are looked up in batches with
 * search "repo:" qualifiers instead, which the search limit allows. Either way
 * the same rules and denylist apply afterwards.
 */
async function fetchIncludes(cache: Cache): Promise<{ added: string[]; missing: string[] }> {
  const have = new Set(Object.values(cache.items).map((r) => r.full_name.toLowerCase()));
  const added: string[] = [];
  const missing: string[] = [];
  for (const [i, inc] of readIncludes().entries()) {
    if (i > 0) await sleep(1_500);
    let res: Response;
    try {
      res = await fetch(`https://api.github.com/repos/${inc.full_name}`, { headers: HEADERS });
    } catch (err) {
      console.log(`github: network error on ${inc.full_name}: ${(err as Error).message}; stopping includes.`);
      break;
    }
    if (res.status === 403 || res.status === 429) {
      console.log(`github: rate limited (${res.status}) on ${inc.full_name}; stopping includes.`);
      break;
    }
    if (!res.ok) {
      missing.push(`${inc.full_name} (HTTP ${res.status})`);
      continue;
    }
    const repo = (await res.json()) as RawRepo;
    if (!have.has(repo.full_name.toLowerCase())) added.push(repo.full_name);
    cache.items[String(repo.id)] = repo;
    have.add(repo.full_name.toLowerCase());
  }
  const want = catalogGithubRepos().filter((n) => !have.has(n.toLowerCase()));
  const batches: string[][] = [];
  for (const name of want) {
    const last = batches[batches.length - 1];
    if (last && [...last, name].map((n) => `repo:${n}`).join(" ").length < 230) last.push(name);
    else batches.push([name]);
  }
  let calls = 0;
  const search = async (batch: string[]): Promise<boolean> => {
    if (calls++ > 0) await sleep(PAUSE_MS);
    const q = batch.map((n) => `repo:${n}`).join(" ");
    let res: Response;
    try {
      res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&per_page=100`, { headers: HEADERS });
    } catch {
      return false;
    }
    if (res.status === 403 || res.status === 429) return false;
    // 422: one of the repositories does not exist (or is private); split the batch to find it.
    if (res.status === 422) {
      if (batch.length === 1) {
        missing.push(`${batch[0]} (catalog link; not found)`);
        return true;
      }
      const mid = Math.ceil(batch.length / 2);
      return (await search(batch.slice(0, mid))) && (await search(batch.slice(mid)));
    }
    if (!res.ok) return true;
    const body = (await res.json()) as { items: RawRepo[] };
    for (const repo of body.items) {
      if (!have.has(repo.full_name.toLowerCase())) added.push(repo.full_name);
      cache.items[String(repo.id)] = repo;
      have.add(repo.full_name.toLowerCase());
    }
    return true;
  };
  for (const b of batches) {
    if (!(await search(b))) {
      console.log("github: rate limited or network error during catalog lookups; stopping with what we have.");
      break;
    }
  }
  console.log(`github: includes and catalog repositories: ${added.length} not in the searches${missing.length ? `; not found: ${missing.join(", ")}` : ""}`);
  return { added, missing };
}

let cache: Cache;
if (offline) {
  cache = JSON.parse(fs.readFileSync(CACHE, "utf8")) as Cache;
  console.log(`github: offline, ${Object.keys(cache.items).length} cached repositories from ${cache.fetched_at}`);
} else if (includesOnly) {
  cache = JSON.parse(fs.readFileSync(CACHE, "utf8")) as Cache;
  await fetchIncludes(cache);
  fs.writeFileSync(CACHE, JSON.stringify(cache));
} else if (onlyNew) {
  cache = await fetchAll(JSON.parse(fs.readFileSync(CACHE, "utf8")) as Cache);
  await fetchIncludes(cache);
  fs.writeFileSync(CACHE, JSON.stringify(cache));
} else {
  cache = await fetchAll();
  await sleep(PAUSE_MS);
  await fetchIncludes(cache);
  fs.mkdirSync(path.dirname(CACHE), { recursive: true });
  fs.writeFileSync(CACHE, JSON.stringify(cache));
}

const deny = denylistMap(readDenylist());
const reviewed = reviewedAiRepos();
const excluded: Partial<Record<ExclusionReason, number>> = {};
const kept: GithubDataset["projects"] = [];
for (const raw of Object.values(cache.items)) {
  if (raw.stargazers_count < MIN_STARS) continue;
  const reason = exclusionReason(raw, deny, reviewed);
  if (reason) {
    excluded[reason] = (excluded[reason] ?? 0) + 1;
    continue;
  }
  kept.push(toProject(raw));
}
kept.sort(compareProjects);

const fetchedCount = Object.keys(cache.items).length;
let previous: GithubDataset | undefined;
try {
  previous = readGithubDataset();
} catch {
  previous = undefined;
}
if (!force && previous && fetchedCount < previous.fetched_count * 0.8) {
  console.log(`github: only ${fetchedCount} repositories fetched (previous ${previous.fetched_count}); keeping the snapshot. Use --force to write.`);
  process.exit(0);
}
if (cache.queries.length === 0) {
  console.log("github: no query completed; keeping the snapshot.");
  process.exit(0);
}

const dataset: GithubDataset = {
  fetched_at: cache.fetched_at,
  source: "https://api.github.com/search/repositories",
  queries: cache.queries,
  min_stars: MIN_STARS,
  fetched_count: fetchedCount,
  excluded: Object.fromEntries(Object.entries(excluded).sort(([a], [b]) => a.localeCompare(b))),
  projects: kept,
};
writeGithubDataset(dataset);
console.log(
  `github: ${fetchedCount} fetched, ${fetchedCount - kept.length} excluded (${Object.entries(excluded).map(([k, v]) => `${k}=${v}`).join(" ")}), ${kept.length} written to ${path.relative(process.cwd(), GITHUB_DATA_PATH)}`,
);
