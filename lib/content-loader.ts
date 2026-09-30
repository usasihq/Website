/**
 * Reads catalog YAML from disk. Node-only; never import from client components.
 */
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { RawContent, RawDocument } from "./validate";

export const DEFAULT_CONTENT_DIR = path.join(process.cwd(), "content");

function readYamlDir(root: string, sub: string): RawDocument[] {
  const dir = path.join(root, sub);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => /\.ya?ml$/.test(name))
    .sort()
    .map((name) => readYamlFile(root, path.join(sub, name)));
}

function readYamlFile(root: string, relative: string): RawDocument {
  const text = fs.readFileSync(path.join(root, relative), "utf8");
  const doc = YAML.parseDocument(text, { prettyErrors: true, uniqueKeys: true });
  if (doc.errors.length > 0) {
    // Surface YAML syntax errors as schema-level failures with the file name.
    return { file: relative, data: { __yaml_error: doc.errors.map((e) => e.message).join("; ") } };
  }
  return { file: relative, data: doc.toJS() };
}

export function readRawContent(root: string = DEFAULT_CONTENT_DIR): RawContent {
  const featuredPath = path.join(root, "featured.yml");
  const cornerPath = path.join(root, "local-corner.yml");
  return {
    organizations: readYamlDir(root, "organizations"),
    artifacts: readYamlDir(root, "artifacts"),
    changelog: readYamlDir(root, "changelog"),
    featured: fs.existsSync(featuredPath) ? readYamlFile(root, "featured.yml") : null,
    people: readYamlDir(root, "people"),
    localCorner: fs.existsSync(cornerPath) ? readYamlFile(root, "local-corner.yml") : null,
    news: readYamlDir(root, "news"),
  };
}

/** Today's date (UTC) for future-date checks. USASI_TODAY overrides it in tests. */
export function todayIso(): string {
  return process.env.USASI_TODAY ?? new Date().toISOString().slice(0, 10);
}
