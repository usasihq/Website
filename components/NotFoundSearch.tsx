"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** Words from the missing address, offered as a site search ("/open/olmo-9/" → "olmo 9"). */
function guess(pathname: string) {
  return pathname
    .split("/")
    .filter(Boolean)
    .filter((part) => !["companies", "open", "learn", "news", "hubs", "licenses", "kids", "newsletter", "places", "usasi"].includes(part))
    .join(" ")
    .replace(/[-_.+]+/g, " ")
    .replace(/[^a-z0-9 ]/gi, "")
    .trim()
    .slice(0, 60);
}

export function NotFoundSearch() {
  const words = useSyncExternalStore(
    noop,
    () => guess(window.location.pathname),
    () => "",
  );
  return (
    <p className="mt-6 flex items-start gap-2 text-lg">
      <Search aria-hidden="true" className="mt-1.5 h-5 w-5 flex-none text-cyan" />
      {words ? (
        <span className="text-muted">
          Looking for{" "}
          <Link prefetch={false} href={`/search/?q=${encodeURIComponent(words)}`} className="link">
            “{words}”
          </Link>
          ? Search the site for it, or press <kbd className="rounded border border-line px-1.5 font-mono text-sm">/</kbd> on any page.
        </span>
      ) : (
        <Link prefetch={false} href="/search/" className="link">
          Search the site
        </Link>
      )}
    </p>
  );
}
