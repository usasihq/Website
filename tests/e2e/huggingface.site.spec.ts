import fs from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** AI on Hugging Face: /huggingface/ (models), /huggingface/datasets/, ranking pages, and item pages. */
type Item = { id: string; name: string; author: string; likes: number; downloads_30d: number; gated: false | string; base_models?: { id: string; relation: string }[]; pipeline_tag?: string | null };
const models = (JSON.parse(fs.readFileSync("data/huggingface/models.json", "utf8")) as { items: Item[] }).items;
const datasets = (JSON.parse(fs.readFileSync("data/huggingface/datasets.json", "utf8")) as { items: Item[] }).items;
const slugOf = (id: string) => {
  const part = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "x";
  const [o, r] = id.split("/");
  return `${part(o)}--${part(r)}`;
};
const top = models[0];
const topDataset = datasets[0];
const quantized = models.find((m) => m.base_models?.some((b) => b.relation === "quantized"))!;
const gated = models.find((m) => m.gated !== false)!;
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test("the /huggingface/ index lists the top models, links every ranking page, and filters in the URL", async ({ page }) => {
  await page.goto("/huggingface/");
  await expect(page.locator("h1")).toHaveText("AI on Hugging Face");
  await expect(page.locator("main")).toContainText("Data from the Hugging Face Hub API, fetched");
  await expect(page.locator("main")).toContainText("Likes measure popularity, not quality or safety.");
  const list = page.getByTestId("hf-list");
  await expect(list.locator("li")).toHaveCount(100);
  await expect(list.locator("li").first()).toContainText(top.name);
  await expect(list.locator("li").first()).toContainText(top.likes.toLocaleString("en-US"));
  const ranking = page.getByRole("navigation", { name: "Ranking pages" });
  await expect(ranking.getByRole("link").nth(1)).toHaveAttribute("href", "/huggingface/page/2/");
  await page.getByRole("button", { name: "Show 100 more" }).click();
  await expect(list.locator("li")).toHaveCount(200);

  await page.getByLabel("Search models", { exact: true }).fill(top.name);
  await expect(page).toHaveURL(new RegExp(`[?&]q=${encodeURIComponent(top.name)}`));
  await expect(list.locator("li").first()).toContainText(top.name);
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await page.getByLabel("Quantized", { exact: true }).selectOption("yes");
  await expect(page).toHaveURL(/quant=yes/);
  await expect(list.locator("li").first()).toContainText("Quantized version of");
  await page.getByLabel("Access", { exact: true }).selectOption("yes");
  await expect(page).toHaveURL(/gated=yes/);
  // Nothing is stored in the browser.
  expect(await page.evaluate(() => [document.cookie, localStorage.length, sessionStorage.length])).toEqual(["", 0, 0]);
});

test("the datasets tab lists datasets and filters by author type", async ({ page }) => {
  await page.goto("/huggingface/");
  await page.getByRole("navigation", { name: "Models or datasets" }).getByRole("link", { name: /^Datasets/ }).click();
  await expect(page).toHaveURL(/\/huggingface\/datasets\/$/);
  await expect(page.locator("h1")).toHaveText("AI on Hugging Face: datasets");
  const list = page.getByTestId("hf-list");
  await expect(list.locator("li").first()).toContainText(topDataset.name);
  await page.getByLabel("Author", { exact: true }).selectOption("org");
  await expect(page).toHaveURL(/author=org/);
  await expect(page.getByRole("list", { name: "Active filters" })).toContainText("Author: Organization");
});

test("ranking pages list items 101 onward, and every item is in the sitemap", async ({ page, request }) => {
  const sitemap = await (await request.get("/sitemap-pages.xml")).text();
  for (const m of [top, models[models.length - 1]]) expect(sitemap).toContain(`/huggingface/${slugOf(m.id)}/</loc>`);
  for (const d of [topDataset, datasets[datasets.length - 1]]) expect(sitemap).toContain(`/huggingface/datasets/${slugOf(d.id)}/</loc>`);
  expect(sitemap).toContain("/huggingface/page/2/</loc>");
  expect(sitemap).toContain("/huggingface/datasets/</loc>");
  await page.goto("/huggingface/page/2/");
  await expect(page.locator("h1")).toContainText("ranked 101–");
  await expect(page.getByTestId("hf-list").locator("li").first()).toContainText(models[100].name);
});

test("a model page has its hero image, facts, Hub link, and structured data", async ({ page }) => {
  const slug = slugOf(top.id);
  await page.goto(`/huggingface/${slug}/`);
  await expect(page.locator("h1")).toHaveText(top.name);
  const hero = page.locator("main figure img");
  await expect(hero).toHaveAttribute("src", `/og/huggingface/${slug}.jpg`);
  await expect(hero).toHaveAttribute("alt", new RegExp(`^Generated .* artwork for the model ${top.id.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}, labeled USASI`));
  expect(await hero.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBe(1200);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", new RegExp(`/og/huggingface/${slug}\\.jpg$`));
  await expect(page.getByRole("link", { name: /^View on Hugging Face/ })).toHaveAttribute("href", `https://huggingface.co/${top.id}`);
  await expect(page.getByRole("heading", { name: "Model facts" })).toBeVisible();
  await expect(page.locator("main")).toContainText("Downloads (last 30 days)");
  await expect(page.locator("main")).toContainText(top.downloads_30d.toLocaleString("en-US"));
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  const code = ld.map((t) => JSON.parse(t)).find((d) => d["@type"] === "SoftwareSourceCode");
  expect(code.codeRepository).toBe(`https://huggingface.co/${top.id}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("a quantized model says so and a gated model shows the access note", async ({ page }) => {
  await page.goto(`/huggingface/${slugOf(quantized.id)}/`);
  await expect(page.locator("main header")).toContainText("Quantized version of");
  await page.goto(`/huggingface/${slugOf(gated.id)}/`);
  await expect(page.locator("main")).toContainText("Access requires accepting terms on Hugging Face");
});

test("a dataset page has Dataset structured data and its Hub link", async ({ page }) => {
  const slug = slugOf(topDataset.id);
  await page.goto(`/huggingface/datasets/${slug}/`);
  await expect(page.locator("h1")).toHaveText(topDataset.name);
  await expect(page.locator("main figure img")).toHaveAttribute("src", `/og/huggingface/datasets/${slug}.jpg`);
  await expect(page.getByRole("link", { name: /^View on Hugging Face/ })).toHaveAttribute("href", `https://huggingface.co/datasets/${topDataset.id}`);
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t));
  const ds = ld.find((d) => d["@type"] === "Dataset");
  expect(ds.url).toBe(`https://huggingface.co/datasets/${topDataset.id}`);
  expect(typeof ds.description).toBe("string");
});

test("the header menu leads to AI on Hugging Face", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await page.getByRole("navigation", { name: "Primary (mobile)", exact: true }).getByRole("link", { name: "AI on Hugging Face", exact: true }).click();
  } else {
    const nav = page.getByRole("navigation", { name: "Primary", exact: true });
    await nav.getByRole("button", { name: "Open source", exact: true }).click();
    await nav.getByRole("link", { name: /^AI on Hugging Face/ }).click();
  }
  await expect(page).toHaveURL(/\/huggingface\/$/);
});

for (const path of [
  "/huggingface/",
  "/huggingface/datasets/",
  "/huggingface/page/2/",
  `/huggingface/${slugOf(top.id)}/`,
  `/huggingface/${slugOf(quantized.id)}/`,
  `/huggingface/datasets/${slugOf(topDataset.id)}/`,
  "/huggingface/?author=user&quant=no",
]) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s) — ${v.nodes[0]?.target.join(" ")}`);
    expect(summary, summary.join("\n")).toEqual([]);
  });
}
