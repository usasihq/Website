import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { isActive, readRecords } from "./helpers";

/**
 * Automated accessibility checks (axe-core, WCAG 2.0/2.1/2.2 A and AA rules).
 * Passing these is necessary but not sufficient for WCAG 2.2 AA conformance;
 * manual keyboard and screen-reader review is still required.
 */
const org = readRecords("organizations").filter(isActive)[0];
const family = readRecords("artifacts").find((a) => isActive(a) && a.record_level === "family")!;
const release = readRecords("artifacts").find((a) => isActive(a) && a.record_level === "release")!;
const project = readRecords("artifacts").find((a) => isActive(a) && a.record_level === "project")!;

const PAGES = [
  "/",
  "/companies/",
  "/open/",
  `/companies/${org.slug}/`,
  `/open/${family.slug}/`,
  `/open/${release.slug}/`,
  `/open/${project.slug}/`,
  "/matrix/",
  "/methodology/",
  "/compact/",
  "/support/",
  "/privacy/",
  "/contribute/",
  "/changelog/",
  "/start/",
  "/glossary/",
  "/learn/open-weight-vs-open-source/",
  "/reuse/",
  "/no-such-page/",
];

for (const path of PAGES) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s) — ${v.nodes[0]?.target.join(" ")}`);
    expect(summary, summary.join("\n")).toEqual([]);
  });
}

test("filtered directory state stays accessible", async ({ page }) => {
  await page.goto("/open/?kind=model&level=release&tier=open-weight");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});

test("expanded comparison and directory controls stay accessible", async ({ page }) => {
  await page.goto("/matrix/?orgs=openai,ai2&detail=1");
  await page.getByText("Column definitions and counting rules", { exact: true }).click();
  let results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
  await page.goto("/open/?q=gemma");
  await page.getByText("Filters and sort", { exact: false }).click();
  results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});
