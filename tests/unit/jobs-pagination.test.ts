import { describe, expect, it } from "vitest";
import { landingFeedPath } from "@/lib/jobs/feeds";
import { landingPageCount, landingPageHref, landingView, pageSlice, pageWindow, paginatedTitle } from "@/lib/jobs/pagination";
import { INDEXNOW_KEY, INDEXNOW_KEY_PATH, INDEXNOW_MAX_URLS } from "@/lib/indexnow";
import { GITHUB_INDEX_LIMIT } from "@/lib/github/projects";
import { HF_DATASET_INDEX_LIMIT, HF_MODEL_INDEX_LIMIT } from "@/lib/huggingface/items";
import fs from "node:fs";
import path from "node:path";

describe("job listing pagination", () => {
  it("keeps page 1 at the landing path and later pages at /page/n/", () => {
    expect(landingPageHref("/jobs/at/spacex/", 1)).toBe("/jobs/at/spacex/");
    expect(landingPageHref("/jobs/at/spacex/", 2)).toBe("/jobs/at/spacex/page/2/");
    expect(landingPageCount(2772)).toBe(28);
    expect(pageSlice(["a", "b", "c", "d"], 2, 2)).toEqual(["c", "d"]);
    expect(paginatedTitle("OpenAI jobs: 150 open positions", 1)).toBe("OpenAI jobs: 150 open positions");
    expect(paginatedTitle("AI internships (928)", 3)).toContain("page 3");
    expect(landingView({ allListings: [{ id: "x" }] } as never).allListings).toEqual([]);
    expect(pageWindow(1, 4)).toEqual([1, 2, 3, 4]);
    expect(pageWindow(12, 28)).toContain("…");
  });

  it("points RSS at the first-page feed, not a /page/n/feed.xml that is never written", () => {
    expect(landingFeedPath({ basePath: "/jobs/at/openai/" })).toBe("/jobs/at/openai/feed.xml");
    expect(landingFeedPath({ basePath: "/jobs/in/california/" })).toBe("/jobs/in/california/feed.xml");
    expect(landingFeedPath({ basePath: "/jobs/role/software-engineer/" })).not.toContain("/page/");
  });
});

describe("index thresholds and IndexNow key", () => {
  it("names the GitHub and Hugging Face index caps", () => {
    expect(GITHUB_INDEX_LIMIT).toBe(1000);
    expect(HF_MODEL_INDEX_LIMIT).toBe(400);
    expect(HF_DATASET_INDEX_LIMIT).toBe(100);
  });

  it("serves the IndexNow key as a static file", () => {
    expect(INDEXNOW_KEY_PATH).toBe(`/${INDEXNOW_KEY}.txt`);
    expect(INDEXNOW_MAX_URLS).toBe(10_000);
    const file = path.join(process.cwd(), "public", `${INDEXNOW_KEY}.txt`);
    expect(fs.readFileSync(file, "utf8").trim()).toBe(INDEXNOW_KEY);
  });
});
