/**
 * Validation for AI on Hugging Face, run by `npm run validate`: the committed
 * snapshots' schema, order, and uniqueness; slugs; the denylist and
 * must-include list; and that no listed item fails the published rules.
 */
import fs from "node:fs";
import { assignHfSlugs, hfBaseSlug, hfExclusionReason, type RawHfItem } from "./filters";
import { hfDenylistMap, HF_DATASETS_PATH, HF_DENYLIST_PATH, HF_INCLUDES_PATH, HF_MODELS_PATH, readHfDenylist, readHfIncludes } from "./load";
import { checkHfSnapshot, HfDatasetSnapshot, HfModelSnapshot, type HfDataset, type HfModel } from "./schema";

/**
 * Rebuild what the rules can still read from a stored record: the id and the
 * few tags kept on it. (Full Hub tags are not stored, so tag-only rules are
 * enforced at refresh time; validation re-checks the id rules and the denylist.)
 */
export function asRawHf(m: HfModel | HfDataset): RawHfItem {
  const tags = [
    ...(m.license ? [`license:${m.license}`] : []),
    ...("pipeline_tag" in m && m.pipeline_tag ? [m.pipeline_tag] : []),
    ...("task_categories" in m ? m.task_categories.map((t) => `task_categories:${t}`) : []),
  ];
  return { id: m.id, author: m.author, likes: m.likes, downloads: m.downloads_30d, tags, private: false, disabled: false, gated: m.gated };
}

export function validateHfData(files = { models: HF_MODELS_PATH, datasets: HF_DATASETS_PATH, deny: HF_DENYLIST_PATH, includes: HF_INCLUDES_PATH }): string[] {
  const problems: string[] = [];
  let deny;
  let includes;
  try {
    deny = readHfDenylist(files.deny);
  } catch (err) {
    return [`denylist.yml: ${(err as Error).message.slice(0, 300)}`];
  }
  try {
    includes = readHfIncludes(files.includes);
  } catch (err) {
    return [`includes.yml: ${(err as Error).message.slice(0, 300)}`];
  }
  const denied = new Set(deny.map((d) => `${d.kind}:${d.id.toLowerCase()}`));
  const seenDeny = new Set<string>();
  for (const d of deny) {
    const k = `${d.kind}:${d.id.toLowerCase()}`;
    if (seenDeny.has(k)) problems.push(`denylist.yml: duplicate entry ${d.kind} ${d.id}`);
    seenDeny.add(k);
  }
  const seenInc = new Set<string>();
  for (const i of includes) {
    const k = `${i.kind}:${i.id.toLowerCase()}`;
    if (seenInc.has(k)) problems.push(`includes.yml: duplicate entry ${i.kind} ${i.id}`);
    if (denied.has(k)) problems.push(`includes.yml: ${i.kind} ${i.id} is also in the denylist`);
    seenInc.add(k);
  }
  const map = hfDenylistMap(deny);
  for (const [kind, file] of [
    ["model", files.models],
    ["dataset", files.datasets],
  ] as const) {
    const name = file.split("/").pop();
    if (!fs.existsSync(file)) {
      problems.push(`${name} is missing (run npm run hf:refresh)`);
      continue;
    }
    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (err) {
      problems.push(`${name}: ${(err as Error).message}`);
      continue;
    }
    const issues = checkHfSnapshot(kind, raw);
    if (issues.length) {
      problems.push(...issues.map((i) => `${name} › ${i}`));
      continue;
    }
    const data = (kind === "model" ? HfModelSnapshot : HfDatasetSnapshot).parse(raw);
    const items = data.items as (HfModel | HfDataset)[];
    for (const m of items) {
      const reason = hfExclusionReason(kind, asRawHf(m), map);
      // A jailbreak-named dataset can be kept for its safety-training tags, which the record does not store.
      if (reason === "jailbreak" && kind === "dataset") continue;
      if (reason) problems.push(`${name} › ${m.id} is listed but matches the "${reason}" exclusion rule`);
    }
    const slugs = assignHfSlugs(items);
    if (new Set(slugs).size !== slugs.length) problems.push(`${name}: slugs are not unique`);
    for (const [i, s] of slugs.entries()) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*--[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) problems.push(`${name} › ${items[i].id}: slug "${s}" is not slug-safe`);
      if (!s.startsWith(hfBaseSlug(items[i].id))) problems.push(`${name} › ${items[i].id}: unexpected slug "${s}"`);
    }
  }
  return problems;
}
