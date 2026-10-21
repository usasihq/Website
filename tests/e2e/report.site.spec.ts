import fs from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { watchErrors } from "./helpers";

/**
 * The State of American AI (/report/ and /report/<YYYY-MM>/): answer-first
 * findings, every figure as a table with a caption and counting note, frozen
 * downloads, structured data, links in from the site, and layout plus
 * accessibility at 375 px (mobile project) and 1280 px (desktop project).
 */
const DISCLAIMER = "Independent project. Not a United States government website.";
const editions = fs
  .readdirSync("content/reports")
  .filter((f) => /^\d{4}-\d{2}\.json$/.test(f))
  .sort()
  .map((f) => JSON.parse(fs.readFileSync(`content/reports/${f}`, "utf8")) as { edition: string; title: string; tables: { id: string; rows: unknown[] }[]; findings: { text: string }[] });
const latest = editions[editions.length - 1];

async function noOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

async function axe(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s) — ${v.nodes[0]?.target.join(" ")}`);
  expect(summary, summary.join("\n")).toEqual([]);
}

async function jsonLd(page: Page) {
  const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
  return JSON.parse(raw!) as { "@graph": Record<string, unknown>[] };
}

test.describe("The State of American AI", () => {
  test("the latest edition answers first, with defined findings, frozen data, and Report and Dataset data", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("/report/");
    await expect(page.locator("h1")).toHaveText(latest.title);
    await expect(page).toHaveTitle(/^The State of American AI: latest edition/);
    await expect(page.getByTestId("report-summary")).toHaveText(/^This edition counts what the USASI catalog recorded on [A-Z][a-z]{2} \d{1,2}, \d{4}: [\d,]+ organization records/);
    const findings = page.getByTestId("report-findings").locator("li");
    await expect(findings).toHaveCount(latest.findings.length);
    await expect(findings.first()).toContainText(latest.findings[0].text);
    await expect(findings.first().getByText("Definition:")).toBeVisible();
    await expect(page.getByTestId("footer-disclaimer")).toHaveText(DISCLAIMER);

    // Every figure: a table, a caption, and how it is counted.
    for (const t of latest.tables) {
      const fig = page.locator(`[data-report-table="${t.id}"]`);
      await expect(fig.locator("table").first(), t.id).toBeAttached();
      await expect(fig.locator("[data-counted]"), t.id).toContainText("How this is counted.");
    }
    // Charts are decoration beside their table; the table is what assistive technology reads.
    await expect(page.locator("[data-chart]").first()).toHaveAttribute("aria-hidden", "true");

    const ld = await jsonLd(page);
    const types = ld["@graph"].map((n) => n["@type"]);
    expect(types).toEqual(["Report", "Dataset", "BreadcrumbList"]);
    const dataset = ld["@graph"][1] as { distribution: { contentUrl: string }[] };
    expect(dataset.distribution.map((d) => new URL(d.contentUrl).pathname)).toEqual([`/report/${latest.edition}/data.csv`, `/report/${latest.edition}/data.json`]);

    await expect(page.getByTestId("report-meta").getByRole("link", { name: "CSV" })).toHaveAttribute("href", `/report/${latest.edition}/data.csv`);
    await expect(page.getByRole("heading", { name: "Methodology and limits" })).toBeVisible();
    await expect(page.getByText("APA style")).toBeVisible();
    await expect(page.locator("pre").filter({ hasText: "@misc{usasi_report_" })).toContainText(`/report/${latest.edition}/`);
    if (editions.length === 1) await expect(page.getByTestId("report-baseline")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("each edition has a permanent page and downloads that match it", async ({ page, request }) => {
    await page.goto(`/report/${latest.edition}/`);
    await expect(page.locator("h1")).toHaveText(latest.title);
    await expect(page).toHaveTitle(`${latest.title} | USASI`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/report/${latest.edition}/$`));
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", new RegExp(`/og/report/${latest.edition}\\.jpg$`));
    await expect(page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "The State of American AI" })).toHaveAttribute("href", "/report/");

    const json = await request.get(`/report/${latest.edition}/data.json`);
    expect(json.status()).toBe(200);
    expect((await json.json()).edition).toBe(latest.edition);
    const csv = await request.get(`/report/${latest.edition}/data.csv`);
    expect(csv.status()).toBe(200);
    const lines = (await csv.text()).trimEnd().split("\r\n");
    expect(lines[0]).toBe("edition,section,table_id,table_title,unit,universe,rows_overlap,row_key,row_label,count,share");
    expect(lines.length - 1).toBeGreaterThan(latest.tables.reduce((n, t) => n + t.rows.length, 0));
    const card = await request.get(`/og/report/${latest.edition}.jpg`);
    expect(card.status()).toBe(200);
  });

  test("the homepage, About, and Data and reuse link to the report", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("home-report")).toHaveAttribute("href", "/report/");
    // The card sits directly below the Super Intelligence explainer callout.
    const order = await page.evaluate(() => {
      const si = document.querySelector('[data-testid="home-si-explainer"]');
      const report = document.querySelector('[data-testid="home-report"]');
      return si && report ? si.compareDocumentPosition(report) & Node.DOCUMENT_POSITION_FOLLOWING : 0;
    });
    expect(order).toBeTruthy();
    await page.goto("/about/");
    await expect(page.locator("main").getByRole("link", { name: "The State of American AI" })).toHaveAttribute("href", "/report/");
    await page.goto("/reuse/");
    await expect(page.locator("main").getByRole("link", { name: "The State of American AI" })).toHaveAttribute("href", "/report/");
    await expect(page.locator(`main a[href="/report/${latest.edition}/data.csv"]`)).toHaveCount(1);
  });

  test("lays out without horizontal overflow and passes automated accessibility checks", async ({ page }, info) => {
    test.setTimeout(150_000);
    // The mobile project checks the 375 px layout; the desktop project checks 1280 px.
    const width = info.project.name === "mobile" ? 375 : 1280;
    await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    fs.mkdirSync("reports/screenshots", { recursive: true });
    for (const path of ["/report/", `/report/${latest.edition}/`]) {
      await page.goto(path);
      await noOverflow(page);
      // Open the "show all" tables too, so their rows are checked as well.
      for (const d of await page.locator("main details").all()) await d.evaluate((el) => el.setAttribute("open", ""));
      await noOverflow(page);
      await axe(page);
    }
    await page.goto("/report/");
    await page.screenshot({ path: `reports/screenshots/report-${width}.png`, fullPage: true, timeout: 30_000 }).catch(() => undefined);
  });
});
