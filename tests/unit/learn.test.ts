import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EXPLAINERS, LEARNING_PATHS, TOPICS, adjacentExplainers, explainersByTopic, relatedExplainers } from "@/lib/learn";
import { outlineFromMdx } from "@/lib/learn-outline";

const pages = path.join(process.cwd(), "content", "pages");
const read = (file: string) => fs.readFileSync(path.join(pages, `${file}.mdx`), "utf8");

describe("learn registry", () => {
  it("has one MDX file, three short takeaways, and a valid topic per explainer", () => {
    const slugs = new Set<string>();
    for (const e of EXPLAINERS) {
      expect(slugs.has(e.slug), e.slug).toBe(false);
      slugs.add(e.slug);
      expect(fs.existsSync(path.join(pages, `${e.file}.mdx`)), e.file).toBe(true);
      expect(TOPICS.some((t) => t.id === e.topic), e.slug).toBe(true);
      expect(e.takeaways).toHaveLength(3);
      for (const k of e.takeaways) expect(k.length, k).toBeLessThanOrEqual(180);
      expect(e.title.length, e.slug).toBeLessThanOrEqual(80);
    }
  });

  it("imports every explainer's content statically", () => {
    const content = fs.readFileSync(path.join(process.cwd(), "app", "learn", "content.ts"), "utf8");
    for (const e of EXPLAINERS) {
      expect(content, e.slug).toContain(`"${e.slug}":`);
      expect(content, e.file).toContain(`@/content/pages/${e.file}.mdx`);
    }
  });

  it("gives every explainer section ids, a next-steps section, and a sources section last", () => {
    for (const e of EXPLAINERS) {
      const { headings, minutes } = outlineFromMdx(read(e.file));
      const ids = headings.map((h) => h.id);
      expect(new Set(ids).size, e.slug).toBe(ids.length);
      expect(ids, e.slug).toContain("next");
      expect(ids.at(-1), e.slug).toBe("sources");
      expect(minutes, e.slug).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps explainers in course order, grouped by topic", () => {
    const order = TOPICS.map((t) => t.id);
    const positions = EXPLAINERS.map((e) => order.indexOf(e.topic));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(explainersByTopic().flatMap((g) => g.explainers)).toEqual(EXPLAINERS);
    expect(adjacentExplainers(EXPLAINERS[0].slug).prev).toBeUndefined();
    expect(adjacentExplainers(EXPLAINERS[1].slug).prev?.slug).toBe(EXPLAINERS[0].slug);
    expect(relatedExplainers(EXPLAINERS[0].slug, 3).map((e) => e.slug)).not.toContain(EXPLAINERS[0].slug);
  });

  it("points every learning-path step at a real explainer, hub, or page", () => {
    const hubs = new Set(fs.readdirSync(path.join(process.cwd(), "content", "hubs")).map((f) => f.replace(/\.yml$/, "")));
    for (const p of LEARNING_PATHS) {
      expect(p.steps.length, p.id).toBeGreaterThanOrEqual(4);
      for (const s of p.steps) {
        if (s.kind === "explainer") expect(EXPLAINERS.some((e) => e.slug === s.slug), `${p.id}: ${s.slug}`).toBe(true);
        else if (s.kind === "hub") expect(hubs.has(s.slug), `${p.id}: ${s.slug}`).toBe(true);
        else expect(s.href).toMatch(/^\/[a-z0-9/-]*\/$/);
      }
    }
  });
});

describe("outlineFromMdx", () => {
  it("lists h2 headings and counts reading words before the sources", () => {
    const mdx = `Intro ${"word ".repeat(460)}\n\n<h2 id="one">One</h2>\n\nText with a [link](https://example.com/very/long/path).\n\n<h2 id="sources">Sources</h2>\n\n- ${"source ".repeat(500)}`;
    const o = outlineFromMdx(mdx);
    expect(o.headings).toEqual([
      { id: "one", title: "One" },
      { id: "sources", title: "Sources" },
    ]);
    expect(o.minutes).toBe(2);
    expect(o.words).toBeLessThan(480);
  });
});
