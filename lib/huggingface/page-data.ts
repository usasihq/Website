/**
 * Props for the /huggingface/ indexes and their ranking pages, computed once
 * per build. Server/build only.
 */
import { countOptions, type HfListItem } from "./directory";
import { hfEntries, toHfListItem } from "./items";
import type { HfKind } from "./schema";

const cache = new Map<HfKind, ReturnType<typeof build>>();

function build(kind: HfKind) {
  const items: HfListItem[] = hfEntries(kind).map(toHfListItem);
  return {
    items,
    tasks: countOptions(items.flatMap((i) => i.tasks)),
    libraries: countOptions(items.map((i) => i.library).filter((l): l is string => Boolean(l))),
    licenses: countOptions(items.map((i) => i.license)),
    modalities: countOptions(items.flatMap((i) => i.modalities)),
    authors: { org: items.filter((i) => i.authorType === "org").length, user: items.filter((i) => i.authorType === "user").length },
    gated: items.filter((i) => i.gated).length,
    quantized: items.filter((i) => i.quantizedFrom).length,
  };
}

export function hfListData(kind: HfKind) {
  if (!cache.has(kind)) cache.set(kind, build(kind));
  return cache.get(kind)!;
}
