import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Mirrors wrangler 4.144.0 (`validateStaticRoutingRules`): a rule ending in
 * `*` makes any other rule that starts with the same prefix (minus the splat)
 * redundant. `/jobs/*` therefore covers `/jobs/at/*`; `/jobs` plus `/jobs/*`
 * is not redundant (exact path vs children).
 */
export function redundantRunWorkerFirstRules(rules: string[]): string[] {
  const invalid: string[] = [];
  for (const rule of rules) {
    if (!rule.endsWith("*")) continue;
    const prefix = rule.slice(0, -1);
    for (const other of rules) {
      if (other !== rule && other.startsWith(prefix)) {
        invalid.push(`'${other}': rule '${rule}' makes it redundant`);
      }
    }
  }
  return invalid;
}

function runWorkerFirst(): string[] {
  const text = fs.readFileSync(path.join(process.cwd(), "wrangler.jsonc"), "utf8").replace(/^\s*\/\/.*$/gm, "");
  return JSON.parse(text).assets.run_worker_first as string[];
}

describe("run_worker_first routes", () => {
  it("has no pattern made redundant by a broader '/prefix/*' rule", () => {
    expect(redundantRunWorkerFirstRules(runWorkerFirst())).toEqual([]);
  });

  it("flags /jobs/at/* when /jobs/* is already listed, and leaves /jobs + /jobs/* alone", () => {
    expect(redundantRunWorkerFirstRules(["/jobs", "/jobs/*", "/jobs/at/*"])).toEqual([
      "'/jobs/at/*': rule '/jobs/*' makes it redundant",
    ]);
    expect(redundantRunWorkerFirstRules(["/jobs", "/jobs/*"])).toEqual([]);
    expect(redundantRunWorkerFirstRules(["/people", "/people/*", "/jobs", "/jobs/*"])).toEqual([]);
  });
});
