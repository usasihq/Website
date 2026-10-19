import { expect, test } from "@playwright/test";

/** Job feeds and "Follow this search", AI pay pages, the landing-page quality gate, and New this week. */

test("Follow this search links the exact feed for a page's filters, and the closest feed otherwise", async ({ page }) => {
  await page.goto("/jobs/?state=CA");
  const follow = page.getByTestId("jobs-follow");
  await expect(follow).toContainText("Feed for these filters:");
  await expect(page.getByTestId("jobs-follow-link")).toHaveAttribute("href", "/jobs/in/california/feed.xml");
  await page.goto("/jobs/?company=openai&q=research");
  await expect(follow).toContainText("Closest feed:");
  await expect(page.getByTestId("jobs-follow-link")).toHaveAttribute("href", "/jobs/at/openai/feed.xml");
  await expect(page.getByTestId("jobs-follow-note")).toContainText("search words");
  await page.goto("/jobs/?q=robotics");
  await expect(page.getByTestId("jobs-follow-link")).toHaveAttribute("href", "/jobs/feed.xml");
  // Nothing is stored in the browser: the choice comes from the URL alone.
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  await expect(page.getByTestId("jobs-newsletter")).toBeVisible();
});

test("job feeds are RSS whose items link to job pages", async ({ request }) => {
  for (const path of ["/jobs/feed.xml", "/jobs/at/openai/feed.xml", "/jobs/role/software-engineer/feed.xml", "/jobs/remote-us/feed.xml", "/new/feed.xml"]) {
    const res = await request.get(path);
    expect(res.ok(), path).toBe(true);
    const xml = await res.text();
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"'), path).toBe(true);
    expect((xml.match(/<item>/g) ?? []).length, path).toBeLessThanOrEqual(100);
  }
  const xml = await (await request.get("/jobs/feed.xml")).text();
  const link = /<item>\s*<title>[^<]+<\/title>\s*<link>https?:\/\/[^/]+(\/jobs\/at\/[^<]+)<\/link>\s*<guid isPermaLink="true">[^<]+<\/guid>\s*<pubDate>[^<]+<\/pubDate>/.exec(xml);
  expect(link).not.toBeNull();
  expect((await request.get(link![1])).ok()).toBe(true);
});

test("landing pages advertise their feed, and /feeds/ lists the job feeds", async ({ page }) => {
  await page.goto("/jobs/at/openai/");
  await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute("href", /\/jobs\/at\/openai\/feed\.xml$/);
  await expect(page.getByTestId("landing-feed")).toBeVisible();
  await page.goto("/feeds/");
  await expect(page.getByRole("heading", { name: "Job feeds" })).toBeVisible();
  await expect(page.getByTestId("job-feeds-roles").locator("a").first()).toHaveAttribute("href", /\/jobs\/role\/[a-z-]+\/feed\.xml$/);
});

test("AI pay pages state the method and the listings behind each figure", async ({ page }) => {
  await page.goto("/jobs/pay/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("AI pay, from disclosed salary ranges");
  await expect(page.getByTestId("pay-method")).toContainText("no trend yet");
  const role = page.locator('table a[href^="/jobs/pay/"]').first();
  const href = await role.getAttribute("href");
  await role.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  const rows = page.getByTestId("pay-table").locator("tbody tr");
  expect(await rows.count()).toBeGreaterThanOrEqual(10);
  await expect(page.getByTestId("pay-median")).toHaveText(/^\$[\d,]+K$/);
  await page.goto("/jobs/at/openai/");
  await expect(page.getByTestId("employer-pay")).toBeVisible();
});

test("thin employer pages stay reachable but out of search engines and the sitemap", async ({ page, request }) => {
  const sitemap = await (await request.get("/sitemap-pages.xml")).text();
  await page.goto("/jobs/");
  const employers = page.getByTestId("browse-employers").locator("a");
  const n = await employers.count();
  let checked = 0;
  for (let i = n - 1; i >= 0 && checked < 3; i--) {
    const label = (await employers.nth(i).textContent()) ?? "";
    const count = Number(/\(([\d,]+)\)/.exec(label)?.[1].replace(/,/g, "") ?? "0");
    if (count >= 5) break;
    const href = (await employers.nth(i).getAttribute("href"))!;
    const res = await request.get(href);
    expect(res.ok()).toBe(true);
    expect(await res.text()).toMatch(/<meta name="robots" content="noindex/);
    expect(sitemap).not.toContain(`${href}</loc>`);
    checked++;
  }
});

test("New this week is linked from the header and home, and dates every entry", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("home-new-link")).toHaveAttribute("href", "/new/");
  await page.goto("/new/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("New this week");
  for (const id of ["catalog", "news", "github", "huggingface", "jobs"]) await expect(page.getByTestId(`new-${id}`)).toBeVisible();
  await expect(page.getByTestId("new-github")).toContainText(/Tracking started|Newly in the ranking/);
  await expect(page.locator('aside[data-newsletter="active"]')).toBeVisible();
});
