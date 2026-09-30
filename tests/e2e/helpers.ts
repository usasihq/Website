import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { Page } from "@playwright/test";

export interface ContentRecord {
  slug: string;
  name: string;
  publication_status: string;
  eligibility: { status: string };
  kind?: string;
  record_level?: string;
}

export function readRecordsFrom(sub: string): ContentRecord[] {
  const dir = path.join(process.cwd(), "content", sub);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".yml"))
    .map((f) => YAML.parse(fs.readFileSync(path.join(dir, f), "utf8")) as ContentRecord);
}

export function readRecords(sub: "organizations" | "artifacts"): ContentRecord[] {
  const dir = path.join(process.cwd(), "content", sub);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".yml"))
    .map((f) => YAML.parse(fs.readFileSync(path.join(dir, f), "utf8")) as ContentRecord);
}

export const isActive = (r: ContentRecord) => r.publication_status === "published" && r.eligibility.status === "eligible";

/** Collect console errors and CSP violations for the lifetime of a page. */
export function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/** The "Showing N of M" count rendered by a directory page. */
export async function shownCount(page: Page): Promise<number> {
  const text = await page.locator("p.meta", { hasText: /^Showing \d+ of \d+/ }).first().innerText();
  return Number(text.match(/Showing (\d+)/)![1]);
}
