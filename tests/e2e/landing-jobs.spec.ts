import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { isExpressionOfInterest } from "../../lib/jobs/tracks";

/**
 * Jobs landing pages (/jobs/in/<state>/, /jobs/in/<state>/<city>/, and the topic pages), built from the
 * local jobs data at build time. Counts change daily, so the tests compare a
 * page with itself and with the directory rather than with fixed numbers.
 */
const TOPICS = ["/jobs/data-center-infrastructure/", "/jobs/no-programming/", "/jobs/entry-level/", "/jobs/remote-us/", "/jobs/remote/"];
const FDE = "/jobs/role/forward-deployed-engineer/";

async function jsonLd(page: Page) {
  return (await page.locator('script[type="application/ld+json"]').allTextContents()).join("\n");
}
const countOnPage = async (page: Page) => Number((await page.getByTestId("landing-count").textContent())!.replace(/,/g, ""));

test("a state page answers first, labels geography, and links to employers and live postings", async ({ page }) => {
  await page.goto("/jobs/in/california/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("AI jobs in California");
  const count = await countOnPage(page);
  expect(count).toBeGreaterThanOrEqual(10);
  await expect(page).toHaveTitle(new RegExp(`^AI jobs in California: ${count.toLocaleString("en-US")} open listings`));
  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(description!.length).toBeLessThanOrEqual(160);
  expect(description).toMatch(/^[\d,]+ open listings naming a location in California/);
  await expect(page.getByText("Listings last checked", { exact: true })).toBeVisible();
  await expect(page.getByText("Location named: California")).toBeVisible();
  await expect(page.getByRole("heading", { name: "How this list is made" })).toBeVisible();
  await expect(page.getByText(/best-effort match/)).toBeVisible();
  await expect(page.getByTestId("header-disclaimer")).toContainText("Independent project");
  // Employers link to their profiles; the state's headquarters page is linked separately.
  await expect(page.locator('#employers a[href^="/companies/"]').first()).toBeVisible();
  await expect(page.locator('#employers a[href="/places/california/"]')).toBeVisible();
  // At most 100 listings in the HTML, each linking to the employer's own posting.
  const listings = page.locator("#listings li");
  expect(await listings.count()).toBeLessThanOrEqual(100);
  const posting = page.locator('#listings a[data-external="true"]').first();
  await expect(posting).toHaveAttribute("rel", "noopener noreferrer");
  await expect(posting).toHaveAttribute("href", /^https:\/\//);
  const ld = await jsonLd(page);
  expect(ld).toContain('"BreadcrumbList"');
  expect(ld).toContain('"CollectionPage"');
  expect(ld).toContain('"ItemList"');
  expect(ld).not.toContain("JobPosting");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/jobs\/in\/california\/$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\/jobs\/in-california\.jpg$/);
});

test("the full list in the directory is the same set of listings", async ({ page }) => {
  await page.goto("/jobs/in/california/");
  const count = await countOnPage(page);
  const loaded = page.waitForResponse((r) => r.url().endsWith("/data/jobs.json") && r.ok());
  await page.getByRole("link", { name: /^See all [\d,]+ in the Jobs directory$/ }).click();
  await loaded;
  await expect(page).toHaveURL(/\/jobs\/\?state=CA&sort=newest$/);
  await expect(page.getByLabel("U.S. state named in location", { exact: true })).toHaveValue("CA");
  await expect(page.getByText(new RegExp(`^Showing \\d+ of ${count} matching positions?$`))).toBeVisible();
});

test("a city page sits under its state, and its full list in the directory is the same set", async ({ page }) => {
  await page.goto("/jobs/in/california/");
  const stateCount = await countOnPage(page);
  await expect(page.getByTestId("landing-cities").locator('a[href="/jobs/in/california/san-francisco/"]')).toBeVisible();
  await page.goto("/jobs/in/california/san-francisco/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("AI jobs in San Francisco, California");
  const count = await countOnPage(page);
  expect(count).toBeGreaterThanOrEqual(10);
  expect(count).toBeLessThan(stateCount);
  await expect(page).toHaveTitle(new RegExp(`^AI jobs in San Francisco, CA: ${count.toLocaleString("en-US")} open listings`));
  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(description!.length).toBeLessThanOrEqual(160);
  await expect(page.getByText("Location named: San Francisco, California")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" }).locator('a[href="/jobs/in/california/"]')).toBeVisible();
  await expect(page.getByTestId("landing-cities").locator('a[href="/jobs/in/california/"]')).toBeVisible();
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\/jobs\/in-california-san-francisco\.jpg$/);
  const loaded = page.waitForResponse((r) => r.url().endsWith("/data/jobs.json") && r.ok());
  await page.getByRole("link", { name: /^See all [\d,]+ in the Jobs directory$/ }).click();
  await loaded;
  await expect(page).toHaveURL(/\/jobs\/\?state=CA&city=san-francisco&sort=newest$/);
  await expect(page.getByTestId("jobs-city-filter")).toContainText("City: San Francisco, CA");
  await expect(page.getByText(new RegExp(`^Showing \\d+ of ${count} matching positions?$`))).toBeVisible();
  await page.getByRole("button", { name: "Show all of California" }).click();
  await expect(page).toHaveURL(/\/jobs\/\?state=CA&sort=newest$/);
});

for (const path of TOPICS) {
  test(`topic page ${path} documents its rule and its geography`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How this list is made" })).toBeVisible();
    await expect(page.getByText(/best-effort match/)).toBeVisible();
    const badge = page.locator("main header .badge").first();
    if (path === "/jobs/remote-us/") await expect(badge).toHaveText("U.S. locations only");
    else await expect(badge).toHaveText(/^(Includes positions outside the United States|No positions outside the United States listed today)$/);
    expect(await page.locator("#listings li").count()).toBeLessThanOrEqual(100);
    expect(await jsonLd(page)).not.toContain("JobPosting");
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description!.length).toBeLessThanOrEqual(160);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("landing pages are linked from /jobs/ and /places/, listed in the sitemap, and found by search", async ({ page, request }) => {
  await page.goto("/jobs/");
  const browse = page.getByRole("navigation", { name: "Browse by" });
  await expect(browse.locator('a[href="/jobs/entry-level/"]')).toBeVisible();
  await expect(browse.locator('a[href="/jobs/in/california/"]')).toBeVisible();
  await expect(page.getByTestId("browse-roles").locator(`a[href="${FDE}"]`)).toBeVisible();
  await page.goto("/places/california/");
  await expect(page.locator('main a[href="/jobs/in/california/"]')).toBeVisible();
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const path of ["/jobs/in/california/", "/jobs/in/california/san-francisco/", FDE, ...TOPICS]) expect(sitemap).toContain(`${path}</loc>`);
  expect(sitemap).not.toContain("?state=");
  const index = await (await request.get("/data/search-index.json")).json();
  expect(index.entries.some((e: { href: string }) => e.href === "/jobs/in/california/")).toBe(true);
  expect(index.entries.some((e: { href: string }) => e.href === FDE)).toBe(true);
});

test("only states at or above the listing threshold have a page", async ({ page, request }) => {
  await page.goto("/jobs/");
  const chips = page.getByRole("navigation", { name: "Browse by" }).locator('a[href^="/jobs/in/"]');
  expect(await chips.count()).toBeGreaterThan(0);
  for (const text of await chips.allTextContents()) expect(Number(/\(([\d,]+)\)/.exec(text)![1].replace(/,/g, ""))).toBeGreaterThanOrEqual(10);
  expect((await request.get("/jobs/in/not-a-state/")).status()).toBe(404);
  expect((await request.get("/jobs/in/california/not-a-city/")).status()).toBe(404);
  expect((await request.get("/jobs/role/not-a-role/")).status()).toBe(404);
});

test("landing pages pass axe and fit narrow screens", async ({ page }) => {
  test.setTimeout(180_000);
  for (const path of ["/jobs/in/california/", "/jobs/in/california/san-francisco/", "/jobs/remote-us/", FDE]) {
    await page.goto(path);
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations.map((v) => `${path}: ${v.id}`)).toEqual([]);
  }
});

test("the freshness notice appears once listings are more than 48 hours old", async ({ page }) => {
  await page.clock.install({ time: new Date(Date.now() + 72 * 3600000) });
  await page.goto("/jobs/in/california/");
  await expect(page.getByRole("status").filter({ hasText: "more than 48 hours ago" })).toBeVisible();
});

test("a role page answers first, lists employers, and matches the directory", async ({ page, request }) => {
  await page.goto(FDE);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Forward Deployed Engineer jobs");
  const count = await countOnPage(page);
  expect(count).toBeGreaterThanOrEqual(10);
  await expect(page).toHaveTitle(new RegExp(`^Forward Deployed Engineer jobs: ${count.toLocaleString("en-US")} open listings`));
  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(description!.length).toBeLessThanOrEqual(160);
  expect(description).toMatch(/^[\d,]+ open Forward Deployed Engineer listings/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/jobs\/role\/forward-deployed-engineer\/$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\/jobs\/role-forward-deployed-engineer\.jpg$/);
  await expect(page.getByRole("heading", { name: "How this list is made" })).toBeVisible();
  await expect(page.getByText(/best-effort match/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Employers" })).toBeVisible();
  expect(await page.locator("#listings li").count()).toBeLessThanOrEqual(100);
  const ld = await jsonLd(page);
  expect(ld).toContain('"CollectionPage"');
  expect(ld).toContain('"ItemList"');
  expect(ld).not.toContain("JobPosting");
  const titles = await page.locator("#listings h3 a").allTextContents();
  for (const title of titles) {
    expect(title).toMatch(/forward[\s\-–—]+deployed|(?<![A-Za-z0-9])FDE(?![A-Za-z0-9])/i);
  }
  const loaded = page.waitForResponse((r) => r.url().endsWith("/data/jobs.json") && r.ok());
  await page.getByRole("link", { name: /^See all [\d,]+ in the Jobs directory$|^Filter these in the Jobs directory$/ }).click();
  await loaded;
  await expect(page).toHaveURL(/\/jobs\/\?role=forward-deployed-engineer&sort=newest$/);
  await expect(page.getByTestId("jobs-role-filter")).toContainText("Forward Deployed Engineer");
  await expect(page.getByText(new RegExp(`^Showing \\d+ of ${count} matching positions?$`))).toBeVisible();
  expect((await request.get("/jobs/role/not-a-role/")).status()).toBe(404);
});

test("an employer with matching listings links to the role page", async ({ page }) => {
  await page.goto("/jobs/at/openai/");
  const roles = page.getByTestId("landing-roles");
  await expect(roles.locator(`a[href="${FDE}"]`)).toBeVisible();
  const n = Number(/\(([\d,]+)\)/.exec((await roles.locator(`a[href="${FDE}"]`).textContent())!)![1].replace(/,/g, ""));
  expect(n).toBeGreaterThan(0);
});

test("screenshots of two landing pages at 375 and 1280 pixels", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "one set of screenshots is enough");
  for (const [slug, path] of [["georgia", "/jobs/in/georgia/"], ["entry-level", "/jobs/entry-level/"], ["fde", FDE]] as const) {
    for (const width of [375, 1280]) {
      await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: `reports/screenshots/jobs-landing-${slug}-${width}.png` });
      await page.locator("#listings").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `reports/screenshots/jobs-landing-${slug}-${width}-listings.png` });
    }
  }
});

test("an employer's jobs page is shareable and lists that employer's listings", async ({ page }) => {
  await page.goto("/jobs/");
  const employers = page.getByTestId("browse-employers");
  const first = employers.locator('a[href^="/jobs/at/"]').first();
  const href = (await first.getAttribute("href"))!;
  await first.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/^(Jobs at |Federal AI jobs)/);
  const count = await countOnPage(page);
  expect(count).toBeGreaterThan(0);
  await expect(page.getByTestId("landing-employer")).toBeVisible();
  await expect(page.locator('meta[name="description"]').last()).toHaveAttribute("content", /from (its own job board|USAJOBS\.gov)/);
  const slug = href.split("/")[3];
  const loaded = page.waitForResponse((r) => r.url().endsWith("/data/jobs.json") && r.ok());
  await page.getByRole("link", { name: /^See all [\d,]+ in the Jobs directory$|^Filter these in the Jobs directory$/ }).click();
  await loaded;
  await expect(page).toHaveURL(new RegExp(`/jobs/\\?company=${slug}&sort=newest$`));
  await expect(page.getByTestId("jobs-company-page").locator(`a[href="/jobs/at/${slug}/"]`)).toBeVisible();
});

test("the federal AI jobs page is linked from /jobs/, names USAJOBS.gov, and carries collection markup", async ({ page }) => {
  await page.goto("/jobs/");
  await expect(page.getByTestId("browse-employers").locator('a[href="/jobs/at/federal/"]')).toBeVisible();
  await page.goto("/jobs/at/federal/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Federal AI jobs");
  await expect(page.locator("main")).toContainText("Listing data comes from USAJOBS.gov.");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/jobs\/at\/federal\/$/);
  const ld = await jsonLd(page);
  expect(ld).toContain('"CollectionPage"');
  expect(ld).not.toContain('"JobPosting"');
  if ((await countOnPage(page)) > 0) expect(ld).toContain('"ItemList"');
  await expect(page.getByRole("heading", { name: "How this list is made" })).toBeVisible();
  await expect(page.getByTestId("landing-employer")).toBeVisible();
});

test("each listing has its own page with the employer's description, an apply link, and JobPosting data", async ({ page }) => {
  await page.goto("/jobs/at/anthropic/");
  // A San Francisco listing: JobPosting data is only for U.S. addresses or U.S.-only remote work.
  const listing = page.locator("#listings li").filter({ hasText: "San Francisco" }).locator('h3 a[href^="/jobs/at/anthropic/"]').first();
  const title = (await listing.textContent())!.replace(/ at Anthropic$/, "").trim();
  await listing.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await expect(page.getByTestId("job-description")).not.toBeEmpty();
  const apply = page.getByTestId("job-apply").locator("a").first();
  await expect(apply).toHaveAttribute("href", /^https:\/\/(job-boards|boards)\.greenhouse\.io\/anthropic\//);
  await expect(apply).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByTestId("header-disclaimer")).toContainText("Not a U.S. government website");
  const ld = await jsonLd(page);
  expect(ld).toContain('"BreadcrumbList"');
  const fallback = page.getByTestId("job-description").getByText(/The full description is on/);
  // JobPosting needs the stored employer description (operational, not in git) plus a U.S. address
  // or fully remote U.S. listing. Expressions of interest are left unmarked.
  if ((await fallback.count()) || isExpressionOfInterest(title)) {
    expect(ld).not.toContain('"JobPosting"');
  } else {
    expect(ld).toContain('"@type":"JobPosting"');
    expect(ld).toContain('"directApply":false');
    expect(ld).not.toContain('"validThrough"');
  }
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/jobs\/at\/anthropic\/[a-z0-9-]+-[0-9a-z]{7}\/$/);
  // No script runs on a job page beyond the analytics beacon Cloudflare may add.
  expect(await page.locator("script:not([type='application/ld+json'])").count()).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("job pages pass axe", async ({ page }) => {
  await page.goto("/jobs/at/anthropic/");
  await page.locator('#listings h3 a[href^="/jobs/at/anthropic/"]').first().click();
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
});

test("search understands abbreviations, offers popular searches, and narrows by city", async ({ page }) => {
  const loaded = page.waitForResponse((r) => r.url().endsWith("/data/jobs.json") && r.ok());
  await page.goto("/jobs/");
  await loaded;
  await page.getByRole("group", { name: "Popular searches" }).getByRole("button", { name: "Machine learning" }).click();
  await expect(page).toHaveURL(/q=Machine\+learning/);
  const first = page.locator("main article h2").first();
  await expect(first).toContainText(/machine learning|\bML\b/i);
  const filters = page.getByRole("button", { name: /^Filters/ });
  if (await filters.isVisible()) await filters.click();
  await page.getByLabel("U.S. state named in location", { exact: true }).selectOption("CA");
  const city = page.getByLabel("City", { exact: true });
  await expect(city).toBeVisible();
  await city.selectOption("san-francisco");
  await expect(page).toHaveURL(/state=CA&city=san-francisco/);
  await expect(page.getByTestId("jobs-city-filter")).toContainText("San Francisco");
});
