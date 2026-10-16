"use client";

import Link from "@/components/Link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Search, Shuffle } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ENTRY_TYPE_LABELS } from "@/lib/labels";
import { searchEntries, type SearchEntry } from "@/lib/search";
import { highlightParts, isRecord, loadSearchIndex } from "./site-search-data";
import { useDebounced } from "./useQueryState";

/** Where to go when the box is empty. */
const QUICK_LINKS = [
  { href: "/start/", name: "Start here", summary: "Four ways into the catalog" },
  { href: "/companies/", name: "Companies & Labs", summary: "U.S. AI organizations" },
  { href: "/open/", name: "Open Models & Tools", summary: "Open models, software, datasets, and evaluation tools" },
  { href: "/learn/", name: "Learn", summary: "Explainers and learning paths" },
  { href: "/kids/", name: "For kids", summary: "AI and Super Intelligence, explained for readers 8 to 12" },
  { href: "/news/", name: "Latest news", summary: "Sourced news items" },
  { href: "/policy/", name: "Policy tracker", summary: "Federal AI laws, orders, and standards" },
];

type Option = { key: string; href: string; name: string; summary: string; badge?: string; random?: boolean };

const RESULT_LIMIT = 10;

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

/**
 * Site-wide search: a button in the header, or "/" and Ctrl/⌘ K from any
 * page, opens a modal dialog that searches every published record and page.
 * The input is an ARIA combobox; arrow keys move through the results and Enter
 * opens one. Nothing typed here is stored or sent anywhere.
 */
export function SiteSearch({ indexUrl }: { indexUrl: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [active, setActive] = useState(0);
  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = (i: number) => `${baseId}-opt-${i}`;

  const ensureIndex = useCallback(() => {
    loadSearchIndex(indexUrl).then(
      (e) => {
        setEntries(e);
        setLoadError(false);
      },
      () => setLoadError(true),
    );
  }, [indexUrl]);

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    ensureIndex();
    dialog.showModal();
    inputRef.current?.select();
  }, [ensureIndex]);

  const close = useCallback(() => dialogRef.current?.close(), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const modK = (event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey;
      const slash = event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isTyping(event.target);
      if (modK || slash) {
        event.preventDefault();
        open();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Leaving the page closes the dialog.
  useEffect(() => close(), [pathname, close]);

  const trimmed = query.trim();
  const matches = useMemo(() => (entries && trimmed ? searchEntries(entries, trimmed, 500) : []), [entries, trimmed]);
  // True when the results are typo or partial matches only, so the list can say so.
  const closeOnly = useMemo(
    () => Boolean(entries && trimmed && matches.length && searchEntries(entries, trimmed, 1, { fuzzy: false }).length === 0),
    [entries, trimmed, matches],
  );
  const options: Option[] = useMemo(() => {
    if (!trimmed) {
      return [
        ...QUICK_LINKS.map((q) => ({ key: q.href, ...q })),
        ...(entries ? [{ key: "random", href: "", name: "Surprise me", summary: "Open a random organization, model, or tool", random: true }] : []),
      ];
    }
    const top = matches.slice(0, RESULT_LIMIT).map((e) => ({ key: `${e.type}:${e.slug}`, href: e.href, name: e.name, summary: e.summary, badge: ENTRY_TYPE_LABELS[e.type] }));
    return entries ? [...top, { key: "all", href: `/search/?q=${encodeURIComponent(trimmed)}`, name: `See all results for “${trimmed}”`, summary: "", badge: undefined }] : top;
  }, [trimmed, matches, entries]);
  const current = Math.min(active, Math.max(options.length - 1, 0));

  const go = (option: Option) => {
    let href = option.href;
    if (option.random && entries) {
      const records = entries.filter(isRecord);
      href = records[Math.floor(Math.random() * records.length)]?.href ?? "/open/";
    }
    close();
    router.push(href);
  };

  useEffect(() => {
    document.getElementById(optionId(current))?.scrollIntoView({ block: "nearest" });
    // optionId is derived from a stable id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      // Close in one press, rather than first clearing the search field.
      event.preventDefault();
      close();
      return;
    }
    if (!options.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current + step + options.length) % options.length);
    } else if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      go(options[current]);
    }
  };

  const announced = useDebounced(trimmed && entries ? `${matches.length} ${matches.length === 1 ? "result" : "results"}` : "", 500);

  return (
    <>
      <button
        type="button"
        onClick={open}
        onPointerEnter={ensureIndex}
        onFocus={ensureIndex}
        className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-line px-3 text-sm text-muted transition-colors hover:border-line-strong hover:text-text sm:justify-start xl:justify-center xl:px-0 2xl:justify-start 2xl:px-3"
        data-testid="site-search-open"
        aria-haspopup="dialog"
      >
        <Search aria-hidden="true" className="h-5 w-5 sm:h-4 sm:w-4" />
        <span className="sr-only sm:not-sr-only xl:sr-only 2xl:not-sr-only">Search</span>
        <kbd aria-hidden="true" className="hidden rounded border border-line px-1.5 font-mono text-[0.75rem] leading-5 text-muted lg:inline xl:hidden 2xl:inline">
          /
        </kbd>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Search the site"
        className="site-search fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-text backdrop:bg-[rgba(2,4,12,0.72)] backdrop:backdrop-blur-sm"
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onClose={() => setActive(0)}
        data-testid="site-search"
      >
        <div className="mx-auto mt-[6vh] flex max-h-[86dvh] w-[min(42rem,calc(100%-2rem))] flex-col overflow-hidden rounded-2xl border border-line-strong bg-[#0a1024] shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-3 border-b border-line px-4">
            <Search aria-hidden="true" className="h-5 w-5 flex-none text-cyan" />
            <input
              ref={inputRef}
              type="search"
              role="combobox"
              aria-label="Search organizations, models, explainers, news, and more"
              aria-expanded={options.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={options.length ? optionId(current) : undefined}
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="go"
              placeholder="Search the site"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              className="h-14 min-w-0 flex-1 bg-transparent text-lg text-text outline-none placeholder:text-muted"
            />
            <button
              type="button"
              onClick={close}
              className="inline-flex h-11 min-w-11 items-center justify-center rounded-md border border-line px-3 text-sm text-muted hover:text-text sm:h-auto sm:min-w-0 sm:px-2 sm:py-1 sm:font-mono sm:text-xs"
            >
              <span className="sm:hidden">Close</span>
              <span className="hidden sm:inline">Esc</span>
              <span className="sr-only"> (close search)</span>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
            {!trimmed ? <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-[0.08em] text-muted">Jump to</p> : null}
            {trimmed && !entries ? (
              <p className="px-3 py-4 text-muted" role="status">
                {loadError ? "Search could not load. Check your connection and try again." : "Loading search…"}
              </p>
            ) : null}
            {trimmed && entries && matches.length === 0 ? (
              <p className="px-3 py-4 text-muted">
                Nothing published matches “{trimmed}”. Try fewer words, or browse{" "}
                <Link href="/companies/" className="link" onClick={close}>
                  Companies &amp; Labs
                </Link>{" "}
                and{" "}
                <Link href="/open/" className="link" onClick={close}>
                  Open Models &amp; Tools
                </Link>
                .
              </p>
            ) : null}
            {closeOnly ? (
              <p className="px-3 pb-1 pt-2 text-sm text-muted" data-testid="close-matches">
                No exact match for “{trimmed}”. Closest matches:
              </p>
            ) : null}
            <div role="listbox" id={listId} aria-label={trimmed ? "Search results" : "Suggested pages"}>
              {options.map((o, i) => {
                const selected = i === current;
                const body = (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 block break-words font-medium text-text sm:line-clamp-1">
                        {o.badge
                          ? highlightParts(o.name, trimmed).map((p, pi) =>
                              p.hit ? (
                                <mark key={pi} className="bg-transparent text-cyan">
                                  {p.text}
                                </mark>
                              ) : (
                                <span key={pi}>{p.text}</span>
                              ),
                            )
                          : o.name}
                      </span>
                      {o.badge ? (
                        <span className="badge mt-1 font-mono text-[0.625rem] uppercase tracking-[0.06em] text-ice sm:hidden">{o.badge}</span>
                      ) : null}
                      {o.summary ? <span className="mt-0.5 line-clamp-1 text-sm text-muted">{o.summary}</span> : null}
                    </span>
                    {o.badge ? (
                      <span className="badge hidden shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-ice sm:inline-flex">{o.badge}</span>
                    ) : o.random ? (
                      <Shuffle aria-hidden="true" className="h-4 w-4 flex-none text-cyan" />
                    ) : (
                      <ArrowRight aria-hidden="true" className="h-4 w-4 flex-none text-muted" />
                    )}
                  </>
                );
                const className = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ${selected ? "bg-[rgba(76,201,255,0.12)]" : ""}`;
                return o.random ? (
                  <div
                    key={o.key}
                    id={optionId(i)}
                    role="option"
                    aria-selected={selected}
                    tabIndex={-1}
                    className={`${className} cursor-pointer`}
                    onMouseMove={() => setActive(i)}
                    onClick={() => go(o)}
                  >
                    {body}
                  </div>
                ) : (
                  <Link
                    key={o.key}
                    id={optionId(i)}
                    role="option"
                    aria-selected={selected}
                    href={o.href}
                    prefetch={false}
                    className={className}
                    onMouseMove={() => setActive(i)}
                    onClick={close}
                  >
                    {body}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden items-center justify-between gap-4 border-t border-line px-4 py-2.5 text-xs text-muted sm:flex">
            <span>
              <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd> to move · <kbd className="font-mono">Enter</kbd> to open ·{" "}
              <kbd className="font-mono">Esc</kbd> to close
            </span>
            <span>Searches published records and pages. Nothing is saved.</span>
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {announced}
          </p>
        </div>
      </dialog>
    </>
  );
}
