/**
 * npm run people:wikidata
 *
 * Matches published People profiles to Wikidata (and free Commons photos) and
 * writes data/people/wikidata.json. The site build reads only that file.
 *
 * High-confidence only: the name must agree and at least one fact from the
 * profile (employer, education, notable work, GitHub, or website) must match.
 * Several qualifying humans are skipped as ambiguous.
 *
 * `--offline` replays .cache/wikidata/ without calling the network.
 */
import fs from "node:fs";
import path from "node:path";
import { loadCatalog } from "../lib/catalog";
import {
  mergeSchoolLinks,
  schoolsFromAffiliations,
  schoolsFromPersonText,
  schoolsFromWikidataEducation,
} from "../lib/people-schools";
import {
  commonsImageFromMetadata,
  decideMatch,
  personFactsFrom,
  writePeopleWikidata,
  type CommonsExtMetadata,
  type PeopleWikidataDataset,
  type PersonWikidataMatch,
  type WikidataCandidate,
  type WikidataSkip,
} from "../lib/people-wikidata";

const USER_AGENT = "USASI-people-wikidata/1.0 (https://unitedstatesofamericasuperintelligence.com/; usasi@usasihq.com)";
const SPARQL = "https://query.wikidata.org/sparql";
const WIKIDATA_API = "https://www.wikidata.org/w/api.php";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const CACHE = path.join(process.cwd(), ".cache/wikidata");
const THUMB_WIDTH = 400;
const args = process.argv.slice(2);
const offline = args.includes("--offline");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type CacheFile = { fetched_at: string; payload: unknown };

function cachePath(key: string): string {
  return path.join(CACHE, `${key.replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 180)}.json`);
}

function readCache(key: string): unknown | undefined {
  const file = cachePath(key);
  if (!fs.existsSync(file)) return undefined;
  try {
    return (JSON.parse(fs.readFileSync(file, "utf8")) as CacheFile).payload;
  } catch {
    return undefined;
  }
}

function writeCache(key: string, payload: unknown): void {
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(cachePath(key), JSON.stringify({ fetched_at: new Date().toISOString(), payload }) + "\n");
}

async function fetchJson(url: string, cacheKey: string, init: RequestInit = {}, attempt = 0): Promise<unknown> {
  const cached = readCache(cacheKey);
  if (cached !== undefined) return cached;
  if (offline) throw new Error(`offline and no cache for ${cacheKey}`);
  if (attempt > 0) await sleep(Math.min(8000, 1000 * 2 ** attempt));
  else await sleep(200);
  const res = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", "User-Agent": USER_AGENT, ...(init.headers ?? {}) },
  });
  if (res.status === 429 || res.status === 503) {
    if (attempt >= 4) throw new Error(`${url} → ${res.status}`);
    const wait = Number(res.headers.get("retry-after")) || 5;
    console.log(`wikidata: ${res.status}, waiting ${wait}s (${cacheKey})`);
    await sleep(wait * 1000);
    return fetchJson(url, cacheKey, init, attempt + 1);
  }
  if (!res.ok) throw new Error(`${url} → ${res.status} ${res.statusText}`);
  const payload = await res.json();
  writeCache(cacheKey, payload);
  return payload;
}

async function sparql(query: string, cacheKey: string): Promise<Record<string, { value: string }>[]> {
  const url = `${SPARQL}?format=json&query=${encodeURIComponent(query)}`;
  const data = (await fetchJson(url, cacheKey)) as { results?: { bindings?: Record<string, { value: string }>[] } };
  return data.results?.bindings ?? [];
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function quote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

type SearchHit = { qid: string; via: string };

async function searchByNames(names: string[]): Promise<Map<string, SearchHit[]>> {
  const found = new Map<string, SearchHit[]>();
  const add = (name: string, qid: string, via: string) => {
    const list = found.get(name) ?? [];
    if (!list.some((h) => h.qid === qid)) list.push({ qid, via });
    found.set(name, list);
  };
  for (const [i, group] of chunk(names, 40).entries()) {
    const values = group.map((n) => `${quote(n)}@en`).join(" ");
    const query = `SELECT ?name ?item WHERE {
      VALUES ?name { ${values} }
      { ?item rdfs:label ?name } UNION { ?item skos:altLabel ?name }
      ?item wdt:P31 wd:Q5.
    }`;
    const rows = await sparql(query, `sparql-names-${i}`);
    for (const row of rows) {
      const qid = row.item?.value.match(/\/(Q[1-9][0-9]*)$/)?.[1];
      const name = row.name?.value;
      if (qid && name) add(name, qid, "label");
    }
    console.log(`wikidata: name search batch ${i + 1} → ${rows.length} rows`);
  }
  return found;
}

async function searchByGithub(usernames: string[]): Promise<Map<string, SearchHit[]>> {
  const found = new Map<string, SearchHit[]>();
  if (usernames.length === 0) return found;
  for (const [i, group] of chunk(usernames, 40).entries()) {
    const values = group.map((n) => quote(n)).join(" ");
    const query = `SELECT ?github ?item WHERE {
      VALUES ?github { ${values} }
      ?item wdt:P2037 ?github.
      ?item wdt:P31 wd:Q5.
    }`;
    const rows = await sparql(query, `sparql-github-${i}`);
    for (const row of rows) {
      const qid = row.item?.value.match(/\/(Q[1-9][0-9]*)$/)?.[1];
      const github = row.github?.value;
      if (qid && github) {
        const list = found.get(github.toLowerCase()) ?? [];
        list.push({ qid, via: "github" });
        found.set(github.toLowerCase(), list);
      }
    }
    console.log(`wikidata: github search batch ${i + 1} → ${rows.length} rows`);
  }
  return found;
}

async function searchEntities(name: string): Promise<SearchHit[]> {
  const url = `${WIKIDATA_API}?${new URLSearchParams({
    action: "wbsearchentities",
    search: name,
    language: "en",
    uselang: "en",
    type: "item",
    limit: "8",
    format: "json",
    origin: "*",
  })}`;
  const data = (await fetchJson(url, `search-${name}`)) as { search?: { id: string; label?: string }[] };
  return (data.search ?? []).map((s) => ({ qid: s.id, via: "wbsearch" }));
}

type EntityJson = {
  id: string;
  labels?: { en?: { value: string } };
  aliases?: { en?: { value: string }[] };
  claims?: Record<string, { mainsnak?: { datavalue?: { value?: { id?: string; "numeric-id"?: number } | string } } }[]>;
  sitelinks?: { enwiki?: { title?: string } };
};

function claimIds(entity: EntityJson, prop: string): string[] {
  return (entity.claims?.[prop] ?? [])
    .map((c) => {
      const v = c.mainsnak?.datavalue?.value;
      if (v && typeof v === "object" && "id" in v && typeof v.id === "string") return v.id;
      return null;
    })
    .filter((x): x is string => Boolean(x));
}

function claimStrings(entity: EntityJson, prop: string): string[] {
  return (entity.claims?.[prop] ?? [])
    .map((c) => {
      const v = c.mainsnak?.datavalue?.value;
      return typeof v === "string" ? v : null;
    })
    .filter((x): x is string => Boolean(x));
}

async function getEntities(qids: string[]): Promise<Map<string, EntityJson>> {
  const out = new Map<string, EntityJson>();
  const unique = [...new Set(qids)];
  for (const [i, group] of chunk(unique, 40).entries()) {
    const url = `${WIKIDATA_API}?${new URLSearchParams({
      action: "wbgetentities",
      ids: group.join("|"),
      props: "labels|aliases|claims|sitelinks",
      languages: "en",
      sitefilter: "enwiki",
      format: "json",
    })}`;
    const data = (await fetchJson(url, `entities-${i}-${group[0]}`)) as { entities?: Record<string, EntityJson> };
    for (const [id, ent] of Object.entries(data.entities ?? {})) out.set(id, ent);
    console.log(`wikidata: entities batch ${i + 1}/${Math.ceil(unique.length / 40)}`);
  }
  return out;
}

function wikipediaUrl(title: string | undefined): string | null {
  if (!title) return null;
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_")).replace(/%3A/g, ":").replace(/%2C/g, ",")}`;
}

function relatedIds(entity: EntityJson): string[] {
  return [...claimIds(entity, "P108"), ...claimIds(entity, "P1416"), ...claimIds(entity, "P69"), ...claimIds(entity, "P800"), ...claimIds(entity, "P101")];
}

function toCandidate(entity: EntityJson, entities: Map<string, EntityJson>): WikidataCandidate {
  const labelOf = (id: string) => entities.get(id)?.labels?.en?.value ?? id;
  const employerIds = [...claimIds(entity, "P108"), ...claimIds(entity, "P1416")];
  const eduIds = claimIds(entity, "P69");
  const workIds = claimIds(entity, "P800");
  const fieldIds = claimIds(entity, "P101");
  const image = claimStrings(entity, "P18")[0] ?? null;
  return {
    qid: entity.id,
    label: entity.labels?.en?.value ?? entity.id,
    aliases: (entity.aliases?.en ?? []).map((a) => a.value),
    instanceOf: claimIds(entity, "P31"),
    employers: employerIds.map(labelOf),
    educatedAt: eduIds.map((id) => ({ qid: id, name: labelOf(id) })),
    occupations: claimIds(entity, "P106"),
    fields: fieldIds.map(labelOf),
    notableWork: workIds.map(labelOf),
    github: claimStrings(entity, "P2037")[0] ?? null,
    websites: claimStrings(entity, "P856"),
    image,
    wikipedia: wikipediaUrl(entity.sitelinks?.enwiki?.title),
  };
}

async function commonsImage(fileTitle: string) {
  const title = fileTitle.startsWith("File:") ? fileTitle : `File:${fileTitle}`;
  const url = `${COMMONS_API}?${new URLSearchParams({
    action: "query",
    titles: title,
    prop: "imageinfo",
    iiprop: "url|extmetadata|size",
    iiurlwidth: String(THUMB_WIDTH),
    format: "json",
  })}`;
  const data = (await fetchJson(url, `commons-${title}`)) as {
    query?: { pages?: Record<string, { title?: string; imageinfo?: { thumburl?: string; url?: string; extmetadata?: CommonsExtMetadata }[] }> };
  };
  const page = Object.values(data.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info?.thumburl && !info?.url) return null;
  return commonsImageFromMetadata(page?.title ?? title, info.thumburl ?? info.url!, info.extmetadata ?? {});
}

async function main() {
  const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });
  const people = catalog.people;
  console.log(`wikidata: ${people.length} published people`);

  const facts = people.map((p) => {
    const schools = mergeSchoolLinks(schoolsFromPersonText(p), schoolsFromAffiliations(p));
    return { person: p, schools, facts: personFactsFrom(p, schools.map((s) => s.name)) };
  });

  const searchNames = (name: string): string[] => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 3 && /^[A-Za-z]\.?$/.test(parts[1])) return [name, `${parts[0]} ${parts[2]}`];
    return [name];
  };
  const nameHits = await searchByNames([...new Set(facts.flatMap((f) => searchNames(f.facts.name)))]);
  const githubHits = await searchByGithub([...new Set(facts.map((f) => f.facts.github).filter((g): g is string => Boolean(g)))]);

  const qids = new Set<string>();
  const hitsFor = new Map<string, SearchHit[]>();
  for (const row of facts) {
    const hits = [
      ...searchNames(row.facts.name).flatMap((n) => nameHits.get(n) ?? []),
      ...(row.facts.github ? (githubHits.get(row.facts.github.toLowerCase()) ?? []) : []),
    ];
    const uniqueHits = [...new Map(hits.map((h) => [h.qid, h])).values()];
    hitsFor.set(row.person.slug, uniqueHits);
    for (const h of uniqueHits) qids.add(h.qid);
  }

  const missing = facts.filter((f) => (hitsFor.get(f.person.slug) ?? []).length === 0);
  console.log(`wikidata: ${qids.size} QIDs from SPARQL; ${missing.length} people with no SPARQL hit`);
  for (const row of missing) {
    try {
      const extra = await searchEntities(row.facts.name);
      hitsFor.set(row.person.slug, extra);
      for (const h of extra) qids.add(h.qid);
    } catch (err) {
      console.log(`wikidata: search failed for ${row.person.slug}: ${(err as Error).message}`);
    }
  }

  const entities = await getEntities([...qids]);
  const related = [...new Set([...entities.values()].flatMap(relatedIds))];
  console.log(`wikidata: fetching labels for ${related.length} related items`);
  const relatedEntities = await getEntities(related);
  for (const [id, ent] of relatedEntities) entities.set(id, ent);
  const candidateCache = new Map<string, WikidataCandidate>();
  const peopleRows: PersonWikidataMatch[] = [];
  const skipped: WikidataSkip[] = [];
  let matched = 0;
  let photos = 0;
  let ambiguous = 0;
  let unmatched = 0;

  for (const row of facts) {
    const hits = hitsFor.get(row.person.slug) ?? [];
    const cands: WikidataCandidate[] = [];
    for (const hit of hits) {
      if (!candidateCache.has(hit.qid)) {
        const ent = entities.get(hit.qid);
        if (!ent) continue;
        candidateCache.set(hit.qid, toCandidate(ent, entities));
      }
      const cand = candidateCache.get(hit.qid);
      if (cand) cands.push(cand);
    }
    const decision = decideMatch(row.facts, cands);
    if (decision.status === "matched") {
      matched += 1;
      const edu = schoolsFromWikidataEducation(decision.candidate.educatedAt);
      const schools = mergeSchoolLinks(row.schools, edu);
      let image = null;
      if (decision.candidate.image) {
        try {
          image = await commonsImage(decision.candidate.image);
        } catch (err) {
          console.log(`wikidata: commons failed for ${row.person.slug}: ${(err as Error).message}`);
        }
      }
      if (image) photos += 1;
      peopleRows.push({
        slug: row.person.slug,
        qid: decision.candidate.qid,
        label: decision.candidate.label,
        wikipedia: decision.candidate.wikipedia,
        match_reasons: decision.reasons,
        image,
        schools,
      });
      continue;
    }
    if (row.schools.length) {
      peopleRows.push({
        slug: row.person.slug,
        qid: null,
        label: null,
        wikipedia: null,
        match_reasons: [],
        image: null,
        schools: row.schools,
      });
    }
    skipped.push({
      slug: row.person.slug,
      reason: decision.status === "ambiguous" ? "ambiguous" : "unmatched",
      detail: decision.detail,
      candidates: decision.candidates,
    });
    if (decision.status === "ambiguous") ambiguous += 1;
    else unmatched += 1;
  }

  const dataset: PeopleWikidataDataset = {
    generated_at: new Date().toISOString(),
    source: "https://www.wikidata.org/",
    people_count: people.length,
    matched,
    photos,
    ambiguous,
    unmatched,
    people: peopleRows,
    skipped: skipped.filter((s) => s.reason === "ambiguous"),
  };
  writePeopleWikidata(dataset);
  console.log(`wikidata: matched ${matched} / ${people.length}; photos ${photos}; ambiguous ${ambiguous}; unmatched ${unmatched}`);
  console.log(`wikidata: wrote ${peopleRows.length} enrichment rows to data/people/wikidata.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
