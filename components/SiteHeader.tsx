"use client";

import Link from "@/components/Link";
import { usePathname } from "next/navigation";
import { ChevronDown, Coffee, Menu, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { BrandMark } from "./BrandMark";
import { SiteSearch } from "./SiteSearch";
import { siteConfig, supportState } from "@/lib/site-config";

/** Reference links: in the compact More menu on wide screens, and in the mobile menu. */
const REFERENCE = [
  { href: "/new/", label: "New this week", more: true },
  { href: "/start/", label: "Start here", more: true },
  { href: "/faq/", label: "FAQ", more: true },
  { href: "/hubs/", label: "Hubs", more: true },
  { href: "/places/", label: "Places", more: false },
  { href: "/timeline/", label: "Timeline", more: false },
  { href: "/sources/", label: "Source library", more: false },
  { href: "/glossary/", label: "Glossary", more: true },
  { href: "/kids/", label: "For kids", more: false },
  { href: "/licenses/", label: "License guide", more: false },
  { href: "/policy/", label: "Policy tracker", more: true },
  { href: "/reuse/", label: "Data & reuse", more: false },
  { href: "/newsletter/", label: "Weekly email", more: false },
  { href: "/contribute/#corrections", label: "Corrections", more: true },
];

const MORE = REFERENCE.filter((r) => r.more);

const OPEN_SOURCE = [
  { href: "/open/", label: "Open Models & Tools", description: "U.S.-led open models, software, datasets, and evaluation tools, with sources" },
  { href: "/github/", label: "AI on GitHub", description: "The most-starred open-source AI projects on GitHub, ranked by stars" },
  { href: "/huggingface/", label: "AI on Hugging Face", description: "The most-liked open models and datasets on the Hugging Face Hub, ranked by likes" },
];

type NavItem = { href: string; label: string } | { label: string; items: typeof OPEN_SOURCE };

const NAV: NavItem[] = [
  { href: "/companies/", label: "Companies & Labs" },
  { label: "Open source", items: OPEN_SOURCE },
  { href: "/learn/", label: "Learn" },
  { href: "/matrix/", label: "Compare" },
  { href: "/news/", label: "News" },
  { href: "/methodology/", label: "Methodology" },
  { href: "/about/", label: "About" },
];

/** Mobile menu: each group (Open source) is listed as its links. */
const MOBILE_NAV = NAV.flatMap((item) => ("items" in item ? item.items : [item]));

/**
 * A disclosure (button plus a short list of links) for a group of pages,
 * such as Open source. It closes on Escape, on a click outside, and after any navigation.
 */
function NavMenu({ pathname, label, items }: { pathname: string; label: string; items: typeof OPEN_SOURCE }) {
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const open = openedFor === pathname;
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const current = items.some((p) => isCurrent(pathname, p.href));

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenedFor(null);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpenedFor(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onBlur={(event) => {
        if (open && !event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenedFor(null);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpenedFor(open ? null : pathname)}
        className={`inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-md px-3 text-[0.9375rem] transition-colors ${
          current ? "text-text underline decoration-cyan decoration-2 underline-offset-[10px]" : "text-muted hover:text-text"
        }`}
      >
        {label}
        <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-line-strong bg-elev p-2 shadow-pop"
      >
        <ul>
          {items.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                aria-current={isCurrent(pathname, p.href) ? "page" : undefined}
                className="block rounded-lg px-3 py-2.5 hover:bg-cyan/8 aria-[current=page]:bg-cyan/10"
              >
                <span className="block text-[0.9375rem] font-medium text-text">{p.label}</span>
                <span className="mt-0.5 block text-sm leading-snug text-muted">{p.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ReferenceMenu({ pathname, tipUrl }: { pathname: string; tipUrl: string | null }) {
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const open = openedFor === pathname;
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const current = MORE.some((p) => isCurrent(pathname, p.href));

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenedFor(null);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpenedFor(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="relative hidden xl:block"
      onBlur={(event) => {
        if (open && !event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenedFor(null);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpenedFor(open ? null : pathname)}
        className={`inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-md px-3 text-[0.9375rem] transition-colors ${
          current ? "text-text underline decoration-cyan decoration-2 underline-offset-[10px]" : "text-muted hover:text-text"
        }`}
      >
        More
        <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-line-strong bg-elev p-2 shadow-pop"
      >
        <nav aria-label="Reference">
          <ul>
            {MORE.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={false}
                  aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                  className="flex min-h-11 items-center rounded-lg px-3 text-[0.9375rem] text-muted hover:bg-cyan/8 hover:text-text aria-[current=page]:bg-cyan/10 aria-[current=page]:text-text"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {tipUrl ? (
              <li className="mt-1 border-t border-line pt-1">
                <a
                  href={tipUrl}
                  rel="noopener noreferrer"
                  className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-[0.9375rem] text-tone-gold hover:bg-cyan/8 hover:text-text"
                  data-testid="header-support"
                >
                  <Coffee aria-hidden="true" className="h-4 w-4" />
                  Support our project
                  <span className="sr-only"> (opens {siteConfig.support.providerLabel ?? "the tip page"})</span>
                </a>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function isCurrent(pathname: string, href: string) {
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return normalized === href || normalized.startsWith(href);
}

export function SiteHeader({ siteName, shortName, disclaimer, searchIndexUrl }: { siteName: string; shortName: string; disclaimer: string; searchIndexUrl: string }) {
  const pathname = usePathname() ?? "/";
  // The menu is open only for the path it was opened on, so it closes itself
  // after any navigation without an effect.
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const open = openedFor === pathname;
  const setOpen = (value: boolean) => setOpenedFor(value ? pathname : null);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  // The optional tip link; shown in More on desktop and in the mobile menu.
  const tipUrl = supportState(siteConfig.support).active ? siteConfig.support.tipUrl : null;
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenedFor(null);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    // While the menu is open, the page behind it neither scrolls nor takes focus.
    const header = toggleRef.current?.closest("header");
    const behind = [...document.querySelectorAll<HTMLElement>("body > main, body > footer, body > .skip-link")].filter(
      (el) => el !== header,
    );
    behind.forEach((el) => el.setAttribute("inert", ""));
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      behind.forEach((el) => el.removeAttribute("inert"));
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-t-4 border-b-line border-t-gold bg-[var(--header-bg)] backdrop-blur-md supports-[backdrop-filter]:bg-[var(--header-bg-blur)]">
      {/* Persistent independence line on every page. Secondary links live in More / the menu / the footer. */}
      <div className="border-b border-line bg-fog/50">
        <div className="container-page flex min-h-8 items-center py-1.5">
          <p className="text-[0.8125rem] leading-snug text-muted" data-testid="header-disclaimer">
            <span className="lg:hidden">Independent project. Not a U.S. government website.</span>
            <span className="hidden lg:inline">{disclaimer}</span>
          </p>
        </div>
      </div>
      <div className="container-page flex h-14 items-center justify-between gap-4 sm:h-16">
        <Link href="/" prefetch={false} className="group flex min-w-0 items-center gap-3 rounded-md" aria-label={`${shortName} — ${siteName}, home`}>
          <BrandMark className="h-7 w-7 shrink-0" />
          <span className="text-[1.0625rem] font-semibold tracking-[0.06em] text-text">{shortName}</span>
        </Link>

        <nav aria-label="Primary" className="hidden shrink-0 xl:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => {
              if ("items" in item) {
                return (
                  <li key={item.label}>
                    <NavMenu pathname={pathname} label={item.label} items={item.items} />
                  </li>
                );
              }
              const current = isCurrent(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-3 text-[0.9375rem] transition-colors ${
                      current ? "text-text underline decoration-cyan decoration-2 underline-offset-[10px]" : "text-muted hover:text-text"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <SiteSearch indexUrl={searchIndexUrl} />
          <ReferenceMenu pathname={pathname} tipUrl={tipUrl} />
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-line px-3 text-sm text-text xl:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen(!open)}
          >
            {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
            <span>{open ? "Close" : "Menu"}</span>
          </button>
        </div>
      </div>

      {/* The panel scrolls on its own, so every link stays reachable on short screens. */}
      <div
        id={panelId}
        hidden={!open}
        className="max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain border-t border-line bg-bg sm:max-h-[calc(100dvh-6rem)] xl:hidden"
      >
        <nav aria-label="Primary (mobile)" className="container-page py-3">
          <ul className="flex flex-col">
            {MOBILE_NAV.map((item, i) => {
              const current = isCurrent(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    ref={i === 0 ? firstLinkRef : undefined}
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={`flex min-h-12 items-center rounded-md px-2 text-base ${current ? "font-semibold text-text" : "text-muted hover:text-text"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <nav aria-label="Reference (mobile)" className="container-page pb-3">
          <p className="eyebrow px-2">Reference</p>
          <ul className="mt-1 flex flex-col">
            {REFERENCE.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="flex min-h-12 items-center rounded-md px-2 text-base text-muted hover:text-text">
                  {item.label}
                </Link>
              </li>
            ))}
            {tipUrl ? (
              <li>
                <a
                  href={tipUrl}
                  rel="noopener noreferrer"
                  className="flex min-h-12 items-center gap-2 rounded-md px-2 text-base text-tone-gold hover:text-text"
                >
                  <Coffee aria-hidden="true" className="h-4 w-4" />
                  Support our project
                  <span className="sr-only"> (opens {siteConfig.support.providerLabel ?? "the tip page"})</span>
                </a>
              </li>
            ) : null}
          </ul>
          <button
            type="button"
            className="btn btn-secondary mt-3 w-full"
            onClick={() => {
              setOpen(false);
              toggleRef.current?.focus();
            }}
          >
            <X aria-hidden="true" className="h-4 w-4" />
            Close menu
          </button>
        </nav>
      </div>
    </header>
  );
}
