/**
 * SmartRecruiters' documented public Posting API. The list endpoint returns
 * up to 100 postings per page without descriptions; each description is one
 * more request. Descriptions are fetched only for postings USASI has not
 * stored yet, so after the first run a refresh makes a few requests a day.
 */
import { setTimeout as delay } from "node:timers/promises";
import { z } from "../zod";
import type { Careers } from "./schema";
import { endpoint, fetchJson, FeedError } from "./security";

const short = z.string().max(1000);
export const SrPosting = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),
  name: short,
  releasedDate: z.string().nullable().optional(),
  location: z.object({ city: short.nullable().optional(), region: short.nullable().optional(), country: short.nullable().optional(),
    remote: z.boolean().nullable().optional(), hybrid: z.boolean().nullable().optional(), fullLocation: short.nullable().optional() }).optional(),
  department: z.object({ label: short.nullable().optional() }).nullable().optional(),
  typeOfEmployment: z.object({ id: short.nullable().optional(), label: short.nullable().optional() }).nullable().optional(),
  refNumber: short.nullable().optional(),
});
const Page = z.object({ offset: z.number().int(), limit: z.number().int(), totalFound: z.number().int().nonnegative(), content: z.array(SrPosting).max(100) });
const Detail = z.object({
  id: z.string(),
  jobAd: z.object({ sections: z.record(z.string(), z.object({ title: short.optional(), text: z.string().max(400000).optional() })) }).optional(),
});
export type SrPayload = { postings: z.infer<typeof SrPosting>[]; details: Record<string, string> };

const MAX_PAGES = 50;
const MAX_DETAILS = 1500;

export async function fetchSmartRecruiters(c: Careers, hasDescription: (postingId: string) => boolean, fetcher: typeof fetch = fetch): Promise<SrPayload> {
  if (c.source.type !== "smartrecruiters") throw new FeedError("payload");
  const base = endpoint(c);
  const postings: SrPayload["postings"] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const data = Page.parse(await fetchJson(`${base}?limit=100&offset=${page * 100}`, fetcher));
    postings.push(...data.content);
    if (postings.length >= data.totalFound || data.content.length === 0) {
      if (postings.length !== data.totalFound) throw new FeedError("payload");
      break;
    }
    if (page === MAX_PAGES - 1) throw new FeedError("payload");
    await delay(500);
  }
  const details: Record<string, string> = {};
  let fetched = 0;
  for (const p of postings) {
    if (hasDescription(p.id) || fetched >= MAX_DETAILS) continue;
    const d = Detail.parse(await fetchJson(`${base}/${encodeURIComponent(p.id)}`, fetcher));
    fetched++;
    const sections = Object.values(d.jobAd?.sections ?? {}).filter((s) => s.text);
    if (sections.length) details[p.id] = sections.map((s) => `${s.title ? `<h3>${s.title.replace(/[<>&]/g, " ")}</h3>` : ""}${s.text}`).join("");
    await delay(250);
  }
  return { postings, details };
}
