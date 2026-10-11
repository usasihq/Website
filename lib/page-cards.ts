/**
 * Per-page social preview cards (1200×630 JPEG). One definition feeds both the
 * renderer (scripts/page-cards.ts, run before `next build`) and each page's
 * og:image / twitter:image metadata, so the image and its alt text agree.
 * Cards restate catalog facts only; they carry no third-party logos.
 */
import type { Catalog } from "./catalog";
import { formatDate } from "./dates";
import { ENTRY_TYPE_LABELS, NEWS_CATEGORY_LABELS, ROLE_LABELS } from "./labels";
import { KID_LESSONS } from "./kids";
import { EXPLAINERS, topic } from "./learn";
import { AVAILABILITY_LABELS } from "./openness";
import { artifactHref, orgHref } from "./routes";

/** Bump when the card template changes, so every card is rendered again. */
export const CARD_TEMPLATE_VERSION = 2;

export type PageCard = {
  /** The page the card belongs to. */
  page: string;
  /** Site path of the PNG. */
  image: string;
  template: "record" | "article";
  eyebrow: string;
  title: string;
  subtitle: string | null;
  facts: [string, string][];
  alt: string;
};

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
/** Whole sentences from the start of `s` that fit in `n` characters (at least the first). */
function leadSentences(s: string, n: number) {
  let out = "";
  for (const x of s.split(/(?<=[.!?])\s+/)) {
    const next = out ? `${out} ${x}` : x;
    if (out && next.length > n) break;
    out = next;
  }
  return out;
}
const listOf = (items: string[], n = 2) => (items.length > n ? `${items.slice(0, n).join(", ")} +${items.length - n}` : items.join(", "));

function card(c: Omit<PageCard, "alt">): PageCard {
  const facts = c.facts.map(([k, v]) => `${k}: ${v}`).join("; ");
  const alt = clip(`USASI preview card. ${c.eyebrow}: ${c.title}.${c.subtitle ? ` ${c.subtitle}.` : ""}${facts ? ` ${facts}.` : ""}`.replace(/\.\./g, "."), 420);
  return { ...c, alt };
}

export function pageCards(catalog: Catalog): PageCard[] {
  const cards: PageCard[] = [];
  for (const a of catalog.artifacts) {
    const item = catalog.toArtifactListItem(a);
    const facts: [string, string][] = [["Type", ENTRY_TYPE_LABELS[item.entryType]], ["Availability", AVAILABILITY_LABELS[item.availability]]];
    if (item.licenses.length) facts.push(["License", clip(listOf([...new Set(item.licenses.map((l) => l.label))]), 40)]);
    if (item.releasedAt) facts.push(["Released", formatDate(item.releasedAt)]);
    facts.push(["Reviewed", formatDate(item.lastReviewed)]);
    const from = item.organizations.map((o) => o.name);
    cards.push(
      card({
        page: artifactHref(a.slug),
        image: `/og/open/${a.slug}.jpg`,
        template: "record",
        eyebrow: "Open Models & Tools",
        title: a.name,
        subtitle: from.length ? `From ${clip(listOf(from), 60)}` : null,
        facts: facts.slice(0, 5),
      }),
    );
  }
  for (const o of catalog.organizations) {
    const item = catalog.toOrgListItem(o);
    const facts: [string, string][] = [];
    if (item.roles.length) facts.push(["Roles", clip(listOf(item.roles.map((r) => ROLE_LABELS[r] ?? r)), 44)]);
    if (item.headquarters) facts.push(["Headquarters", clip(item.headquarters, 36)]);
    facts.push(["Open records", String(item.artifactCount)]);
    facts.push(["Reviewed", formatDate(item.lastReviewed)]);
    cards.push(
      card({
        page: orgHref(o.slug),
        image: `/og/companies/${o.slug}.jpg`,
        template: "record",
        eyebrow: "Companies & Labs",
        title: o.name,
        subtitle: o.legal_name?.text && o.legal_name.text !== o.name ? clip(o.legal_name.text, 70) : null,
        facts,
      }),
    );
  }
  for (const n of catalog.news) {
    cards.push(
      card({
        page: `/news/${n.slug}/`,
        image: `/og/news/${n.slug}.jpg`,
        template: "article",
        eyebrow: `News · ${NEWS_CATEGORY_LABELS[n.category]}`,
        title: n.title,
        subtitle: `Event ${formatDate(n.event_date)} · Published ${formatDate(n.published_at)} · Sourced`,
        facts: [],
      }),
    );
  }
  for (const e of EXPLAINERS) {
    cards.push(
      card({
        page: `/learn/${e.slug}/`,
        image: `/og/learn/${e.slug}.jpg`,
        template: "article",
        eyebrow: `Learn · ${topic(e.topic).title}`,
        title: e.title,
        subtitle: e.question,
        facts: [],
      }),
    );
  }
  cards.push(
    card({
      page: "/kids/",
      image: "/og/kids/index.jpg",
      template: "article",
      eyebrow: "USASI for Kids",
      title: "AI and Super Intelligence, explained for kids",
      subtitle: `${KID_LESSONS.length} short lessons for readers about 8 to 12, to read with a grown-up`,
      facts: [],
    }),
  );
  for (const l of KID_LESSONS) {
    cards.push(
      card({
        page: `/kids/${l.slug}/`,
        image: `/og/kids/${l.slug}.jpg`,
        template: "article",
        eyebrow: `USASI for Kids · Lesson ${l.number}`,
        title: l.title,
        subtitle: clip(leadSentences(l.bigIdea, 200), 200),
        facts: [],
      }),
    );
  }
  for (const l of catalog.leaders) {
    cards.push(
      card({
        page: `/big-si/${l.slug}/`,
        image: `/og/leaders/${l.slug}.jpg`,
        template: "article",
        eyebrow: "People Behind Big SI",
        title: l.name,
        subtitle: clip(l.headline, 150),
        facts: [],
      }),
    );
  }
  for (const h of catalog.hubs) {
    cards.push(card({ page: `/hubs/${h.slug}/`, image: `/og/hubs/${h.slug}.jpg`, template: "article", eyebrow: "Hub", title: h.title, subtitle: h.summary, facts: [] }));
  }
  for (const l of catalog.licenses) {
    cards.push(
      card({ page: `/licenses/${l.slug}/`, image: `/og/licenses/${l.slug}.jpg`, template: "article", eyebrow: "License guide", title: l.name, subtitle: clip(l.summary.text, 160), facts: [] }),
    );
  }
  for (const i of catalog.newsletter) {
    cards.push(
      card({
        page: `/newsletter/${i.slug}/`,
        image: `/og/newsletter/${i.slug}.jpg`,
        template: "article",
        eyebrow: `The USASI weekly · Issue ${i.number}`,
        title: i.subject,
        subtitle: i.preview,
        facts: [],
      }),
    );
  }
  return cards;
}

const byCatalog = new WeakMap<Catalog, Map<string, PageCard>>();

/** The card for a page, as a metadata image ({ path, alt }), or undefined. */
export function cardImage(catalog: Catalog, page: string): { path: string; alt: string } | undefined {
  let map = byCatalog.get(catalog);
  if (!map) {
    map = new Map(pageCards(catalog).map((c) => [c.page, c]));
    byCatalog.set(catalog, map);
  }
  const c = map.get(page);
  return c ? { path: c.image, alt: c.alt } : undefined;
}
