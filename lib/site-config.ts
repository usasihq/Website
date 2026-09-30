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
 *                         pushed. Enables "Edit this entry", "Report a
 *                         correction", and contribution links.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Client-safe: plain data plus validation.
 */
import { z } from "zod";

const RAW_CONFIG = {
  name: "United States of America Superintelligence",
  shortName: "USASI",
  tagline: "American AI, infrastructure, and innovation.",
  domain: "unitedstatesofamericasuperintelligence.com",
  disclaimer: "Independent project. Not a United States government website.",
  support: {
    enabled: true,
    heading: "Support Us",
    subheading: "Help keep USASI useful.",
    body: "Find the catalog useful? Leave an optional tip to support its upkeep. Tips never affect listings, coverage, or openness assessments.",
    tipUrl: null as string | null,
    providerLabel: null as string | null,
    amountLinks: [] as Array<{ label: string; url: string }>,
    contactUrl: null as string | null,
  },
  repository: {
    url: null as string | null,
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

const SiteConfigSchema = z
  .object({
    name: z.string(),
    shortName: z.string(),
    tagline: z.string(),
    domain: z.string(),
    disclaimer: z.string(),
    support: SupportConfigSchema,
    repository: RepositoryConfigSchema,
  })
  .strict();

export type SiteConfig = z.infer<typeof SiteConfigSchema>;

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
