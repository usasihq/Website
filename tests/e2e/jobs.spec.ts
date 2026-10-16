import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
/** On phones the filters sit behind a "Filters" button. */
async function openFilters(page: Page) {
  const button = page.getByRole("button", { name: /^Filters/ });
  if (await button.isVisible()) await button.click();
}
test("jobs filters survive URL, history and reload without contacting ATS", async ({ page }) => {
  const external: string[] = [];
  page.on("request", r => {if (/greenhouse|ashbyhq|lever\.co|data\.usajobs\.gov/.test(r.url())) external.push(r.url());});
  await page.goto("/jobs/?company=openai");
  await openFilters(page);
  await expect(page.getByLabel("Company or lab", {exact:true})).toHaveValue("openai");
  await page.getByLabel("Company or lab", {exact:true}).selectOption("anthropic");
  await expect(page).toHaveURL(/company=anthropic/);
  await page.goBack();
  await expect(page.getByLabel("Company or lab", {exact:true})).toHaveValue("openai");
  await page.reload();
  await openFilters(page);
  await expect(page.getByLabel("Company or lab", {exact:true})).toHaveValue("openai");
  await page.getByLabel("Search jobs", {exact:true}).fill("this-no-such-role-12345");
  await expect(page.getByRole("heading", {name:"No positions match this view"})).toBeVisible();
  await page.getByRole("button", {name:"Clear job filters"}).click();
  await expect(page.getByLabel("Search jobs", {exact:true})).toHaveValue("");
  expect(external).toEqual([]);
});
test("jobs accessibility, safe employer links and responsive width", async ({ page }) => {
  await page.goto("/jobs/");
  await expect(page.getByRole("heading", {level:1})).toHaveText("Jobs");
  const axe = await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
  expect(axe.violations.map(v=>v.id)).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const links = page.locator('article a.btn-primary[data-external="true"]').first();
  if (await links.count()) {
    await expect(links).toHaveAttribute("rel","noopener noreferrer");
    // The job board itself, USAJOBS.gov, or an employer-owned posting host on the organization's editorial allow-list.
    await expect(links).toHaveAttribute("href", /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}\//);
  }
  await page.screenshot({path:`reports/screenshots/jobs-${test.info().project.name}.png`,fullPage:false});
});
test("metadata consolidates filters and no transient JobPosting markup", async ({ page }) => {
  await page.goto("/jobs/?company=openai&sort=newest");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/jobs\/$/);
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join("\n");
  expect(ld).toContain('"CollectionPage"');
  expect(ld).toContain('"ItemList"');
  expect(ld).not.toContain('"JobPosting"');
  const sitemap = await (await page.request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/jobs/"); expect(sitemap).not.toContain("?company=");
});
test("organization jobs and no-source states are distinct", async ({ page }) => {
  await page.goto("/companies/openai/");
  await expect(page.getByRole("heading", {name:"Open positions",exact:true})).toBeVisible();
  await page.getByRole("link", {name:"All OpenAI jobs"}).click();
  await expect(page).toHaveURL(/\/jobs\/at\/openai\/$/);
  await expect(page.getByRole("heading", {level:1})).toHaveText("Jobs at OpenAI");
  await page.goto("/companies/nvidia/");
  await expect(page.getByText("Automated job coverage is not configured for this organization.")).toBeVisible();
});
test("malformed parameters and salary unit prerequisite are safe", async ({page}) => {
  await page.goto("/jobs/?page=-100&salary_min=Infinity&workplace=madeup");
  await openFilters(page);
  await page.getByText("Salary and date filters",{exact:true}).click();
  await expect(page.getByLabel("Minimum of disclosed range")).toBeDisabled();
  await expect(page.getByLabel("Workplace type",{exact:true})).toHaveValue("");
  await page.getByLabel("Search jobs",{exact:true}).fill("<script>alert(1)</script>");
  await expect(page.getByRole("heading",{name:"No positions match this view"})).toBeVisible();
});

test("stale listings age out even without a new build", async ({page}) => {
  await page.clock.install({time:new Date(Date.now()+72*3600000)});
  await page.goto("/jobs/");
  await expect(page.getByRole("heading",{name:"No positions match this view"})).toBeVisible();
  await openFilters(page);
  await page.getByText("Salary and date filters",{exact:true}).click();
  await page.getByLabel("Listing verification",{exact:true}).selectOption("unverified");
  await expect(page.locator("article").first()).toBeVisible();
  await expect(page.getByText("Not recently confirmed. Check the employer’s posting for availability.").first()).toBeVisible();
});
test("Jobs remains usable without JavaScript through official careers", async ({browser,baseURL}) => {
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto(`${baseURL}/jobs/`);
  await expect(page.getByRole("heading",{level:1})).toHaveText("Jobs");
  await expect(page.getByText(/Filtering and paging require JavaScript/)).toBeVisible();
  await expect(page.getByRole("link",{name:/Official careers/}).first()).toHaveAttribute("href",/^https:/);
  await context.close();
});
for (const width of [320,768,1024]) test(`Jobs fits ${width}px and renders at most 30 cards`, async ({page}) => {
  await page.setViewportSize({width,height:900});
  await page.goto("/jobs/");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator("article").count()).toBeLessThanOrEqual(30);
  if (width===1024 && await page.locator("article").count()) await page.locator("article").first().screenshot({path:"reports/screenshots/job-card.png"});
});
test("Jobs embeds one page of listings and loads the full list from the site's own data file", async ({ page, request }) => {
  const html = await (await request.get("/jobs/")).text();
  expect(html.length).toBeLessThan(750_000);
  const loaded = page.waitForResponse(r => r.url().endsWith("/data/jobs.json") && r.ok());
  await page.goto("/jobs/?company=openai");
  await loaded;
  await expect(page.getByText("Loading all positions…")).toHaveCount(0);
  await expect(page.locator("main article").first().or(page.getByRole("heading", {name: "No positions match this view"}))).toBeVisible();
});
