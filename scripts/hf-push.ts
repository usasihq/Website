/**
 * Tiny Hugging Face Hub helpers for the jobs dataset and Space uploads.
 * Missing or empty HF_TOKEN is a skip, never an error.
 */
import fs from "node:fs";
import path from "node:path";

export const HF_TOKEN_ENV = "HF_TOKEN";
const HUB = "https://huggingface.co";

export function hfAccessToken(env: NodeJS.ProcessEnv = process.env): string | null {
  const token = env[HF_TOKEN_ENV]?.trim();
  return token ? token : null;
}

type HubRepoType = "dataset" | "space";
type HubFile = { path: string; content: Buffer };

async function hubFetch(url: string, token: string, init: RequestInit & { timeoutMs?: number } = {}): Promise<Response> {
  const timeoutMs = init.timeoutMs ?? 60_000;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: ac.signal,
      headers: { Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
    });
  } finally {
    clearTimeout(timer);
  }
}

type HubSpaceSdk = "static" | "gradio";

/** Create a public Hub repo if it is missing. 409 / already-exists is success. */
export async function ensureHubRepo(opts: {
  type: HubRepoType;
  name: string;
  token: string;
  sdk?: HubSpaceSdk;
}): Promise<"created" | "exists"> {
  const [organization, repoName] = opts.name.split("/");
  if (!organization || !repoName) throw new Error(`invalid Hub repo id ${opts.name}`);
  const res = await hubFetch(`${HUB}/api/repos/create`, opts.token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: opts.type,
      name: repoName,
      organization,
      private: false,
      ...(opts.type === "space" ? { sdk: opts.sdk ?? "static" } : {}),
    }),
  });
  if (res.ok) return "created";
  const text = await res.text();
  if (res.status === 409 || /already been created|already exists/i.test(text)) return "exists";
  throw new Error(`create ${opts.type} ${opts.name}: ${res.status} ${text.slice(0, 240)}`);
}

/** Convert an existing Space to static (free) or another SDK. */
export async function setHubSpaceSdk(opts: {
  name: string;
  token: string;
  sdk: HubSpaceSdk;
}): Promise<void> {
  const res = await hubFetch(`${HUB}/api/spaces/${opts.name}/settings`, opts.token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sdk: opts.sdk }),
  });
  if (res.ok) return;
  const text = await res.text();
  if (res.status === 400 && /already|same|static/i.test(text)) return;
  throw new Error(`set ${opts.name} sdk=${opts.sdk}: ${res.status} ${text.slice(0, 240)}`);
}

export async function commitHubFiles(opts: {
  type: HubRepoType;
  name: string;
  token: string;
  files: HubFile[];
  deletePaths?: string[];
  title: string;
}): Promise<void> {
  const { commit, listFiles } = await import("@huggingface/hub");
  const repo = { type: opts.type, name: opts.name };
  const listed = new Set<string>();
  try {
    for await (const file of listFiles({ repo, accessToken: opts.token })) listed.add(file.path);
  } catch {
    /* empty or missing repo: commit still works after ensureHubRepo */
  }
  const operations: Array<
    | { operation: "addOrUpdate"; path: string; content: Blob }
    | { operation: "delete"; path: string }
  > = opts.files.map((file) => ({
    operation: "addOrUpdate" as const,
    path: file.path,
    content: new Blob([new Uint8Array(file.content)]),
  }));
  for (const pathInRepo of opts.deletePaths ?? []) {
    if (listed.has(pathInRepo)) operations.push({ operation: "delete", path: pathInRepo });
  }
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 90_000);
  try {
    await commit({
      repo,
      accessToken: opts.token,
      title: opts.title,
      operations,
      abortSignal: ac.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export function readUploadFiles(dir: string, names: string[]): HubFile[] {
  return names.map((name) => ({
    path: name,
    content: fs.readFileSync(path.join(dir, name)),
  }));
}
