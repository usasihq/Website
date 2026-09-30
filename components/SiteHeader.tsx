"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { BrandMark } from "./BrandMark";

const NAV = [
  { href: "/companies/", label: "Companies & Labs" },
  { href: "/open/", label: "Open Models & Tools" },
  { href: "/matrix/", label: "Compare" },
  { href: "/methodology/", label: "Methodology" },
  { href: "/about/", label: "About" },
];

function isCurrent(pathname: string, href: string) {
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return normalized === href || normalized.startsWith(href);
}

export function SiteHeader({ siteName, shortName }: { siteName: string; shortName: string }) {
  const pathname = usePathname() ?? "/";
  // The menu is open only for the path it was opened on, so it closes itself
  // after any navigation without an effect.
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const open = openedFor === pathname;
  const setOpen = (value: boolean) => setOpenedFor(value ? pathname : null);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
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
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[rgba(5,8,22,0.82)] backdrop-blur-md supports-[backdrop-filter]:bg-[rgba(5,8,22,0.7)]">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" prefetch={false} className="group flex min-w-0 items-center gap-3 rounded-md" aria-label={`${shortName} — ${siteName}, home`}>
          <BrandMark className="h-7 w-7 shrink-0" />
          <span className="text-[1.0625rem] font-semibold tracking-[0.06em] text-text">{shortName}</span>
          <span aria-hidden="true" className="hidden h-5 w-px bg-line-strong xl:block" />
          <span className="hidden truncate text-[0.9375rem] font-normal text-muted xl:block">{siteName}</span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => {
              const current = isCurrent(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center rounded-md px-3 text-[0.9375rem] transition-colors ${
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

        <button
          ref={toggleRef}
          type="button"
          className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-line px-3 text-sm text-text lg:hidden"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
        >
          {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
          <span>{open ? "Close" : "Menu"}</span>
        </button>
      </div>

      <div id={panelId} hidden={!open} className="border-t border-line bg-bg lg:hidden">
        <nav aria-label="Primary (mobile)" className="container-page py-3">
          <ul className="flex flex-col">
            {NAV.map((item, i) => {
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
