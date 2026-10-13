import fs from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { watchErrors } from "./helpers";

/**
 * Fixed "what can I run on N GB" pages (/find/memory/) and one page per
 * policy document (/policy/<slug>/): answer-first content, structured data,
 * links in and out, old tracker anchors, accessibility, and phone layout.
 */
const DISCLAIMER = "Independent project. Not a United States government website.";

async function jsonLd(page: Page) {
  const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
  return JSON.parse(raw!) as { "@graph": Record<string, unknown>[] };
}

async function noOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

async function axe(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s) — ${v.nodes[0]?.target.join(" ")}`);
  expect(summary, summary.join("\n")).toEqual([]);
}

test.describe("local AI by memory", () => {
  test("a VRAM page answers first, lists entries that match its structured data, and opens the finder pre-filled", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await page.goto("/find/memory/8gb-vram/");
    await expect(page.locator("h1")).toHaveText("AI models you can run on 8 GB of VRAM");
    await expect(page).toHaveTitle(/^AI models you can run on 8 GB of VRAM \(documented\)/);
    await expect(page.getByTestId("memory-answer")).toHaveText(/^With 8 GB of graphics memory \(VRAM\), you can run \d+ documented local configuration/);
    await expect(page.getByTestId("footer-disclaimer")).toHaveText(DISCLAIMER);

    const ld = await jsonLd(page);
    const list = ld["@graph"].find((x) => x["@type"] === "ItemList")!;
    const crumbs = ld["@graph"].find((x) => x["@type"] === "BreadcrumbList")!;
    expect(crumbs).toBeTruthy();
    const entries = page.locator("[data-memory-entry]");
    await expect(entries).toHaveCount(list.numberOfItems as number);
    expect(list.numberOfItems).toBeGreaterThan(0);

    // Every entry names its variant, documented figure with a source, license, and both onward links.
    const first = entries.first();
    for (const term of ["Variant", "Documented memory", "License", "Documented for"]) await expect(first.getByText(term, { exact: true })).toBeVisible();
    await expect(first.getByText(/^About [\d.]+ GB of graphics memory$/)).toBeVisible();
    await expect(first.getByRole("link", { name: /^Catalog record: / })).toHaveAttribute("href", /^\/open\/[a-z0-9-]+\/$/);
    const slug = await first.getAttribute("data-memory-entry");
    const title = await first.locator("h3").innerText();

    await expect(page.getByRole("heading", { name: "How this list is made" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Choose another amount of memory" }).getByRole("link", { name: /^24 GB of VRAM \(\d+ configurations\s*\)$/ })).toHaveAttribute("href", "/find/memory/24gb-vram/");

    await first.getByRole("link", { name: "Open in the finder with 8 GB VRAM" }).click();
    await expect(page).toHaveURL(/\/find\/\?task=[a-z-]+&where=local&vram=8&skill=advanced$/);
    const match = page.locator("#finder-results").locator(`article#${slug}`);
    await expect(match).toBeVisible();
    await expect(match.locator("h3")).toHaveText(title);
    await expect(match).toContainText("Estimated to fit, not tested");
    expect(errors).toEqual([]);
  });

  test("the Apple silicon pages compare unified memory and show what needs more", async ({ page }) => {
    await page.goto("/find/memory/8gb-apple-silicon/");
    await expect(page.locator("h1")).toHaveText("AI models you can run on an 8 GB Apple silicon Mac");
    await expect(page.getByTestId("memory-answer")).toHaveText(/^With 8 GB of unified memory on an Apple silicon Mac/);
    await page.goto("/find/memory/16gb-apple-silicon/");
    const n16 = await page.locator("[data-memory-entry]").count();
    await page.goto("/find/memory/8gb-apple-silicon/");
    const n8 = await page.locator("[data-memory-entry]").count();
    expect(n16).toBeGreaterThanOrEqual(n8);
    if (n16 > n8) await expect(page.getByRole("heading", { name: /^Documented, but needs more than 8 GB/ })).toBeVisible();
  });

  test("the index, the finder, and the local AI hub link to the memory pages", async ({ page }) => {
    await page.goto("/find/memory/");
    await expect(page.locator("h1")).toHaveText("Local AI models by memory");
    for (const slug of ["8gb-vram", "12gb-vram", "16gb-vram", "24gb-vram", "16gb-apple-silicon", "64gb-apple-silicon"]) {
      await expect(page.locator(`a[href="/find/memory/${slug}/"]`)).toHaveCount(1);
    }
    await page.goto("/find/");
    await expect(page.getByRole("navigation", { name: "Local AI by memory" }).getByRole("link", { name: "12 GB of VRAM" })).toHaveAttribute("href", "/find/memory/12gb-vram/");
    await page.goto("/hubs/local-ai/");
    await expect(page.getByRole("link", { name: "Local AI by memory" })).toHaveAttribute("href", "/find/memory/");
  });

  test("memory pages pass automated accessibility checks", async ({ page }) => {
    test.setTimeout(120_000);
    for (const path of ["/find/memory/", "/find/memory/16gb-vram/", "/find/memory/8gb-apple-silicon/"]) {
      await page.goto(path);
      await axe(page);
      await noOverflow(page);
    }
  });
});

test.describe("policy document pages", () => {
  test("EO 14434 has its own page: heading, answer, provisions, status, sources, and Legislation data", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("/policy/eo-14434/");
    await expect(page.locator("h1")).toHaveText("Executive Order 14434: Inaugurating the Era of Super Intelligence");
    await expect(page).toHaveTitle(/^Executive Order 14434: summary, key provisions & sources/);
    await expect(page.getByTestId("policy-answer")).toContainText("Sets a policy that, to the maximum extent permitted by law");
    await expect(page.getByRole("heading", { name: "Key provisions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Status: In effect" })).toBeVisible();
    await expect(page.locator("[data-sources] li")).toHaveCount(4);
    await expect(page.getByTestId("footer-disclaimer")).toHaveText(DISCLAIMER);
    const ld = await jsonLd(page);
    const doc = ld["@graph"].find((x) => x["@type"] === "Legislation")!;
    expect(doc).toMatchObject({ legislationIdentifier: "EO 14434", legislationDate: "2026-09-29", legislationJurisdiction: "US", legislationLegalForce: "https://schema.org/InForce" });
    expect(ld["@graph"].some((x) => x["@type"] === "BreadcrumbList")).toBe(true);

    await page.getByRole("link", { name: "See this entry in the policy tracker" }).click();
    await expect(page).toHaveURL(/\/policy\/#eo-14434$/);
    await expect(page.locator("li#eo-14434")).toBeInViewport();
    expect(errors).toEqual([]);
  });

  test("the tracker links every entry to its page and keeps the old anchors", async ({ page }) => {
    await page.goto("/policy/#m-24-10");
    await expect(page.locator("li#m-24-10")).toBeInViewport();
    const entries = page.locator('section[aria-labelledby^="year-"] ol > li[id]');
    const count = await entries.count();
    expect(count).toBeGreaterThan(20);
    for (let i = 0; i < count; i++) {
      const id = await entries.nth(i).getAttribute("id");
      await expect(entries.nth(i).locator("h3 a")).toHaveAttribute("href", `/policy/${id}/`);
    }
    await page.locator("li#m-24-10 h3 a").click();
    await expect(page).toHaveURL(/\/policy\/m-24-10\/$/);
    await expect(page.getByText("Replaced by", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /^OMB Memorandum M-25-21:/ })).toHaveAttribute("href", "/policy/m-25-21/");
  });

  test("a framework page uses Article data and passes accessibility checks", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/policy/ai-rmf-1-0/");
    await expect(page.locator("h1")).toHaveText("NIST AI 100-1, Artificial Intelligence Risk Management Framework (AI RMF 1.0)");
    const ld = await jsonLd(page);
    expect(ld["@graph"].find((x) => x["@type"] === "Article")).toBeTruthy();
    await axe(page);
    await noOverflow(page);
    await page.goto("/policy/eo-14434/");
    await axe(page);
    await noOverflow(page);
  });
});

test("screenshots at 375 and 1280 px", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Screenshots once, from the desktop project");
  test.setTimeout(120_000);
  fs.mkdirSync("reports/screenshots", { recursive: true });
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: width < 768 ? 812 : 1000 });
    for (const [name, path] of [
      ["memory-8gb-vram", "/find/memory/8gb-vram/"],
      ["policy-eo-14434", "/policy/eo-14434/"],
    ]) {
      await page.goto(path, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      await noOverflow(page);
      await page.screenshot({ path: `reports/screenshots/${name}-${width}.png`, fullPage: true, timeout: 30_000 }).catch(() => undefined);
    }
  }
});
