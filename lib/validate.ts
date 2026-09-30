/**
 * Cross-record validation for catalog content.
 *
 * Pure function over already-read YAML documents so it can run in the build,
 * in `npm run validate`, and in unit tests against fixtures.
 */
import type { z } from "zod";
import {
  Artifact,
  ChangelogEntry,
  FeaturedSelection,
  LocalCornerSchedule,
  NewsItem,
  Organization,
  Person,
  type Artifact as ArtifactT,
  type ChangelogEntry as ChangelogEntryT,
  type FeaturedSelection as FeaturedSelectionT,
  type LocalCornerSchedule as LocalCornerScheduleT,
  type NewsItem as NewsItemT,
  type Organization as OrganizationT,
  type Person as PersonT,
} from "./schema";
import { CHECKLISTS } from "./openness";

export interface RawDocument {
  /** Path relative to the content root, used in messages. */
  file: string;
  data: unknown;
}

export interface RawContent {
  organizations: RawDocument[];
  artifacts: RawDocument[];
  changelog: RawDocument[];
  featured: RawDocument | null;
  people?: RawDocument[];
  localCorner?: RawDocument | null;
  news?: RawDocument[];
}

export interface ValidationIssue {
  level: "error" | "warning";
  file: string;
  path?: string;
  message: string;
}

export interface ValidatedContent {
  organizations: OrganizationT[];
  artifacts: ArtifactT[];
  changelog: ChangelogEntryT[];
  featured: FeaturedSelectionT | null;
  people: PersonT[];
  localCorner: LocalCornerScheduleT | null;
  news: NewsItemT[];
  issues: ValidationIssue[];
}

/** Claims the catalog does not publish, in news either. */
const NEWS_FORBIDDEN = /(\$\s?\d|\bvaluation|\bvalued at|\bfunding round|\braised\b|\bseries [a-h]\b|\bemployees\b|\bheadcount|\bmonthly active|\busers\b|\bbenchmark score|\bstate-of-the-art|\bbest-in-class|\bleading\b)/i;

/** Wording that would add personal (non-professional) details to a profile. */
const PERSONAL_DETAIL_PATTERN =
  /\b(born|birthplace|hometown|grew up|age[ds]?\s+\d|years old|nationality|citizen(ship)?|immigra\w*|married|spouse|wife|husband|children|live[sd]?\s+in|living\s+in|based\s+in|resid\w*|relocat\w*|moved\s+to|home address|religio\w*|ethnic\w*)\b/i;

/** Text that must never appear in public records. */
const PLACEHOLDER_PATTERN = /\b(TODO|TBD|FIXME|lorem ipsum|XXX+|insert here)\b|\[(placeholder|tbd|todo)\]/i;
/** Phrases that are placeholders when they are the whole value, but may be quoted in prose. */
const PLACEHOLDER_WHOLE = /^\s*(placeholder|coming soon|n\/a|none yet|unknown yet|to be (added|confirmed|determined))\.?\s*$/i;
const PLACEHOLDER_HOSTS = /(^|\.)(example\.(com|org|net)|localhost|test|invalid)$/i;

function basename(file: string): string {
  return file.split("/").pop()!.replace(/\.ya?ml$/, "");
}

function formatZodPath(path: PropertyKey[]): string {
  return path.map((p) => (typeof p === "number" ? `[${p}]` : String(p))).join(".").replace(/\.\[/g, "[");
}

function parseDocs<T>(docs: RawDocument[], schema: z.ZodType<T>, issues: ValidationIssue[]): Array<{ file: string; value: T }> {
  const out: Array<{ file: string; value: T }> = [];
  for (const doc of docs) {
    const yamlError = (doc.data as { __yaml_error?: string } | null)?.__yaml_error;
    if (yamlError) {
      issues.push({ level: "error", file: doc.file, message: `YAML syntax error: ${yamlError}` });
      continue;
    }
    const result = schema.safeParse(doc.data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        issues.push({ level: "error", file: doc.file, path: formatZodPath(issue.path), message: issue.message });
      }
      continue;
    }
    out.push({ file: doc.file, value: result.data });
  }
  return out;
}

/** Collect every source_ids reference in a record, with the path it came from. */
function collectSourceRefs(value: unknown, path: string, out: Array<{ id: string; path: string }>) {
  if (Array.isArray(value)) {
    value.forEach((v, i) => collectSourceRefs(v, `${path}[${i}]`, out));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value)) {
      if (key === "sources") continue;
      const childPath = path ? `${path}.${key}` : key;
      if (key === "source_ids" && Array.isArray(v)) {
        for (const id of v) out.push({ id: String(id), path: childPath });
      } else {
        collectSourceRefs(v, childPath, out);
      }
    }
  }
}

function collectStrings(value: unknown, path: string, out: Array<{ text: string; path: string }>) {
  if (typeof value === "string") {
    out.push({ text: value, path });
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => collectStrings(v, `${path}[${i}]`, out));
  } else if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value)) collectStrings(v, path ? `${path}.${key}` : key, out);
  }
}

function isUrlLike(text: string) {
  return /^https?:\/\//i.test(text);
}

function datePrefixAfter(date: string, today: string): boolean {
  // Compare documented dates of any precision against today at the same precision.
  return date > today.slice(0, date.length);
}

type AnyRecord = (OrganizationT | ArtifactT) & { __file: string };

function checkRecordCommon(record: AnyRecord, today: string, issues: ValidationIssue[]) {
  const file = record.__file;
  const push = (level: ValidationIssue["level"], message: string, path?: string) =>
    issues.push({ level, file, path, message });

  if (basename(file) !== record.slug) {
    push("error", `File name must match slug "${record.slug}"`, "slug");
  }

  // Sources: unique IDs, references resolve, no orphaned entries.
  const sourceIds = new Set<string>();
  record.sources.forEach((source, i) => {
    if (sourceIds.has(source.id)) push("error", `Duplicate source id "${source.id}"`, `sources[${i}].id`);
    sourceIds.add(source.id);
    if (source.accessed_at > today) push("error", "accessed_at is in the future", `sources[${i}].accessed_at`);
    if (source.published_at && datePrefixAfter(source.published_at, today)) {
      push("error", "published_at is in the future", `sources[${i}].published_at`);
    }
  });
  const refs: Array<{ id: string; path: string }> = [];
  collectSourceRefs(record, "", refs);
  const referenced = new Set<string>();
  for (const ref of refs) {
    referenced.add(ref.id);
    if (!sourceIds.has(ref.id)) push("error", `Unknown source id "${ref.id}"`, ref.path);
  }
  record.sources.forEach((source, i) => {
    if (!referenced.has(source.id)) {
      push("warning", `Source "${source.id}" is not cited by any claim`, `sources[${i}]`);
    }
  });

  // Editorial dates.
  if (record.updated_at > today) push("error", "updated_at is in the future", "updated_at");
  if (record.last_reviewed && record.last_reviewed > today) push("error", "last_reviewed is in the future", "last_reviewed");
  if (record.eligibility.assessed_at > today) push("error", "eligibility.assessed_at is in the future", "eligibility.assessed_at");

  // Publication consistency.
  if (record.publication_status === "published") {
    if (record.eligibility.status !== "eligible") {
      push("error", `Published records must be eligible (found "${record.eligibility.status}")`, "eligibility.status");
    }
    if (!record.last_reviewed) push("error", "Published records need a last_reviewed date", "last_reviewed");
    if (record.archive_note) push("error", "archive_note is only for archived records", "archive_note");
  }
  if (record.publication_status === "archived") {
    if (!record.archive_note) push("error", "Archived records need an archive_note explaining why", "archive_note");
    if (!record.last_reviewed) push("error", "Archived records need a last_reviewed date", "last_reviewed");
  }

  // Placeholders and unusable URLs in anything that could reach the public site.
  const strings: Array<{ text: string; path: string }> = [];
  collectStrings(record, "", strings);
  const level = record.publication_status === "draft" ? "warning" : "error";
  for (const { text, path } of strings) {
    if (path === "__file") continue;
    if (!isUrlLike(text) && (PLACEHOLDER_PATTERN.test(text) || PLACEHOLDER_WHOLE.test(text))) {
      push(level, `Placeholder text found: "${text.slice(0, 60)}"`, path);
    }
    if (isUrlLike(text)) {
      try {
        if (PLACEHOLDER_HOSTS.test(new URL(text).hostname)) push(level, `Placeholder URL: ${text}`, path);
      } catch {
        /* schema already rejected malformed URLs */
      }
    }
  }
}

export function validateContent(raw: RawContent, options: { today: string }): ValidatedContent {
  const issues: ValidationIssue[] = [];
  const { today } = options;

  const orgDocs = parseDocs(raw.organizations, Organization, issues);
  const artifactDocs = parseDocs(raw.artifacts, Artifact, issues);
  const changelogDocs = parseDocs(raw.changelog, ChangelogEntry, issues);
  const featuredDoc = raw.featured ? parseDocs([raw.featured], FeaturedSelection, issues)[0] ?? null : null;

  const organizations = orgDocs.map(({ file, value }) => Object.assign(value, { __file: file }));
  const artifacts = artifactDocs.map(({ file, value }) => Object.assign(value, { __file: file }));

  // Unique slugs within each collection.
  for (const [collection, list] of [["organization", organizations], ["artifact", artifacts]] as const) {
    const seen = new Map<string, string>();
    for (const record of list) {
      const prior = seen.get(record.slug);
      if (prior) issues.push({ level: "error", file: record.__file, path: "slug", message: `Duplicate ${collection} slug "${record.slug}" (also in ${prior})` });
      seen.set(record.slug, record.__file);
    }
  }

  const orgBySlug = new Map(organizations.map((o) => [o.slug, o]));
  const artifactBySlug = new Map(artifacts.map((a) => [a.slug, a]));

  for (const org of organizations) {
    checkRecordCommon(org, today, issues);
    const push = (level: ValidationIssue["level"], message: string, path?: string) =>
      issues.push({ level, file: org.__file, path, message });

    const productIds = new Set<string>();
    org.products.forEach((p, i) => {
      if (productIds.has(p.id)) push("error", `Duplicate product id "${p.id}"`, `products[${i}].id`);
      productIds.add(p.id);
      if (p.last_reviewed > today) push("error", "Product last_reviewed is in the future", `products[${i}].last_reviewed`);
    });

    if (org.parent_org_slug) {
      const parent = orgBySlug.get(org.parent_org_slug);
      if (!parent) {
        push("error", `Unknown parent_org_slug "${org.parent_org_slug}"`, "parent_org_slug");
      } else if (org.publication_status === "published" && parent.publication_status !== "published") {
        push("warning", `Parent "${parent.slug}" is not published; the relationship will be shown without a link`, "parent_org_slug");
      }
      // Cycle detection.
      const visited = new Set([org.slug]);
      let cursor = org.parent_org_slug ? orgBySlug.get(org.parent_org_slug) : undefined;
      while (cursor) {
        if (visited.has(cursor.slug)) {
          push("error", "Parent relationship forms a cycle", "parent_org_slug");
          break;
        }
        visited.add(cursor.slug);
        cursor = cursor.parent_org_slug ? orgBySlug.get(cursor.parent_org_slug) : undefined;
      }
    }

    if (org.eligibility.status === "eligible" && org.eligibility.basis === "us-headquarters" && org.headquarters?.country !== "US") {
      push("error", "Eligibility basis us-headquarters requires a documented U.S. headquarters", "headquarters");
    }
    if (org.founded && org.founded.year > Number(today.slice(0, 4))) push("error", "founded is in the future", "founded.year");
  }

  for (const artifact of artifacts) {
    checkRecordCommon(artifact, today, issues);
    const push = (level: ValidationIssue["level"], message: string, path?: string) =>
      issues.push({ level, file: artifact.__file, path, message });
    const isPublic = artifact.publication_status !== "draft";

    // Relationships to organizations.
    artifact.organization_slugs.forEach((slug, i) => {
      const org = orgBySlug.get(slug);
      if (!org) push("error", `Unknown organization slug "${slug}"`, `organization_slugs[${i}]`);
      else if (isPublic && org.publication_status !== "published") {
        push("warning", `Organization "${slug}" is not published; it will be shown without a link`, `organization_slugs[${i}]`);
      }
    });
    artifact.maintainers.forEach((m, i) => {
      if (m.organization_slug && !orgBySlug.has(m.organization_slug)) {
        push("error", `Unknown maintainer organization "${m.organization_slug}"`, `maintainers[${i}].organization_slug`);
      }
      if (m.organization_slug && !artifact.organization_slugs.includes(m.organization_slug)) {
        push("error", `Maintainer organization "${m.organization_slug}" must also appear in organization_slugs`, `maintainers[${i}].organization_slug`);
      }
    });

    // Family / release structure.
    if (artifact.record_level === "release" && artifact.family_slug) {
      const family = artifactBySlug.get(artifact.family_slug);
      if (!family) push("error", `Unknown family_slug "${artifact.family_slug}"`, "family_slug");
      else {
        if (family.record_level !== "family") push("error", `"${family.slug}" is not a family record`, "family_slug");
        if (family.kind !== artifact.kind) push("error", "A release must have the same kind as its family", "kind");
        if (artifact.publication_status === "published" && family.publication_status !== "published") {
          push("error", `Published release belongs to unpublished family "${family.slug}"`, "family_slug");
        }
      }
    }
    if (artifact.record_level === "family") {
      if (Object.keys(artifact.checklist).length > 0) {
        push("error", "Family overviews do not carry a checklist; assess individual releases", "checklist");
      }
      if (artifact.licenses.length > 0) {
        push("error", "Family overviews do not carry licenses; attach licenses to the releases assessed", "licenses");
      }
    }

    // Checklist keys belong to this kind.
    const allowed = new Set(CHECKLISTS[artifact.kind].map((d) => d.key));
    for (const key of Object.keys(artifact.checklist)) {
      if (!allowed.has(key)) push("error", `Checklist item "${key}" does not apply to kind "${artifact.kind}"`, `checklist.${key}`);
    }

    if (artifact.provenance) {
      artifact.provenance.derived_from.forEach((d, i) => {
        if (d.artifact_slug && !artifactBySlug.has(d.artifact_slug)) {
          push("error", `Unknown provenance artifact "${d.artifact_slug}"`, `provenance.derived_from[${i}].artifact_slug`);
        }
      });
    }

    if (artifact.released_at && datePrefixAfter(artifact.released_at, today)) {
      push("error", "released_at is in the future", "released_at");
    }

    // Hardware estimates must state assumptions.
    artifact.run_notes.forEach((note, i) => {
      if (/\b\d+(\.\d+)?\s?(GB|GiB)\b/.test(note.text) && !/(precision|quantiz|bf16|fp16|fp8|int8|int4|mxfp4|bit|assum)/i.test(note.text)) {
        push("error", "Memory figures in run notes must state precision/quantization and assumptions", `run_notes[${i}].text`);
      }
    });
  }

  const publishedOrgs = new Set(organizations.filter((o) => o.publication_status === "published").map((o) => o.slug));
  const publishedArtifacts = new Set(artifacts.filter((a) => a.publication_status === "published").map((a) => a.slug));

  if (featuredDoc) {
    const f = featuredDoc.value;
    f.organizations.forEach((slug, i) => {
      if (!publishedOrgs.has(slug)) issues.push({ level: "error", file: featuredDoc.file, path: `organizations[${i}]`, message: `Featured organization "${slug}" is not published` });
    });
    f.artifacts.forEach((slug, i) => {
      if (!publishedArtifacts.has(slug)) issues.push({ level: "error", file: featuredDoc.file, path: `artifacts[${i}]`, message: `Featured artifact "${slug}" is not published` });
    });
  }

  for (const { file, value } of changelogDocs) {
    if (value.date > today) issues.push({ level: "error", file, path: "date", message: "Changelog date is in the future" });
    value.changes.forEach((change, i) => {
      if (!change.slug) return;
      const exists =
        change.record_type === "organization" ? orgBySlug.has(change.slug) : change.record_type === "artifact" ? artifactBySlug.has(change.slug) : true;
      if (!exists) issues.push({ level: "error", file, path: `changes[${i}].slug`, message: `Unknown ${change.record_type} "${change.slug}"` });
    });
  }

  /* ---- Local corner people ---- */
  const peopleDocs = parseDocs(raw.people ?? [], Person, issues);
  const scheduleDoc = raw.localCorner ? parseDocs([raw.localCorner], LocalCornerSchedule, issues)[0] ?? null : null;
  const personSlugs = new Map<string, string>();
  for (const { file, value: person } of peopleDocs) {
    const push = (level: ValidationIssue["level"], message: string, path?: string) => issues.push({ level, file, path, message });
    if (basename(file) !== person.slug) push("error", `File name must match slug "${person.slug}"`, "slug");
    if (personSlugs.has(person.slug)) push("error", `Duplicate person slug "${person.slug}"`, "slug");
    personSlugs.set(person.slug, file);

    const ids = new Set<string>();
    person.sources.forEach((s, i) => {
      if (ids.has(s.id)) push("error", `Duplicate source id "${s.id}"`, `sources[${i}].id`);
      ids.add(s.id);
      if (s.accessed_at > today) push("error", "accessed_at is in the future", `sources[${i}].accessed_at`);
    });
    const refs: Array<{ id: string; path: string }> = [];
    collectSourceRefs(person, "", refs);
    const used = new Set(refs.map((r) => r.id));
    for (const r of refs) if (!ids.has(r.id)) push("error", `Unknown source id "${r.id}"`, r.path);
    person.sources.forEach((s, i) => {
      if (!used.has(s.id)) push("warning", `Source "${s.id}" is not cited by any claim`, `sources[${i}]`);
    });
    if (person.updated_at > today) push("error", "updated_at is in the future", "updated_at");
    if (person.last_reviewed && person.last_reviewed > today) push("error", "last_reviewed is in the future", "last_reviewed");

    person.affiliations.forEach((a, i) => {
      if (a.organization_slug && !orgBySlug.has(a.organization_slug)) push("error", `Unknown organization slug "${a.organization_slug}"`, `affiliations[${i}]`);
    });
    person.work.forEach((w, i) => {
      if (w.artifact_slug && !artifactBySlug.has(w.artifact_slug)) push("error", `Unknown artifact slug "${w.artifact_slug}"`, `work[${i}]`);
    });

    const strings: Array<{ text: string; path: string }> = [];
    collectStrings(person, "", strings);
    for (const { text, path } of strings) {
      if (isUrlLike(text)) continue;
      if (PLACEHOLDER_PATTERN.test(text) || PLACEHOLDER_WHOLE.test(text)) push(person.publication_status === "draft" ? "warning" : "error", `Placeholder text found: "${text.slice(0, 60)}"`, path);
      if (!path.startsWith("sources") && PERSONAL_DETAIL_PATTERN.test(text)) {
        push("error", `Personal detail not allowed in profiles: "${text.slice(0, 60)}"`, path);
      }
    }

    if (person.publication_status === "published") {
      if (!person.last_reviewed) push("error", "Published profiles need a last_reviewed date", "last_reviewed");
      const tied =
        person.affiliations.some((a) => a.organization_slug && publishedOrgs.has(a.organization_slug)) ||
        person.work.some((w) => w.artifact_slug && publishedArtifacts.has(w.artifact_slug));
      if (!tied) push("error", "A published profile must link to at least one published catalog organization or artifact", "affiliations");
    }
  }
  if (scheduleDoc) {
    const months = new Set<string>();
    scheduleDoc.value.lineups.forEach((lineup, i) => {
      if (months.has(lineup.month)) issues.push({ level: "error", file: scheduleDoc.file, path: `lineups[${i}].month`, message: `Duplicate month ${lineup.month}` });
      months.add(lineup.month);
      lineup.people.forEach((slug, j) => {
        const doc = peopleDocs.find((d) => d.value.slug === slug);
        if (!doc || doc.value.publication_status !== "published") {
          issues.push({ level: "error", file: scheduleDoc.file, path: `lineups[${i}].people[${j}]`, message: `"${slug}" is not a published profile` });
        }
      });
    });
  }

  /* ---- News ---- */
  const newsDocs = parseDocs(raw.news ?? [], NewsItem, issues);
  const newsSlugs = new Set<string>();
  for (const { file, value: item } of newsDocs) {
    const push = (level: ValidationIssue["level"], message: string, path?: string) => issues.push({ level, file, path, message });
    if (basename(file) !== item.slug) push("error", `File name must match slug "${item.slug}"`, "slug");
    if (newsSlugs.has(item.slug)) push("error", `Duplicate news slug "${item.slug}"`, "slug");
    newsSlugs.add(item.slug);
    const ids = new Set(item.sources.map((s) => s.id));
    if (ids.size !== item.sources.length) push("error", "Duplicate source id", "sources");
    for (const id of item.summary.source_ids) if (!ids.has(id)) push("error", `Unknown source id "${id}"`, "summary.source_ids");
    item.sources.forEach((s, i) => {
      if (!item.summary.source_ids.includes(s.id)) push("warning", `Source "${s.id}" is not cited`, `sources[${i}]`);
      if (s.accessed_at > today) push("error", "accessed_at is in the future", `sources[${i}].accessed_at`);
    });
    if (datePrefixAfter(item.event_date, today)) push("error", "event_date is in the future", "event_date");
    if (item.published_at > today) push("error", "published_at is in the future", "published_at");
    if (item.event_date > item.published_at.slice(0, item.event_date.length)) push("error", "event_date is after published_at", "event_date");
    const published = item.publication_status === "published";
    if (item.related_organizations.length + item.related_artifacts.length === 0) {
      push("error", "News items must relate to at least one catalog record", "related_organizations");
    }
    item.related_organizations.forEach((slug, i) => {
      if (!orgBySlug.has(slug)) push("error", `Unknown organization slug "${slug}"`, `related_organizations[${i}]`);
      else if (published && !publishedOrgs.has(slug)) push("error", `Related organization "${slug}" is not published`, `related_organizations[${i}]`);
    });
    item.related_artifacts.forEach((slug, i) => {
      if (!artifactBySlug.has(slug)) push("error", `Unknown artifact slug "${slug}"`, `related_artifacts[${i}]`);
      else if (published && !publishedArtifacts.has(slug)) push("error", `Related artifact "${slug}" is not published`, `related_artifacts[${i}]`);
    });
    for (const [path, text] of [["title", item.title], ["summary.text", item.summary.text]] as const) {
      if (PLACEHOLDER_PATTERN.test(text) || PLACEHOLDER_WHOLE.test(text)) push(published ? "error" : "warning", `Placeholder text in ${path}`, path);
      if (NEWS_FORBIDDEN.test(text)) push(published ? "error" : "warning", `News may not include funding, valuations, staffing, user counts, or superlatives: "${text.slice(0, 60)}"`, path);
    }
  }

  const strip = <T extends { __file?: string }>(r: T) => {
    const { __file: _omit, ...rest } = r;
    void _omit;
    return rest as Omit<T, "__file">;
  };

  return {
    organizations: organizations.map(strip) as OrganizationT[],
    artifacts: artifacts.map(strip) as ArtifactT[],
    changelog: changelogDocs.map((d) => d.value).sort((a, b) => b.date.localeCompare(a.date)),
    featured: featuredDoc?.value ?? null,
    people: peopleDocs.map((d) => d.value),
    localCorner: scheduleDoc?.value ?? null,
    news: newsDocs.map((d) => d.value).sort((a, b) => b.published_at.localeCompare(a.published_at) || b.event_date.localeCompare(a.event_date)),
    issues,
  };
}
