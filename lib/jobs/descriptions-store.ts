/**
 * Job descriptions, stored apart from data/jobs/current.json because they are
 * large: data/jobs/descriptions.json maps a job ID to its Description (see
 * description.ts). Operational state like the jobs snapshot, never committed.
 * A missing or unreadable file means pages render without descriptions; it
 * never fails a build.
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "../zod";
import { Description } from "./description";

export const DESCRIPTIONS_PATH = path.join(process.cwd(), "data/jobs/descriptions.json");

export const DescriptionStore = z
  .object({ version: z.literal(1), descriptions: z.record(z.string().regex(/^[a-z0-9-]+:(greenhouse|ashby|usajobs):[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$/), Description) })
  .strict();
export type DescriptionStore = z.infer<typeof DescriptionStore>;

export function readDescriptions(file = DESCRIPTIONS_PATH): Map<string, Description> {
  if (!fs.existsSync(file)) return new Map();
  try {
    const store = DescriptionStore.parse(JSON.parse(fs.readFileSync(file, "utf8")));
    return new Map(Object.entries(store.descriptions));
  } catch {
    console.warn("jobs: descriptions file is unreadable; job pages are built without descriptions");
    return new Map();
  }
}

export function writeDescriptions(map: Map<string, Description>, file = DESCRIPTIONS_PATH): void {
  const store: DescriptionStore = { version: 1, descriptions: Object.fromEntries([...map].sort((a, b) => (a[0] < b[0] ? -1 : 1))) };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(store) + "\n");
  fs.renameSync(`${file}.tmp`, file);
}
