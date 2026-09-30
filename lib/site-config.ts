/**
 * Central site configuration.
 *
 * ─── OWNER CONFIGURATION ─────────────────────────────────────────────────
 * Edit RAW_CONFIG below. Everything is validated by Zod at build time; an
 * unsafe or malformed URL fails the build instead of shipping a broken link.
 *
 *  support.tipUrl         Your hosted tip page (https only), e.g. a page on a
 *                         tipping/payment provider you have set up yourself.
 *                         Leave null until you have a real link.
 *  support.providerLabel  The provider's name shown next to the button.
 *  support.amountLinks    Optional fixed-amount links. Only add them if the
 *                         provider gives you a distinct, working URL for each
 *                         amount. Never guess URL parameters.
 *  support.contactUrl     Optional https:// or mailto: contact for questions.
 *  repository.url         https://github.com/<owner>/<repo> once the code is
 *                         pushed. Enables "Edit this entry" and GitHub issue
 *                         links (corrections go to contact.email until then).
 *  newsletter.url         Your hosted newsletter signup page (https only), e.g.
 *                         https://buttondown.com/<username>. Null shows an
 *                         honest "coming soon" state. The site never collects
 *                         email addresses itself.
 *  homepageSponsor       Null until an actual sponsor is agreed. Configure one
 *                        factual message, a local raster logo in /images/sponsors/,
 *                        and a query-free https destination. No embeds or trackers.
 *  contact.email          Public contact address (corrections, questions).
 *  socials                Official USASI profiles, shown as plain outbound
 *                         links (no embeds, widgets, or tracking scripts).
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Client-safe: plain data plus validation.
 */
import { z } from "zod";

const RAW_CONFIG = {
  name: "United States of America Superintelligence",
  shortName: "USASI",
  tagline: "American Super Intelligence, infrastructure, and innovation.",
  domain: "unitedstatesofamericasuperintelligence.com",
  disclaimer: "Independent project. Not a United States government website.",
  support: {
    enabled: true,
    heading: "Support Us",
    subheading: "Help keep USASI useful.",
    body: "Find the catalog useful? Leave an optional tip to support its upkeep. Tips never affect listings, coverage, or openness assessments.",
    tipUrl: "https://buymeacoffee.com/usasi" as string | null,
    providerLabel: "Buy Me a Coffee" as string | null,
    amountLinks: [] as Array<{ label: string; url: string }>,
    contactUrl: "mailto:usasihq@gmail.com" as string | null,
  },
  newsletter: {
    enabled: true,
    heading: "The USASI weekly",
    description: "New catalog entries, releases, license changes, and corrections, once a week.",
    provider: "Buttondown" as string | null,
    url: null as string | null,
  },
  homepageSponsor: null as HomepageSponsorConfig | null,
  contact: {
    email: "usasihq@gmail.com" as string | null,
  },
  socials: [
    { label: "GitHub", handle: "usasihq", url: "https://github.com/usasihq" },
    { label: "Hugging Face", handle: "usasihq", url: "https://huggingface.co/usasihq" },
    { label: "X", handle: "@usasihq", url: "https://x.com/usasihq" },
    { label: "YouTube", handle: "@USASIHQ", url: "https://www.youtube.com/@USASIHQ" },
    { label: "Bluesky", handle: "@usasihq.bsky.social", url: "https://bsky.app/profile/usasihq.bsky.social" },
    { label: "Truth Social", handle: "@Usasihq", url: "https://truthsocial.com/@Usasihq" },
  ] as Array<{ label: string; handle: string; url: string }>,
  repository: {
    url: "https://github.com/usasihq/Website" as string | null,
    branch: "main",
  },
};

/* ------------------------------------------------------------------ */

function safeHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.includes(".") && !url.username && !url.password;
  } catch {
    return false;
  }
}

function safeContactUrl(value: string): boolean {
  if (value.startsWith("mailto:")) return /^mailto:[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(value);
  return safeHttpsUrl(value);
}

const HttpsLink = z.string().trim().refine(safeHttpsUrl, "Must be an absolute https:// URL");

export const SupportConfigSchema = z
  .object({
    enabled: z.boolean(),
    heading: z.string().min(1),
    subheading: z.string().min(1),
    body: z.string().min(1),
    tipUrl: HttpsLink.nullable(),
    providerLabel: z.string().trim().min(1).max(60).nullable(),
    amountLinks: z
      .array(
        z
          .object({
            label: z.string().trim().min(1).max(24),
            url: HttpsLink,
          })
          .strict(),
      )
      .max(6),
    contactUrl: z.string().trim().refine(safeContactUrl, "Must be https:// or mailto:").nullable(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.amountLinks.length > 0 && !value.tipUrl) {
      ctx.addIssue({
        code: "custom",
        message: "amountLinks require a general tipUrl as well",
        path: ["amountLinks"],
      });
    }
  });

export type SupportConfig = z.infer<typeof SupportConfigSchema>;

const RepositoryConfigSchema = z
  .object({
    url: z
      .string()
      .trim()
      .regex(/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, "Must be https://github.com/<owner>/<repo>")
      .nullable(),
    branch: z.string().regex(/^[A-Za-z0-9._/-]+$/),
  })
  .strict();

export type RepositoryConfig = z.infer<typeof RepositoryConfigSchema>;

const NewsletterSchema = z
  .object({
    enabled: z.boolean(),
    heading: z.string().min(1),
    description: z.string().min(1),
    provider: z.string().trim().min(1).max(40).nullable(),
    url: HttpsLink.nullable(),
  })
  .strict();
export type NewsletterConfig = z.infer<typeof NewsletterSchema>;

/** One owner-reviewed advertisement. Null means no markup or reserved space. */
export const HomepageSponsorSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(220),
  url: HttpsLink.refine((value) => safeHttpsUrl(value) && !new URL(value).search, "Sponsor links must not contain query parameters or tracking identifiers"),
  linkLabel: z.string().trim().min(1).max(60),
  logo: z.string().regex(/^\/images\/sponsors\/[A-Za-z0-9][A-Za-z0-9_-]*\.(png|jpe?g|webp|avif)$/, "Use a local raster logo in /images/sponsors/"),
}).strict();
export type HomepageSponsorConfig = z.infer<typeof HomepageSponsorSchema>;

const ContactSchema = z
  .object({
    email: z
      .string()
      .trim()
      .regex(/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/, "Must be an email address")
      .nullable(),
  })
  .strict();

const SocialSchema = z
  .object({
    label: z.string().trim().min(1).max(30),
    handle: z.string().trim().min(1).max(60),
    url: HttpsLink,
  })
  .strict();

const SiteConfigSchema = z
  .object({
    name: z.string(),
    shortName: z.string(),
    tagline: z.string(),
    domain: z.string(),
    disclaimer: z.string(),
    support: SupportConfigSchema,
    newsletter: NewsletterSchema,
    homepageSponsor: HomepageSponsorSchema.nullable(),
    contact: ContactSchema,
    socials: z.array(SocialSchema).max(10),
    repository: RepositoryConfigSchema,
  })
  .strict();

export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type Social = z.infer<typeof SocialSchema>;

export function mailtoHref(email: string, subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const query = params.toString().replace(/\+/g, "%20");
  return `mailto:${email}${query ? `?${query}` : ""}`;
}

export function parseSupportConfig(input: unknown): SupportConfig {
  return SupportConfigSchema.parse(input);
}

/** Support state used by the UI. `active` is true only with a real, validated tip URL. */
export function supportState(config: SupportConfig) {
  return {
    active: config.enabled && config.tipUrl !== null,
    amountLinks: config.tipUrl ? config.amountLinks : [],
  };
}

export const siteConfig: SiteConfig = SiteConfigSchema.parse(RAW_CONFIG);

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? `https://${siteConfig.domain}`).replace(/\/+$/, "");
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
