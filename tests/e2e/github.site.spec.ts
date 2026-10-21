import fs from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getCatalog } from "../../lib/catalog";
import { githubEntries, githubIndexed } from "../../lib/github/projects";

/** AI on GitHub: /github/, its ranking pages, and per-project pages. */
type Project = { full_name: string; name: string; owner: string; stars: number; topics: string[]; homepage: string | null };
const data = JSON.parse(fs.readFileSync("data/github/projects.json", "utf8")) as { projects: Project[] };
const slugOf = (fullName: string) => {
  const part = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "x";
  const [o, r] = fullName.split("/");
  return `${part(o)}--${part(r)}`;
};
const top = data.projects[0];
const withTopic = data.projects.find((p, i) => i > 0 && p.topics.length > 2)!;
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test("the /github/ index lists the top projects, links every ranking page, and filters in the URL", async ({ page }) => {
  await page.goto("/github/");
  await expect(page.locator("h1")).toHaveText("AI on GitHub");
  await expect(page.locator("main")).toContainText("Data from the GitHub API, fetched");
  const list = page.getByTestId("github-list");
  await expect(list.locator("li")).toHaveCount(100);
  await expect(list.locator("li").first()).toContainText(top.full_name.split("/")[1]);
  const ranking = page.getByRole("navigation", { name: "Ranking pages" });
  await expect(ranking.getByRole("link").nth(1)).toHaveAttribute("href", "/github/page/2/");
  await page.getByRole("button", { name: "Show 100 more" }).click();
  await expect(list.locator("li")).toHaveCount(200);

  await page.getByLabel("Search projects", { exact: true }).fill(top.name);
  await expect(page).toHaveURL(new RegExp(`[?&]q=${encodeURIComponent(top.name)}`));
  await expect(list.locator("li").first()).toContainText(top.name);
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await page.getByLabel("Owner", { exact: true }).selectOption("Organization");
  await expect(page).toHaveURL(/owner=Organization/);
  // Nothing is stored in the browser.
  expect(await page.evaluate(() => [document.cookie, localStorage.length, sessionStorage.length])).toEqual(["", 0, 0]);
});

test("a topic link from a project page opens the filtered list", async ({ page }) => {
  const topic = withTopic.topics.find((t) => !["ai", "llm", "python"].includes(t)) ?? withTopic.topics[0];
  await page.goto(`/github/?topic=${topic}`);
  const list = page.getByTestId("github-list");
  await expect(list.locator("li").first()).toBeVisible();
  await expect(page.getByRole("list", { name: "Active filters" })).toContainText(`Topic: ${topic}`);
});

test("a ranking page lists projects 101 onward; indexed projects are in the sitemap", async ({ page, request }) => {
  const sitemap = await (await request.get("/sitemap-pages.xml")).text();
  const catalog = getCatalog();
  const indexed = githubEntries().filter((e) => githubIndexed(e, catalog));
  const omitted = githubEntries().filter((e) => !githubIndexed(e, catalog));
  expect(indexed.length).toBeGreaterThan(0);
  expect(omitted.length).toBeGreaterThan(0);
  for (const e of indexed) expect(sitemap).toContain(`${e.href}</loc>`);
  for (const e of omitted) expect(sitemap).not.toContain(`${e.href}</loc>`);
  await page.goto(omitted[omitted.length - 1]!.href);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  expect(sitemap).toContain("/github/page/2/</loc>");
  await page.goto("/github/page/2/");
  await expect(page.locator("h1")).toContainText("ranked 101–");
  await expect(page.getByTestId("github-list").locator("li").first()).toContainText(data.projects[100].name);
});

test("a project page has its hero image, facts, GitHub link, and structured data", async ({ page }) => {
  const slug = slugOf(top.full_name);
  await page.goto(`/github/${slug}/`);
  await expect(page.locator("h1")).toHaveText(top.name);
  const hero = page.locator("main figure img");
  await expect(hero).toHaveAttribute("src", `/og/github/${slug}.jpg`);
  await expect(hero).toHaveAttribute("alt", new RegExp(`^Generated .* artwork for ${top.full_name.replace("/", "\\/")}, labeled USASI`));
  expect(await hero.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBe(1200);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", new RegExp(`/og/github/${slug}\\.jpg$`));
  await expect(page.getByRole("link", { name: /^View on GitHub/ })).toHaveAttribute("href", `https://github.com/${top.full_name}`);
  await expect(page.getByRole("heading", { name: "Repository facts" })).toBeVisible();
  await expect(page.locator("main")).toContainText(top.stars.toLocaleString("en-US"));
  const badge = page.getByTestId("rank-badge");
  await expect(badge.getByRole("heading", { name: "Add this badge to your README" })).toBeVisible();
  await expect(badge.locator("img").first()).toHaveAttribute("src", `/badges/github/${slug}.svg`);
  await expect(badge.locator("pre").first()).toContainText(`/badges/github/${slug}.svg`);
  await expect(badge.locator("pre").first()).toContainText(`/github/${slug}/`);
  const svg = await page.request.get(`/badges/github/${slug}.svg`);
  expect(svg.status()).toBe(200);
  expect(await svg.text()).toContain("GitHub #1");
  await expect(page.getByRole("heading", { name: "Related projects" })).toBeVisible();
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  const code = ld.map((t) => JSON.parse(t)).find((d) => d["@type"] === "SoftwareSourceCode");
  expect(code.codeRepository).toBe(`https://github.com/${top.full_name}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("the header menu leads to AI on GitHub", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await page.getByRole("navigation", { name: "Primary (mobile)", exact: true }).getByRole("link", { name: "AI on GitHub", exact: true }).click();
  } else {
    const nav = page.getByRole("navigation", { name: "Primary", exact: true });
    await nav.getByRole("button", { name: "Open source", exact: true }).click();
    await nav.getByRole("link", { name: /^AI on GitHub/ }).click();
  }
  await expect(page).toHaveURL(/\/github\/$/);
});

for (const path of ["/github/", "/github/page/2/", `/github/${slugOf(top.full_name)}/`, `/github/${slugOf(withTopic.full_name)}/`, "/github/?owner=User&lang=Python"]) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s) — ${v.nodes[0]?.target.join(" ")}`);
    expect(summary, summary.join("\n")).toEqual([]);
  });
}
