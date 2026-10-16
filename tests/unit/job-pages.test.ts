import { describe, expect, it } from "vitest";
import { decodeEntities, descriptionHtml, htmlToDescription, type Description } from "@/lib/jobs/description";
import { renderJobPage } from "@/lib/jobs/job-page-html";
import { jobPostingLd, postalAddresses, type JobPage } from "@/lib/jobs/job-pages";
import { jobHref, jobSlug, shortCode, titleSlug } from "@/lib/jobs/job-url";
import type { Job } from "@/lib/jobs/schema";
import type { Organization } from "@/lib/schema";

describe("employer descriptions are reduced to a safe structure", () => {
  it("keeps headings, paragraphs, lists, bold, italic, and https links", () => {
    const d = htmlToDescription(`<h2>About</h2><p>We build <strong>safe</strong> AI.<br>Join <em>us</em> &amp; <a href="https://example.org/benefits">read more</a>.</p><ul><li>Python</li><li>Rust<ul><li>nested</li></ul></li></ul><ol><li>One</li></ol>`)!;
    expect(d.map((b) => b.type)).toEqual(["h", "p", "p", "ul", "ol"]);
    expect(d[1]).toEqual({ type: "p", runs: [{ t: "We build " }, { t: "safe", b: true }, { t: " AI." }] });
    expect(d[2].type === "p" && d[2].runs.find((r) => r.href)).toEqual({ t: "read more", href: "https://example.org/benefits" });
    expect(d[3].type === "ul" && d[3].items.length).toBe(3);
  });

  it("drops scripts, styles, images, frames, event handlers, and unsafe links", () => {
    const d = htmlToDescription(
      `<p onclick="steal()">Hi<script>alert(1)</script> there</p><style>p{}</style><img src=x onerror=alert(1)><iframe src="https://evil.example"></iframe><a href="javascript:alert(1)">bad</a> <a href="http://insecure.example">plain</a>`,
    )!;
    const all = JSON.stringify(d);
    for (const s of ["alert", "steal", "onerror", "iframe", "javascript", "insecure.example", "<"]) expect(all).not.toContain(s);
    expect(all).toContain("Hi there");
    expect(all).toContain("bad");
  });

  it("decodes Greenhouse's escaped content once, and returns null for empty input", () => {
    const html = decodeEntities("&lt;p&gt;Anthropic&amp;rsquo;s mission&lt;/p&gt;");
    expect(htmlToDescription(html)).toEqual([{ type: "p", runs: [{ t: "Anthropic’s mission" }] }]);
    expect(htmlToDescription("")).toBeNull();
    expect(htmlToDescription("<p> </p><script>x</script>")).toBeNull();
  });

  it("rebuilds minimal HTML with every text node escaped", () => {
    const d: Description = [{ type: "p", runs: [{ t: "<b>not bold</b> & \"quoted\"" }, { t: "x", b: true, href: "https://example.org/" }] }];
    expect(descriptionHtml(d)).toBe("<p>&lt;b&gt;not bold&lt;/b&gt; &amp; &quot;quoted&quot;<strong>x</strong></p>");
  });
});

describe("job page addresses", () => {
  it("are readable, stable, and unique per posting", () => {
    expect(titleSlug("Senior Software Engineer, Inference (C++/CUDA)")).toBe("senior-software-engineer-inference-c-cuda");
    expect(titleSlug("R&D Lead")).toBe("r-and-d-lead");
    expect(titleSlug("x".repeat(100)).length).toBeLessThanOrEqual(71);
    expect(shortCode("openai:ashby:openai:abc")).toBe(shortCode("openai:ashby:openai:abc"));
    expect(shortCode("a")).not.toBe(shortCode("b"));
    expect(jobSlug({ id: "openai:ashby:openai:abc", title: "Researcher" })).toMatch(/^researcher-[0-9a-z]{7}$/);
    expect(jobHref({ id: "x:greenhouse:x:1", title: "Engineer", organization_slug: "anthropic" })).toMatch(/^\/jobs\/at\/anthropic\/engineer-[0-9a-z]{7}\/$/);
  });
});

const org = { slug: "acme-ai", name: "Acme AI (Example)", website: "https://acme.example" } as Organization;
const job = (over: Partial<Job> = {}): Job => ({
  id: "acme-ai:greenhouse:acme:1", source_job_id: "1", requisition_id: null, organization_slug: "acme-ai", source_type: "greenhouse",
  source_identifier: "acme", source_url: "https://boards-api.greenhouse.io/v1/boards/acme/jobs", title: "Research Engineer",
  locations: ["San Francisco, CA", "London, UK"], countries: [], workplace: "on-site", remote: false, employment_type: "full-time",
  department: "Research", team: null,
  salaries: [{ min: 200000, max: 300000, currency: "USD", period: "year", label: null, source_status: "employer-provided" }],
  official_url: "https://job-boards.greenhouse.io/acme/jobs/1", apply_url: null, posted_at: "2026-10-01T00:00:00.000Z",
  posted_date_kind: "first-published", first_seen: "2026-10-02T00:00:00.000Z", last_seen: "2026-10-14T00:00:00.000Z",
  last_successfully_checked: "2026-10-14T00:00:00.000Z", status: "open", missing_since: null, missing_checks: 0, closed_at: null, ...over,
});
const desc: Description = [{ type: "p", runs: [{ t: "Build things." }] }];
const page = (j: Job, d: Description | null = desc): JobPage => ({ job: j, org, slug: jobSlug(j), path: `/jobs/at/acme-ai/${jobSlug(j)}/`, description: d });

describe("JobPosting data", () => {
  it("uses only the employer's fields: title, description, dates, U.S. addresses, salary, employment type", () => {
    const ld = jobPostingLd(page(job()))!;
    expect(ld["@type"]).toBe("JobPosting");
    expect(ld.description).toBe("<p>Build things.</p>");
    expect(ld.datePosted).toBe("2026-10-01");
    expect(ld.employmentType).toBe("FULL_TIME");
    expect(ld.directApply).toBe(false);
    expect(ld.jobLocation).toEqual([{ "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "San Francisco", addressRegion: "CA", addressCountry: "US" } }]);
    expect(ld.baseSalary).toEqual({ "@type": "MonetaryAmount", currency: "USD", value: { "@type": "QuantitativeValue", minValue: 200000, maxValue: 300000, unitText: "YEAR" } });
    expect(ld.hiringOrganization).toEqual({ "@type": "Organization", name: "Acme AI (Example)", sameAs: "https://acme.example" });
  });

  it("names the USAJOBS hiring agency with the federal government as parent", () => {
    const federal = job({
      id: "federal:usajobs:ai:21947200",
      source_job_id: "21947200",
      organization_slug: "federal",
      source_type: "usajobs",
      source_identifier: "ai",
      source_url: "https://data.usajobs.gov/api/search",
      official_url: "https://www.usajobs.gov/GetJob/ViewDetails/21947200",
      department: "National Institute of Standards and Technology",
      locations: ["Gaithersburg, MD"],
    });
    const parent = { slug: "federal", name: "U.S. Federal Government", website: "https://www.usa.gov" } as Organization;
    const ld = jobPostingLd({ job: federal, org: parent, slug: "it-specialist-aaaaaaa", path: "/jobs/at/federal/it-specialist-aaaaaaa/", description: desc })!;
    expect(ld.hiringOrganization).toEqual({
      "@type": "Organization",
      name: "National Institute of Standards and Technology",
      parentOrganization: { "@type": "Organization", name: "U.S. Federal Government", sameAs: "https://www.usa.gov" },
    });
  });

  it("marks U.S.-only remote work as telecommute, and is omitted when it cannot be complete", () => {
    const remote = jobPostingLd(page(job({ locations: ["Remote - US"], workplace: "remote", remote: true })))!;
    expect(remote.jobLocationType).toBe("TELECOMMUTE");
    expect(remote.applicantLocationRequirements).toEqual({ "@type": "Country", name: "US" });
    expect(remote.jobLocation).toBeUndefined();
    expect(remote).not.toHaveProperty("validThrough");
    expect(jobPostingLd(page(job(), null))).toBeNull();
    expect(jobPostingLd(page(job({ locations: ["London, UK"] })))).toBeNull();
    expect(jobPostingLd(page(job({ posted_at: null })))!.datePosted).toBe("2026-10-02");
  });

  it("does not mark hybrid or remote-friendly jobs as TELECOMMUTE, and omits expressions of interest", () => {
    const hybrid = jobPostingLd(page(job({ locations: ["San Francisco, CA", "Remote - US"], workplace: "hybrid", remote: true })))!;
    expect(hybrid.jobLocationType).toBeUndefined();
    expect(hybrid.jobLocation).toEqual([{ "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "San Francisco", addressRegion: "CA", addressCountry: "US" } }]);
    expect(jobPostingLd(page(job({ locations: ["Remote - US"], workplace: "hybrid", remote: true })))).toBeNull();
    expect(jobPostingLd(page(job({ title: "Talent Community (General Application)" })))).toBeNull();
  });

  it("reads addresses from location text without guessing", () => {
    expect(postalAddresses({ locations: ["Austin, TX; Remote - US", "Texas"] })).toEqual([{ addressLocality: "Austin", addressRegion: "TX", addressCountry: "US" }]);
    expect(postalAddresses({ locations: ["Remote", "Toronto, CA"] })).toEqual([]);
  });
});

describe("job page HTML", () => {
  it("escapes every employer field and links to apply on the employer's site", () => {
    const evil = job({ title: `<script>alert("x")</script>Engineer`, department: `"><img src=x>` });
    const html = renderJobPage(page(evil, [{ type: "p", runs: [{ t: "</script><script>alert(2)</script>" }] }]), {
      htmlClass: "fonts",
      links: '<link rel="stylesheet" href="/_next/static/chunks/a.css"/>',
    });
    expect(html).not.toContain("<script>alert");
    expect(html).not.toContain('"><img');
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;Engineer");
    expect(html).toContain('href="https://job-boards.greenhouse.io/acme/jobs/1"');
    expect(html).toContain('href="/jobs/at/acme-ai/"');
    expect(html).toContain('href="/jobs/"');
    expect(html).toContain('href="/companies/acme-ai/"');
    expect(html).toContain("Not a U.S. government website");
    expect(html).toContain('<link rel="canonical" href="https://unitedstatesofamericasuperintelligence.com/jobs/at/acme-ai/');
    // The JSON-LD cannot close its own script element.
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) expect(() => JSON.parse(m[1])).not.toThrow();
  });

  it("keeps pages without a description out of search results", () => {
    const html = renderJobPage(page(job(), null), { htmlClass: "", links: "" });
    expect(html).toContain('<meta name="robots" content="noindex, follow"/>');
    expect(html).not.toContain('"@type":"JobPosting"');
  });

  it("emits JobPosting JSON-LD on a complete listing page", () => {
    const html = renderJobPage(page(job()), { htmlClass: "", links: "" });
    const block = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]))
      .find((d) => d["@type"] === "JobPosting");
    expect(block).toMatchObject({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: "Research Engineer",
      datePosted: "2026-10-01",
      directApply: false,
      employmentType: "FULL_TIME",
    });
    expect(block).not.toHaveProperty("validThrough");
  });
});
