/**
 * Short “how hiring works” notes for employer job pages, stored as one YAML
 * file per company under data/jobs/hiring-process/. Add another file to cover
 * a new employer. Every claim must come from that company's official
 * careers/hiring pages, which are listed as sources and linked on the page.
 *
 * These notes are prose, not Q&A, so the page does not emit FAQPage schema.
 */
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { z } from "../zod";

export const HIRING_PROCESS_DIR = path.join(process.cwd(), "data/jobs/hiring-process");

const text = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((v) => !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v), "Expected plain text");

const httpsUrl = z
  .string()
  .url()
  .refine((v) => v.startsWith("https://"), "Expected an https URL");

export const HiringProcessSource = z
  .object({
    title: text(120),
    url: httpsUrl,
  })
  .strict();
export type HiringProcessSource = z.infer<typeof HiringProcessSource>;

export const HiringProcess = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    reviewed_at: z.iso.date(),
    hosts: z.array(z.string().trim().min(1).max(120)).min(1).max(8),
    paragraphs: z.array(text(800)).min(1).max(6),
    steps: z.array(text(240)).max(10).optional(),
    sources: z.array(HiringProcessSource).min(1).max(6),
  })
  .strict();
export type HiringProcess = z.infer<typeof HiringProcess>;

/** Whether `url` is https and its host is one of the company's official hosts (or a subdomain). */
export function sourceHostAllowed(url: string, hosts: string[]): boolean {
  let hostname: string;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return false;
  }
  return hosts.some((raw) => {
    const host = raw.replace(/^www\./, "").toLowerCase();
    return hostname === host || hostname.endsWith(`.${host}`);
  });
}

function parseFile(file: string): HiringProcess {
  const text = fs.readFileSync(file, "utf8");
  const doc = YAML.parseDocument(text, { prettyErrors: true, uniqueKeys: true });
  if (doc.errors.length > 0) throw new Error(`${path.basename(file)}: ${doc.errors.map((e) => e.message).join("; ")}`);
  const parsed = HiringProcess.parse(doc.toJS());
  const slug = path.basename(file, path.extname(file));
  if (parsed.slug !== slug) throw new Error(`${path.basename(file)}: slug "${parsed.slug}" must match the file name`);
  for (const source of parsed.sources) {
    if (!sourceHostAllowed(source.url, parsed.hosts)) {
      throw new Error(`${path.basename(file)}: source ${source.url} is not on an official host (${parsed.hosts.join(", ")})`);
    }
  }
  return parsed;
}

let cached: Map<string, HiringProcess> | null = null;

/** Every hiring-process note, keyed by organization slug. Missing directory is empty. */
export function loadHiringProcesses(dir: string = HIRING_PROCESS_DIR): Map<string, HiringProcess> {
  if (dir === HIRING_PROCESS_DIR && cached) return cached;
  const map = new Map<string, HiringProcess>();
  if (!fs.existsSync(dir)) {
    if (dir === HIRING_PROCESS_DIR) cached = map;
    return map;
  }
  for (const name of fs.readdirSync(dir).sort()) {
    if (!/\.ya?ml$/.test(name)) continue;
    const note = parseFile(path.join(dir, name));
    if (map.has(note.slug)) throw new Error(`Duplicate hiring-process slug "${note.slug}"`);
    map.set(note.slug, note);
  }
  if (dir === HIRING_PROCESS_DIR) cached = map;
  return map;
}

export function hiringProcessFor(slug: string): HiringProcess | null {
  return loadHiringProcesses().get(slug) ?? null;
}
