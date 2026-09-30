import Link from "next/link";
import { SupportPanel } from "@/components/SupportPanel";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <section className="container-page py-20 sm:py-28" aria-labelledby="nf-heading">
        <p className="eyebrow">404</p>
        <h1 id="nf-heading" className="mt-2 text-3xl font-semibold text-text sm:text-4xl">
          This page isn’t in the catalog.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          The address may be mistyped, or the entry may have been renamed. Draft and unverified entries are never published, so a link to one will
          land here.
        </p>
        <ul className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
          <li>
            <Link href="/companies/" className="btn btn-primary w-full">
              Companies &amp; Labs
            </Link>
          </li>
          <li>
            <Link href="/open/" className="btn btn-primary w-full">
              Open Models &amp; Tools
            </Link>
          </li>
          <li>
            <Link href="/" className="btn btn-secondary w-full">
              Home and search
            </Link>
          </li>
          <li>
            <Link href="/matrix/" className="btn btn-secondary w-full">
              Compare
            </Link>
          </li>
        </ul>
      </section>
      <SupportPanel variant="compact" />
    </>
  );
}
