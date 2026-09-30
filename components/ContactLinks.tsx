import { Mail } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { ExternalLink } from "./ExternalLink";

/**
 * Official USASI contact address and profiles, as plain outbound links.
 * Nothing is embedded, so viewing a page never contacts these platforms.
 */
export function ContactLinks({ variant = "block" }: { variant?: "block" | "inline" }) {
  const { contact, socials } = siteConfig;
  if (variant === "inline") {
    return (
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.9375rem]" aria-label="USASI contact and profiles">
        {contact.email ? (
          <li>
            <a href={`mailto:${contact.email}`} className="link inline-flex items-center gap-1.5">
              <Mail aria-hidden="true" className="h-4 w-4" />
              {contact.email}
            </a>
          </li>
        ) : null}
        {socials.map((s) => (
          <li key={s.url}>
            <ExternalLink href={s.url} className="text-muted hover:text-text">
              {s.label}
            </ExternalLink>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <dl className="not-prose grid gap-3 font-sans text-[0.9375rem] sm:grid-cols-2" style={{ marginTop: "1rem" }}>
      {contact.email ? (
        <div className="rounded-lg border border-line p-3">
          <dt className="eyebrow text-[0.75rem]">Email</dt>
          <dd className="mt-1">
            <a href={`mailto:${contact.email}`} className="link">
              {contact.email}
            </a>
          </dd>
        </div>
      ) : null}
      {socials.map((s) => (
        <div key={s.url} className="rounded-lg border border-line p-3">
          <dt className="eyebrow text-[0.75rem]">{s.label}</dt>
          <dd className="mt-1">
            <ExternalLink href={s.url}>{s.handle}</ExternalLink>
          </dd>
        </div>
      ))}
    </dl>
  );
}
