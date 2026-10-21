/**
 * Collects generated titles and descriptions for every indexable page so tests
 * can require a non-empty, unique pair within the search-result length limits.
 */
import path from "node:path";
import { loadCatalog, type Catalog } from "./catalog";
import { GITHUB_PAGE_SIZE, githubEntries, githubPageCount, githubPageHref, githubProjectSeo } from "./github/projects";
import { HF_PAGE_SIZE, hfDatasetEntries, hfItemSeo, hfModelEntries, hfPageCount, hfPageHref } from "./huggingface/items";
import { jobMetaDescription } from "./jobs/job-page-html";
import { jobPageTitle, jobPages, TITLE_LIMIT } from "./jobs/job-pages";
import { jobsLandingData } from "./jobs/landing";
import { EXPLAINERS } from "./learn";
import { clipDescription, DESCRIPTION_MAX, documentTitle, TITLE_MAX } from "./metadata";
import { personPageSeo } from "./people-seo";
import { organizationsByState } from "./place-index";
import { DATE_LABEL_VERBS, policyHref, policyPageTitle, summarySentences } from "./policy";
import { formatDate } from "./dates";
import { artifactHref, leaderHref, orgHref, personHref } from "./routes";
import {
  artifactSeo,
  explainerSeo,
  hubSeo,
  leaderSeo,
  licenseGuideSeo,
  newsItemSeo,
  organizationSeo,
  stateSeo,
} from "./seo";
import { companyJobsLink } from "./jobs/landing-links";

export type PageSeoRow = {
  path: string;
  title: string;
  description: string;
  documentTitle: string;
  titleLimit: number;
};

export type SeoAuditFailure = { path: string; reason: string; title?: string; description?: string };

export type SeoAudit = {
  pages: PageSeoRow[];
  failures: SeoAuditFailure[];
  counts: {
    pages: number;
    emptyTitle: number;
    emptyDescription: number;
    titleTooLong: number;
    descriptionTooLong: number;
    descriptionTooShort: number;
    duplicateTitles: number;
    duplicateDescriptions: number;
  };
};

const DESCRIPTION_MIN = 20;

export function collectPageSeo(catalog: Catalog): PageSeoRow[] {
  const rows: PageSeoRow[] = [];
  const add = (path: string, title: string, description: string, titleLimit = TITLE_MAX) => {
    rows.push({ path, title, description: clipDescription(description), documentTitle: documentTitle(title), titleLimit });
  };

  for (const p of catalog.people) {
    const seo = personPageSeo(catalog, p);
    add(personHref(p.slug), seo.title, seo.description);
  }
  for (const l of catalog.leaders) {
    const seo = leaderSeo(catalog, l);
    add(leaderHref(l.slug), seo.title, seo.description);
  }
  for (const o of catalog.organizations) {
    const jobs = companyJobsLink(catalog, o.slug);
    const seo = organizationSeo(catalog, o, jobs ? { jobCount: jobs.count } : undefined);
    add(orgHref(o.slug), seo.title, seo.description);
  }
  for (const a of catalog.artifacts) {
    const seo = artifactSeo(catalog, a);
    add(artifactHref(a.slug), seo.title, seo.description);
  }
  for (const item of catalog.news) {
    const seo = newsItemSeo(item);
    add(`/news/${item.slug}/`, seo.title, seo.description);
  }
  for (const d of catalog.policy) {
    add(policyHref(d.slug), policyPageTitle(d), `${DATE_LABEL_VERBS[d.date_label] ?? "Dated"} ${formatDate(d.date)}. ${summarySentences(d.summary.text)[0] ?? d.summary.text}`);
  }
  for (const g of catalog.licenses) {
    const seo = licenseGuideSeo(catalog, g.slug);
    if (seo) add(`/licenses/${g.slug}/`, seo.title, seo.description);
  }
  for (const s of organizationsByState(catalog).states) add(`/places/${s.code}/`, stateSeo(catalog, s).title, stateSeo(catalog, s).description);
  for (const h of catalog.hubs) {
    const seo = hubSeo(catalog, h);
    add(`/hubs/${h.slug}/`, seo.title, seo.description);
  }
  for (const e of EXPLAINERS) {
    const seo = explainerSeo(e);
    add(`/learn/${e.slug}/`, seo.title, seo.description);
  }
  for (const page of jobsLandingData(catalog).all) add(page.path, page.title, page.description);
  for (const p of jobPages(catalog)) add(p.path, jobPageTitle(p), jobMetaDescription(p), TITLE_LIMIT);
  const github = githubEntries();
  for (const e of github) {
    const seo = githubProjectSeo(e);
    add(e.href, seo.title, seo.description);
  }
  const githubPages = githubPageCount();
  for (let n = 2; n <= githubPages; n++) {
    const from = ((n - 1) * GITHUB_PAGE_SIZE + 1).toLocaleString("en-US");
    const to = Math.min(n * GITHUB_PAGE_SIZE, github.length).toLocaleString("en-US");
    add(githubPageHref(n), `AI on GitHub: projects ranked ${from}–${to}`, `Open-source AI projects on GitHub ranked ${from} to ${to} by stars, each with its own page.`);
  }
  for (const e of [...hfModelEntries(), ...hfDatasetEntries()]) {
    const seo = hfItemSeo(e);
    add(e.href, seo.title, seo.description);
  }
  for (const kind of ["model", "dataset"] as const) {
    const pages = hfPageCount(kind);
    const noun = kind === "model" ? "models" : "datasets";
    const total = kind === "model" ? hfModelEntries().length : hfDatasetEntries().length;
    for (let n = 2; n <= pages; n++) {
      const from = ((n - 1) * HF_PAGE_SIZE + 1).toLocaleString("en-US");
      const to = Math.min(n * HF_PAGE_SIZE, total).toLocaleString("en-US");
      add(hfPageHref(kind, n), `AI on Hugging Face: ${noun} ranked ${from}–${to}`, `Hugging Face ${noun} ranked ${from} to ${to} by likes, each with its own page.`);
    }
  }
  const counts = catalog.counts();
  add("/", "U.S. AI jobs, people, and news", "Independent directory of U.S. AI jobs, people, companies, and sourced news: open roles, profiles, and catalog updates. Not a United States government website.");
  add("/news/", "U.S. AI news — sourced releases, licenses & policy", `${catalog.news.length.toLocaleString("en-US")} dated, sourced updates about U.S. AI organizations and open artifacts in the USASI catalog: releases, license changes, ownership, and governance.`);
  add("/people/", "People in U.S. AI — founders, engineers, maintainers", `${catalog.people.length.toLocaleString("en-US")} sourced profiles of founders, engineers, researchers, and open-source maintainers behind U.S. AI organizations and open models in the USASI catalog.`);
  add("/policy/", "U.S. AI policy tracker", `${catalog.policy.length.toLocaleString("en-US")} federal laws, executive orders, OMB memoranda, standards, and frameworks on artificial intelligence, with dates, issuers, current status, and links to the official text.`);
  add("/github/", "AI on GitHub: the most-starred open-source AI projects", `The ${github.length.toLocaleString("en-US")} most-starred open-source AI projects on GitHub, ranked by stars.`);
  add("/huggingface/", "AI on Hugging Face: the most-liked open models", `The ${hfModelEntries().length.toLocaleString("en-US")} most-liked models on the Hugging Face Hub, ranked by likes.`);
  add("/huggingface/datasets/", "AI on Hugging Face: the most-liked datasets", `The ${hfDatasetEntries().length.toLocaleString("en-US")} most-liked datasets on the Hugging Face Hub, ranked by likes.`);
  add("/open/", "U.S. open-source & open-weight AI models and tools", `Directory of ${counts.modelReleases} model releases, ${counts.software} software projects, ${counts.datasets} datasets, and ${counts.evals} evaluation tools from U.S. organizations: licenses, openness tiers, and sources.`);
  add("/companies/", "U.S. AI companies & labs directory", `Directory of ${counts.organizations} U.S. AI companies, labs, research units, and foundations: products, open models, headquarters, and eligibility, each with sources.`);

  return rows;
}

export function auditPageSeo(rows: PageSeoRow[]): SeoAudit {
  const titleOwners = new Map<string, string[]>();
  const descriptionOwners = new Map<string, string[]>();
  const failures: SeoAuditFailure[] = [];
  const bump = (reason: SeoAuditFailure["reason"], row: PageSeoRow) => {
    failures.push({ path: row.path, reason, title: row.documentTitle, description: row.description });
  };

  for (const row of rows) {
    const title = row.documentTitle.trim();
    const description = row.description.trim();
    if (!title) bump("empty-title", row);
    if (!description) bump("empty-description", row);
    if (title.length > row.titleLimit) bump("title-too-long", row);
    if (description.length > DESCRIPTION_MAX) bump("description-too-long", row);
    if (description && description.length < DESCRIPTION_MIN) bump("description-too-short", row);
    titleOwners.set(title, [...(titleOwners.get(title) ?? []), row.path]);
    descriptionOwners.set(description, [...(descriptionOwners.get(description) ?? []), row.path]);
  }

  let duplicateTitles = 0;
  let duplicateDescriptions = 0;
  for (const [title, paths] of titleOwners) {
    if (title && paths.length > 1) {
      duplicateTitles += paths.length;
      for (const path of paths) failures.push({ path, reason: "duplicate-title", title });
    }
  }
  for (const [description, paths] of descriptionOwners) {
    if (description && paths.length > 1) {
      duplicateDescriptions += paths.length;
      for (const path of paths) failures.push({ path, reason: "duplicate-description", description });
    }
  }

  const count = (reason: string) => failures.filter((f) => f.reason === reason).length;
  return {
    pages: rows,
    failures,
    counts: {
      pages: rows.length,
      emptyTitle: count("empty-title"),
      emptyDescription: count("empty-description"),
      titleTooLong: count("title-too-long"),
      descriptionTooLong: count("description-too-long"),
      descriptionTooShort: count("description-too-short"),
      duplicateTitles,
      duplicateDescriptions,
    },
  };
}

export function loadSiteCatalog(): Catalog {
  return loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });
}

export function formatSeoAudit(audit: SeoAudit): string {
  const { counts } = audit;
  return [
    `pages=${counts.pages}`,
    `emptyTitle=${counts.emptyTitle}`,
    `emptyDescription=${counts.emptyDescription}`,
    `titleTooLong=${counts.titleTooLong}`,
    `descriptionTooLong=${counts.descriptionTooLong}`,
    `descriptionTooShort=${counts.descriptionTooShort}`,
    `duplicateTitles=${counts.duplicateTitles}`,
    `duplicateDescriptions=${counts.duplicateDescriptions}`,
  ].join(" ");
}
