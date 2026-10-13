import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import { inlineLinks, inlinePlain, isAllowedHref } from "@/lib/inline-text";
import { KID_LESSONS, KID_WORDS, kidNeighbors, kidText } from "@/lib/kids";
import { EXPLAINERS, LEARNING_PATHS } from "@/lib/learn";
import { outlineFromMdx } from "@/lib/learn-outline";
import { isKnownSitePath } from "@/lib/site-routes";

const sentences = (t: string) =>
  inlinePlain(t)
    .split(/(?<=[.!?]["”]?)\s+(?=["“A-Z0-9])/)
    .map((s) => s.trim())
    .filter(Boolean);
const words = (s: string) => s.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w));

describe("kids lessons", () => {
  it("are numbered in order with unique slugs and neighbors", () => {
    expect(KID_LESSONS.map((l) => l.number)).toEqual(KID_LESSONS.map((_, i) => i + 1));
    expect(new Set(KID_LESSONS.map((l) => l.slug)).size).toBe(KID_LESSONS.length);
    for (const l of KID_LESSONS) expect(l.slug).toMatch(/^[a-z0-9-]+$/);
    expect(kidNeighbors(KID_LESSONS[0].slug).prev).toBeUndefined();
    expect(kidNeighbors(KID_LESSONS[0].slug).next?.slug).toBe(KID_LESSONS[1].slug);
    expect(kidNeighbors(KID_LESSONS.at(-1)!.slug).next).toBeUndefined();
  });

  it("keep sentences short enough for readers about 8 to 12", () => {
    for (const l of KID_LESSONS) {
      const lens = kidText(l)
        .flatMap(sentences)
        .map((s) => [s, words(s).length] as const);
      const avg = lens.reduce((n, [, w]) => n + w, 0) / lens.length;
      expect(avg, l.slug).toBeLessThanOrEqual(11);
      for (const [s, w] of lens) expect(w, `${l.slug}: ${s}`).toBeLessThanOrEqual(22);
    }
    for (const w of KID_WORDS) for (const s of sentences(w.meaning)) expect(words(s).length, `${w.id}: ${s}`).toBeLessThanOrEqual(22);
  });

  it("have complete parts and answerable quizzes", () => {
    for (const l of KID_LESSONS) {
      expect(l.sections.length, l.slug).toBeGreaterThanOrEqual(2);
      expect(l.tryThis.steps.length, l.slug).toBeGreaterThanOrEqual(3);
      expect(l.remember, l.slug).toHaveLength(3);
      expect(l.quiz, l.slug).toHaveLength(3);
      expect(l.minutes, l.slug).toBeLessThanOrEqual(6);
      for (const q of l.quiz) {
        expect(q.choices.length, q.prompt).toBeGreaterThanOrEqual(2);
        expect(new Set(q.choices).size, q.prompt).toBe(q.choices.length);
        expect(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length, q.prompt).toBe(true);
      }
      expect(l.grownUps.links.length, l.slug).toBeGreaterThanOrEqual(2);
    }
  });

  it("only link to pages and section anchors the site builds, or to https sources", () => {
    const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });
    const slugs = {
      organizations: new Set(catalog.organizations.map((o) => o.slug)),
      artifacts: new Set(catalog.artifacts.map((a) => a.slug)),
      news: new Set(catalog.news.map((n) => n.slug)),
      hubs: new Set(catalog.hubs.map((h) => h.slug)),
      licenses: new Set(catalog.licenses.map((l) => l.slug)),
      explainers: new Set(EXPLAINERS.map((e) => e.slug)),
      paths: new Set(LEARNING_PATHS.map((p) => p.id)),
      issues: new Set(catalog.newsletter.map((n) => n.slug)),
      policy: new Set(catalog.policy.map((d) => d.slug)),
    };
    const hrefs = KID_LESSONS.flatMap((l) => [...kidText(l).flatMap(inlineLinks), ...l.grownUps.links.map((x) => x.href)].map((h) => [l.slug, h] as const));
    for (const [slug, href] of hrefs) {
      expect(isAllowedHref(href), `${slug}: ${href}`).toBe(true);
      if (!href.startsWith("/")) continue;
      expect(isKnownSitePath(href, slugs), `${slug}: ${href}`).toBe(true);
      const anchor = href.match(/^\/learn\/([a-z0-9-]+)\/#([a-z0-9-]+)$/);
      if (anchor) {
        const e = EXPLAINERS.find((x) => x.slug === anchor[1])!;
        const mdx = fs.readFileSync(path.join(process.cwd(), "content", "pages", `${e.file}.mdx`), "utf8");
        expect(outlineFromMdx(mdx).headings.map((h) => h.id), `${slug}: ${href}`).toContain(anchor[2]);
      }
    }
    for (const l of KID_LESSONS) expect(isKnownSitePath(`/kids/${l.slug}/`, slugs)).toBe(true);
    expect(isKnownSitePath("/kids/no-such-lesson/", slugs)).toBe(false);
  });

  it("define each word once, in order, pointing at a real lesson", () => {
    const ids = KID_WORDS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...KID_WORDS].sort((a, b) => a.term.localeCompare(b.term)).map((w) => w.id)).toEqual(ids);
    for (const w of KID_WORDS) {
      expect(w.id).toMatch(/^[a-z0-9-]+$/);
      if (w.lesson) expect(KID_LESSONS.some((l) => l.slug === w.lesson), w.id).toBe(true);
    }
  });
});
