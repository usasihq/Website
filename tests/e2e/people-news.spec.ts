import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * The People directory (/people/), profile pages (/people/<slug>/), and the
 * filterable Latest news list (/news/). Counts change as profiles and items
 * are added, so the tests compare the pages with themselves.
 */
const jsonLd = async (page: import("@playwright/test").Page) => (await page.locator('script[type="application/ld+json"]').allTextContents()).join("\n");
/** The visible "Showing N of M news items" line. */
const summaryCount = async (page: import("@playwright/test").Page) => {
  const text = (await page.getByText(/^Showing [\d,]+ of [\d,]+ news items?$/).first().textContent()) ?? "";
  return Number((/^Showing ([\d,]+)/.exec(text)?.[1] ?? "NaN").replace(/,/g, ""));
};

test("the People directory lists profiles and filters them by group and organization", async ({ page }) => {
  await page.goto("/people/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The people behind U.S. AI");
  const list = page.getByTestId("people-list");
  await expect(list.locator(":scope > li").first()).toBeVisible();
  await page.getByRole("button", { name: /^Local SI/ }).click();
  await expect(page).toHaveURL(/\/people\/\?group=local$/);
  const cards = await list.locator(":scope > li").count();
  expect(cards).toBeGreaterThan(0);
  await page.getByLabel("Organization", { exact: true }).selectOption("hugging-face");
  await expect(page).toHaveURL(/group=local&org=hugging-face/);
  for (const card of await list.locator(":scope > li").all()) await expect(card).toContainText("Hugging Face");
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await expect(page).toHaveURL(/\/people\/$/);
  const ld = await jsonLd(page);
  expect(ld).toContain('"CollectionPage"');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("a profile page has its bio, work, sources, structured data, and a way to request corrections", async ({ page }) => {
  await page.goto("/people/tri-dao/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tri Dao");
  await expect(page.getByTestId("person-bio")).toContainText("FlashAttention");
  await expect(page.getByTestId("person-work").locator(":scope > li")).not.toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Breadcrumb" }).locator('a[href="/people/"]')).toBeVisible();
  await expect(page.getByRole("list", { name: "Current roles" }).locator('a[href="/companies/princeton-university/"]')).toBeVisible();
  await expect(page.getByTestId("person-related").locator('a[href^="/people/"], a[href^="/big-si/"]').first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /^References · reviewed/ })).toBeVisible();
  await expect(page.locator('main a[href="/contribute/#corrections"]').first()).toBeVisible();
  const ld = await jsonLd(page);
  expect(ld).toContain('"ProfilePage"');
  expect(ld).toContain('"BreadcrumbList"');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/people\/tri-dao\/$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\/people\/tri-dao\.jpg$/);
});

test("a creator bio drops a repeated name/org title and still links to other people", async ({ page }) => {
  await page.goto("/people/wes-roth/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Wes Roth");
  const title = await page.title();
  expect(title).toMatch(/^Wes Roth, Creator/);
  expect(title).not.toMatch(/Wes Roth at Wes Roth/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
  await expect(page.getByTestId("person-related").locator('a[href^="/people/"], a[href^="/big-si/"]').first()).toBeVisible();
  await expect(page.getByTestId("person-related-hubs").locator("a").first()).toBeVisible();
});

test("organization pages link to the profiles of people tied to them", async ({ page }) => {
  await page.goto("/companies/hugging-face/");
  const box = page.getByTestId("org-people");
  await expect(box.locator('a[href^="/people/"]').first()).toBeVisible();
});

test("the news list groups items by month and filters by category", async ({ page }) => {
  await page.goto("/news/");
  const list = page.getByTestId("news-list");
  await expect(list.locator("h2").first()).toHaveText(/^[A-Z][a-z]+ \d{4}$/);
  const dates = await list.locator("article time").evaluateAll((els) => els.map((e) => e.getAttribute("datetime") ?? ""));
  expect(dates).toEqual([...dates].sort().reverse());
  const all = await summaryCount(page);
  await page.getByRole("button", { name: /^Release/ }).click();
  await expect(page).toHaveURL(/\/news\/\?category=release$/);
  for (const meta of await list.locator("article p.meta").allTextContents()) expect(meta).toContain("Release");
  expect(await summaryCount(page)).toBeLessThanOrEqual(all);
});

test("people and news pages pass axe", async ({ page }) => {
  for (const path of ["/people/", "/people/tri-dao/", "/news/", "/local/", "/voices/"]) {
    await page.goto(path);
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations.map((v) => `${path}: ${v.id}`)).toEqual([]);
  }
});
