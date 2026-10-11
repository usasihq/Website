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
    <p className="mt-6 flex flex-wrap items-center gap-2 text-lg">
      <Search aria-hidden="true" className="h-5 w-5 text-cyan" />
      {words ? (
        <>
          <span className="text-muted">Looking for</span>
          <Link prefetch={false} href={`/search/?q=${encodeURIComponent(words)}`} className="link">
            “{words}”
          </Link>
          <span className="text-muted">? Search the site for it, or press / on any page.</span>
        </>
      ) : (
        <Link prefetch={false} href="/search/" className="link">
          Search the site
        </Link>
      )}
    </p>
  );
}
