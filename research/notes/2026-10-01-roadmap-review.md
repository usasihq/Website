# Review of "USASI Public Reference Roadmap" (independent report supplied by the owner, snapshot 2026-10-02)

The roadmap is consistent with the site's rules (evidence first, free access, no paid influence,
static architecture) and correctly notes that facets, URL state, comparison, JSON, RSS, and search
already exist. Its own "recommended first release boundary" was adopted with small adjustments.

## Adopted in this release (2026-10-01)

- Persistent independence line in the shared header on every page, with Start here, Glossary, and
  Corrections links (on phones the links are in the menu, so the first screen still fits).
- Start Here page (/start/): the report's opening copy adapted, four reader paths, a public checklist,
  and a "what this site is not" note.
- Glossary pilot (/glossary/): 22 terms, each with a real catalog example and primary sources.
- First explainer (/learn/open-weight-vs-open-source/), using real records and computed tiers.
- Data and reuse page (/reuse/) documenting the existing exports, identifiers, date meanings, and terms.
- Homepage orientation: a "Where to start" block and a plain statement of what counts mean.
- Jobs: verified official careers links for 26 employers without supported feeds (e.g. NVIDIA, Meta,
  Microsoft, Apple), and 14 more automated Greenhouse/Ashby feeds. SpaceX's board is linked but not
  collected (mostly non-AI roles).
- Pending drafts re-checked; the four People Behind Local AI drafts published (CONTENT_REVIEW F1k).

## Deferred (later phases in the roadmap)

Sector and state hubs (state hubs need a sourced `state_code` field first), typed relationships and
schema migration, dossiers, a primary-source library and timeline, explainers 2–10, comparison
export, search replacement evaluation, and the institution-coverage pilot.

## Owner decisions the roadmap lists (not decided here)

- Public editor identity and internal review owner.
- Whether to publish a correction response target (only once capacity is known).
- Whether to publish aggregate review-queue counts.
- Whether to add a periodic human-written editorial brief, and its frequency and byline.
- Which five hubs to build first.

## Phase two build-out (2026-10-01, owner: "Build the site out")

Owner decisions: no promised correction response time; no named editor. Both are stated on /about/
and /contribute/.

Built: five hubs (/hubs/), ten explainers with a Learn index (/learn/), places by documented
headquarters state (/places/), "What this catalog does not know" and "Explore related information"
on every record, comparison export (CSV, and JSON with field definitions and caveats), 34 glossary
terms, and an institution pilot (5 DOE national laboratories, 6 universities, 7 open projects).

Still deferred: typed relationship schema and migration, dossiers, a primary-source library and
timeline, search replacement evaluation, review-queue counts, and a human-written periodic brief.

## Remaining roadmap items: decisions (2026-10-02)

The owner declined a human-written brief and asked the assistant to decide the rest.

- Primary-source library: built (/sources/), generated from existing citations, so it needs no
  separate upkeep.
- Timeline: built (/timeline/) from documented release and news dates only.
- Search: extended to hubs, explainers, glossary terms, people, and states instead of replacing it.
- Dossiers: not built. The reviewed profile blocks plus "What this catalog does not know" give most
  of the value without a second, heavier record type to maintain.
- Typed relationship schema migration: not done. Existing parent, maintainer, and organization links
  cover current pages; a migration adds risk for little reader benefit.
- Pagefind or another search engine: not adopted; the extended index covers the gap.
- Review-queue counts: not published. Low reader value, and drafts must never leak.
