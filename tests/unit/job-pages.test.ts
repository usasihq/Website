import { describe, expect, it } from "vitest";
import { decodeEntities, descriptionHtml, htmlToDescription, type Description } from "@/lib/jobs/description";
import { JOB_META_MAX, jobMetaDescription, jobPageTitle, renderJobPage } from "@/lib/jobs/job-page-html";
import { assignTitleSuffixes, clipWords, jobPostingLd, locationLabel, postalAddresses, titlePlaces, type JobPage } from "@/lib/jobs/job-pages";
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
    expect(ld.jobLocation).toEqual([
      { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "San Francisco", addressRegion: "CA", addressCountry: "US" } },
      { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "London", addressCountry: "GB" } },
    ]);
    expect(ld.baseSalary).toEqual({ "@type": "MonetaryAmount", currency: "USD", value: { "@type": "QuantitativeValue", minValue: 200000, maxValue: 300000, unitText: "YEAR" } });
    expect(ld.hiringOrganization).toEqual({
      "@type": "Organization",
      name: "Acme AI (Example)",
      url: "https://acme.example",
      sameAs: "https://acme.example",
      logo: "https://unitedstatesofamericasuperintelligence.com/images/orgs/acme-ai.png",
    });
  });

  it("points hiringOrganization.url at our company page when the catalog has no official website", () => {
    const bare = { slug: "new-lab", name: "New Lab", website: "" } as Organization;
    const ld = jobPostingLd({
      job: job({ organization_slug: "new-lab" }),
      org: bare,
      slug: "research-engineer-aaaaaaa",
      path: "/jobs/at/new-lab/research-engineer-aaaaaaa/",
      description: desc,
    })!;
    expect(ld.hiringOrganization).toMatchObject({
      "@type": "Organization",
      name: "New Lab",
      url: "https://unitedstatesofamericasuperintelligence.com/companies/new-lab/",
      logo: "https://unitedstatesofamericasuperintelligence.com/images/orgs/new-lab.png",
    });
    expect(ld.hiringOrganization).not.toHaveProperty("sameAs");
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
      url: "https://www.usa.gov",
      logo: "https://unitedstatesofamericasuperintelligence.com/images/orgs/federal.png",
      parentOrganization: {
        "@type": "Organization",
        name: "U.S. Federal Government",
        url: "https://www.usa.gov",
        sameAs: "https://www.usa.gov",
        logo: "https://unitedstatesofamericasuperintelligence.com/images/orgs/federal.png",
      },
    });
  });

  it("prefers the feed's salary over a range read from the description, and states validThrough only when the source gives it", () => {
    const text = { min: 150000, max: 200000, currency: "USD", period: "year" as const, label: "Level 1", source_status: "employer-description" as const };
    const feed = { min: 210000, max: 260000, currency: "USD", period: "year" as const, label: null, source_status: "employer-provided" as const };
    expect((jobPostingLd(page(job({ salaries: [text, feed] })))!.baseSalary as { value: { minValue: number } }).value.minValue).toBe(210000);
    expect((jobPostingLd(page(job({ salaries: [text] })))!.baseSalary as { value: { minValue: number } }).value.minValue).toBe(150000);
    expect(jobPostingLd(page(job()))).not.toHaveProperty("validThrough");
    expect(jobPostingLd(page(job({ valid_through: "2026-12-01T23:59:59.999Z" })))!.validThrough).toBe("2026-12-01T23:59:59.999Z");
  });
  it("marks U.S.-only remote work as telecommute, and is omitted when it cannot be complete", () => {
    const remote = jobPostingLd(page(job({ locations: ["Remote - US"], workplace: "remote", remote: true })))!;
    expect(remote.jobLocationType).toBe("TELECOMMUTE");
    expect(remote.applicantLocationRequirements).toEqual({ "@type": "Country", name: "US" });
    expect(remote.jobLocation).toBeUndefined();
    expect(remote).not.toHaveProperty("validThrough");
    expect(jobPostingLd(page(job(), null))).toBeNull();
    expect(jobPostingLd(page(job({ locations: ["London, UK"] })))).toMatchObject({
      jobLocation: [{ "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "London", addressCountry: "GB" } }],
    });
    expect(jobPostingLd(page(job({ posted_at: null })))!.datePosted).toBe("2026-10-02");
  });

  it("infers employmentType when the feed omits it, and leaves it off when nothing is clear", () => {
    expect(jobPostingLd(page(job({ employment_type: "unknown", title: "Software Engineer Intern" })))!.employmentType).toBe("INTERN");
    expect(jobPostingLd(page(job({ employment_type: "unknown", title: "Staff Firmware Engineer" })))!.employmentType).toBe("FULL_TIME");
    expect(jobPostingLd(page(job({ employment_type: "unknown", title: "Opportunity", salaries: [] })))).not.toHaveProperty("employmentType");
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
    expect(postalAddresses({ locations: ["Remote", "Toronto, CA"] })).toEqual([{ addressLocality: "Toronto", addressCountry: "CA" }]);
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
    expect(html).toContain('<meta name="twitter:title"');
    expect(html).toMatch(/<link rel="canonical" href="https:\/\/unitedstatesofamericasuperintelligence\.com\/jobs\/at\/acme-ai\/[^"?#]+\/"/);
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
    expect(html).toContain('data-testid="org-logo"');
    expect(html).toContain("/images/orgs/acme-ai.png");
  });

  it("shows an inferred employment type instead of Not supplied", () => {
    const html = renderJobPage(page(job({ employment_type: "unknown", title: "Software Engineer Intern" })), { htmlClass: "", links: "" });
    expect(html).toMatch(/<dt class="text-muted">Employment<\/dt><dd[^>]*>Internship<\/dd>/);
    expect(html).not.toMatch(/<dt class="text-muted">Employment<\/dt><dd[^>]*>Not supplied<\/dd>/);
    const block = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]))
      .find((d) => d["@type"] === "JobPosting");
    expect(block.employmentType).toBe("INTERN");
  });
});

describe("closed job addresses on the 404 page", () => {
  it("reads the employer and title words, and ignores other addresses", async () => {
    const { missingJob } = await import("@/components/JobNotFound");
    expect(missingJob("/jobs/at/anthropic/research-engineer-interpretability-1a2b3c4/")).toEqual({ org: "anthropic", words: "research engineer interpretability" });
    expect(missingJob("/jobs/at/anthropic/does-not-exist-zzz/")).toEqual({ org: "anthropic", words: "does not exist zzz" });
    expect(missingJob("/jobs/at/anthropic/")).toBeNull();
    expect(missingJob("/companies/anthropic/")).toBeNull();
    expect(missingJob("/jobs/in/california/")).toBeNull();
  });
});

describe("job page meta description", () => {
  const boilerplate: Description = [{ type: "p", runs: [{ t: "Acme AI is a company that builds AI for everyone. ".repeat(6) }] }];

  it("is built from the listing's facts, not the employer's boilerplate", () => {
    const meta = jobMetaDescription(page(job({ team: "Inference" }), boilerplate));
    expect(meta).toBe("Research Engineer at Acme AI in San Francisco, CA; London, UK (on-site). Pay: $200K–$300K a year. Department: Research, Inference.");
    expect(meta).not.toContain("builds AI for everyone");
    const html = renderJobPage(page(job(), boilerplate), { htmlClass: "", links: "" });
    expect(html).toContain('<meta name="description" content="Research Engineer at Acme AI in San Francisco, CA; London, UK (on-site). Pay: $200K–$300K a year. Department: Research."/>');
  });

  it("states pay labels and description-stated pay, and leaves out unknown facts", () => {
    const meta = jobMetaDescription(
      page(job({ workplace: "unknown", department: null, locations: [], salaries: [{ min: 50, max: 70, currency: "USD", period: "hour", label: "Zone A", source_status: "employer-description" }] })),
    );
    expect(meta).toBe("Research Engineer at Acme AI. Pay (Zone A): $50 to $70 per hour, as stated in the job description.");
  });

  it("never exceeds 160 characters and drops the least important facts first", () => {
    const many = Array.from({ length: 12 }, (_, i) => `Very Long City Name Number ${i}, CA`);
    const meta = jobMetaDescription(page(job({ title: "Principal Machine Learning Engineer, Distributed Training Infrastructure", locations: many, team: "Pretraining Systems and Reliability" })));
    expect(meta.length).toBeLessThanOrEqual(JOB_META_MAX);
    expect(meta).toContain("Principal Machine Learning Engineer, Distributed Training Infrastructure at Acme AI in Very Long City Name Number 0, CA and 11 more");
    const long = jobMetaDescription(page(job({ title: "x".repeat(300) })));
    expect(long.length).toBeLessThanOrEqual(JOB_META_MAX);
  });

  it("does not repeat a federal agency as both employer and department", () => {
    const federal = job({ source_type: "usajobs", department: "Department of Energy", team: null });
    expect(jobMetaDescription(page(federal))).not.toContain("Department: Department of Energy");
  });
});

describe("job page titles", () => {
  it("read \"{Title} at {Employer} ({City, ST})\", with Remote and +N locations", () => {
    expect(jobPageTitle(page(job({ title: "Research Engineer", locations: ["San Francisco, California, United States"] })))).toBe(
      "Research Engineer at Acme AI (San Francisco, CA, $200K–$300K)",
    );
    expect(jobPageTitle(page(job({ title: "Research Engineer", locations: ["San Francisco, CA", "New York, NY", "Seattle, WA"] })))).toBe(
      "Research Engineer at Acme AI (San Francisco, CA, $200K–$300K)",
    );
    expect(jobPageTitle(page(job({ title: "Research Engineer", locations: ["Remote - US"], workplace: "remote" })))).toBe("Research Engineer at Acme AI (Remote, $200K–$300K)");
    expect(jobPageTitle(page(job({ title: "Research Engineer", locations: [], workplace: "remote" })))).toBe("Research Engineer at Acme AI (Remote, $200K–$300K)");
    expect(jobPageTitle(page(job({ title: "Research Engineer", locations: [], workplace: "unknown" })))).toBe("Research Engineer at Acme AI ($200K–$300K)");
    expect(jobPageTitle(page(job({ title: "Research Engineer", locations: ["California"] })))).toBe("Research Engineer at Acme AI (California, $200K–$300K)");
  });

  it("shortens by dropping parts, and cuts a long title only at a word, never leaving half a parenthesis", () => {
    const long = page(job({ title: "Senior Staff Platform Engineer, Machine Learning Infrastructure and Developer Productivity", locations: ["San Diego, California, United States"] }));
    const t = jobPageTitle(long);
    expect(t.length).toBeLessThanOrEqual(70);
    expect(t).not.toMatch(/ref\./);
    expect(t).toMatch(/…/);
    const words = long.job.title.split(" ");
    const kept = t.replace(/… at Acme AI$/, "").replace(/…$/, "").split(" ");
    // Every kept word is a whole word of the original title.
    kept.forEach((w, i) => expect(w).toBe(words[i]));
    expect(clipWords("Senior Solutions Architect (EDW Enterprise Data Warehouse) Team Lead", 45)).toBe("Senior Solutions Architect…");
    expect(clipWords("Short", 45)).toBe("Short");
    expect(locationLabel(["Remote", "Austin, TX"])).toBe("Remote +1 location");
    expect(titlePlaces({ locations: ["Austin, TX", "Austin, Texas"], workplace: "on-site" })).toEqual(["Austin, TX"]);
  });

  it("are unique at one employer: every place first, then the requisition or posting ID", () => {
    const a = page(job({ id: "acme-ai:greenhouse:acme:1", source_job_id: "1", title: "Account Executive", locations: ["New York, NY"] }));
    const b = page(job({ id: "acme-ai:greenhouse:acme:2", source_job_id: "2", title: "Account Executive", locations: ["Austin, TX"] }));
    const c = page(job({ id: "acme-ai:greenhouse:acme:3", source_job_id: "3", title: "Account Executive", locations: ["Austin, TX"] }));
    const d = page(job({ id: "acme-ai:greenhouse:acme:5", source_job_id: "5", title: "Engineer", locations: ["Austin, TX", "Boston, MA"] }));
    const e = page(job({ id: "acme-ai:greenhouse:acme:6", source_job_id: "6", title: "Engineer", locations: ["Austin, TX", "Denver, CO"] }));
    const solo = page(job({ id: "acme-ai:greenhouse:acme:4", source_job_id: "4", title: "Researcher" }));
    const pages = [a, b, c, d, e, solo];
    assignTitleSuffixes(pages);
    expect(jobPageTitle(a)).toBe("Account Executive at Acme AI (New York, NY, $200K–$300K)");
    expect(a.titleId).toBeNull();
    expect(b.titleId).toBe("ID 2");
    expect(jobPageTitle(b)).toBe("Account Executive at Acme AI (Austin, TX, $200K–$300K) · ID 2");
    expect(jobPageTitle(d)).toBe("Engineer at Acme AI (Austin, TX · Boston, MA, $200K–$300K)");
    expect(jobPageTitle(e)).toBe("Engineer at Acme AI (Austin, TX · Denver, CO, $200K–$300K)");
    expect(solo.titleText).toBeNull();
    const titles = pages.map(jobPageTitle);
    expect(new Set(titles).size).toBe(titles.length);
    for (const t of titles) expect(t.length).toBeLessThanOrEqual(70);
  });

  it("prefers the requisition, and falls back to the page code for long posting IDs", () => {
    const make = (n: number, req: string | null) =>
      page(job({ id: `acme-ai:workday:acme:Engineer_R${n}`, source_job_id: `Very-Long-Workday-Posting-Name_R${n}`, requisition_id: req, title: "Engineer", locations: ["Austin, TX"] }));
    const withReq = [make(1, "R1"), make(2, "R2")];
    assignTitleSuffixes(withReq);
    expect(withReq.map((p) => p.titleId)).toEqual(["Req. R1", "Req. R2"]);
    const noReq = [make(1, null), make(2, null)];
    assignTitleSuffixes(noReq);
    expect(noReq.every((p) => /^ref\. [0-9a-z]{7}$/.test(p.titleId!))).toBe(true);
    expect(noReq[0].slug.endsWith(noReq[0].titleId!.slice(5))).toBe(true);
    const titles = noReq.map(jobPageTitle);
    expect(new Set(titles).size).toBe(2);
  });

  it("stays unique when shortening would make long titles or locations read the same", () => {
    const loc = (n: number) => `USA-California-San Jose-1320 Ridder Park Drive Building ${n}`;
    const same = [1, 2, 3].map((n) => page(job({ id: `acme-ai:greenhouse:acme:${n}`, source_job_id: String(n), title: "ASIC Design Engineer", locations: [loc(n)] })));
    const long = [1, 2].map((n) =>
      page(job({ id: `acme-ai:greenhouse:acme:L${n}`, source_job_id: `L${n}`, title: `Senior Technical Program Manager, Connected Warfare and Mission Autonomy ${n}`, locations: [] })),
    );
    const all = [...same, ...long];
    assignTitleSuffixes(all);
    const titles = all.map(jobPageTitle);
    expect(new Set(titles).size).toBe(titles.length);
    for (const t of titles) expect(t.length).toBeLessThanOrEqual(70);
  });
});

describe("job page landmarks", () => {
  it("puts the independence line inside the banner, not outside any landmark", () => {
    const html = renderJobPage(page(job()), { htmlClass: "", links: "" });
    const body = html.slice(html.indexOf("<body>"));
    const header = body.indexOf("<header>");
    expect(header).toBeGreaterThan(-1);
    expect(body.indexOf('data-testid="header-disclaimer"')).toBeGreaterThan(header);
    expect(body.indexOf('data-testid="header-disclaimer"')).toBeLessThan(body.indexOf("</header>"));
  });
});
