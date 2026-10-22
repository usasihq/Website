import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HiringProcessSection } from "@/components/HiringProcess";
import { hiringProcessFor, loadHiringProcesses, sourceHostAllowed, type HiringProcess } from "@/lib/jobs/hiring-process";

const REQUIRED = ["openai", "anthropic", "spacex", "nvidia", "coreweave"] as const;

const note = (over: Partial<HiringProcess> = {}): HiringProcess => ({
  slug: "acme",
  reviewed_at: "2026-10-22",
  hosts: ["acme.example"],
  paragraphs: ["Acme says apply on its careers page."],
  steps: ["Apply"],
  sources: [{ title: "Careers", url: "https://www.acme.example/careers" }],
  ...over,
});

describe("hiring-process notes on disk", () => {
  const notes = loadHiringProcesses();

  it("covers the five employers chosen from listing counts plus the required labs", () => {
    expect([...notes.keys()].sort()).toEqual([...REQUIRED].sort());
    for (const slug of REQUIRED) {
      const n = notes.get(slug)!;
      expect(n.paragraphs.length).toBeGreaterThan(0);
      expect(n.sources.length).toBeGreaterThan(0);
      expect(n.reviewed_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("cites only each company's official https careers or hiring hosts", () => {
    for (const n of notes.values()) {
      for (const source of n.sources) {
        expect(sourceHostAllowed(source.url, n.hosts), source.url).toBe(true);
        expect(source.url.startsWith("https://")).toBe(true);
      }
    }
  });

  it("looks up a note by organization slug and returns nothing for others", () => {
    expect(hiringProcessFor("openai")?.slug).toBe("openai");
    expect(hiringProcessFor("federal")).toBeNull();
    expect(hiringProcessFor("not-a-company")).toBeNull();
  });
});

describe("hiring-process loader", () => {
  it("rejects a source that is not on the company's official hosts", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hiring-process-"));
    fs.writeFileSync(
      path.join(dir, "acme.yml"),
      ["slug: acme", "reviewed_at: 2026-10-22", "hosts:", "  - acme.example", "paragraphs:", "  - Apply on the careers page.", "sources:", "  - title: Blog", "    url: https://news.example/hiring"].join("\n"),
    );
    expect(() => loadHiringProcesses(dir)).toThrow(/not on an official host/);
  });

  it("rejects a file whose name does not match its slug", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hiring-process-"));
    fs.writeFileSync(
      path.join(dir, "wrong.yml"),
      ["slug: acme", "reviewed_at: 2026-10-22", "hosts:", "  - acme.example", "paragraphs:", "  - Apply.", "sources:", "  - title: Careers", "    url: https://acme.example/careers"].join("\n"),
    );
    expect(() => loadHiringProcesses(dir)).toThrow(/must match the file name/);
  });
});

describe("hiring-process section", () => {
  it("renders the heading, steps, and official source links, without FAQPage markup", () => {
    const html = renderToStaticMarkup(
      <HiringProcessSection
        name="OpenAI"
        note={note({ slug: "openai", hosts: ["openai.com"], sources: [{ title: "Interview guide", url: "https://openai.com/interview-guide/" }] })}
      />,
    );
    expect(html).toContain("How hiring works at OpenAI");
    expect(html).toContain("data-testid=\"hiring-process\"");
    expect(html).toContain("href=\"https://openai.com/interview-guide/\"");
    expect(html).toContain("<ol");
    expect(html).toContain("Apply");
    expect(html).not.toContain("FAQPage");
    expect(html).not.toContain("JobPosting");
  });

  it("omits the step list when the official page does not list stages", () => {
    const html = renderToStaticMarkup(<HiringProcessSection name="CoreWeave" note={note({ steps: undefined })} />);
    expect(html).toContain("How hiring works at CoreWeave");
    expect(html).not.toContain("<ol");
  });
});

describe("official source hosts", () => {
  it("accepts the company's host and a subdomain, and rejects other sites", () => {
    expect(sourceHostAllowed("https://www.openai.com/careers/", ["openai.com"])).toBe(true);
    expect(sourceHostAllowed("https://openai.com/interview-guide/", ["openai.com"])).toBe(true);
    expect(sourceHostAllowed("https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite", ["nvidia.wd5.myworkdayjobs.com"])).toBe(true);
    expect(sourceHostAllowed("https://news.example/openai-hiring", ["openai.com"])).toBe(false);
    expect(sourceHostAllowed("http://openai.com/careers/", ["openai.com"])).toBe(false);
  });
});
