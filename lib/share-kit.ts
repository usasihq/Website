/**
 * Ready-to-post text for USASI's social accounts after an issue goes out,
 * built from the issue file so posts say only what the issue says. The owner
 * posts them; nothing here posts anything.
 */
import { inlinePlain } from "./inline-text";
import type { NewsletterIssue } from "./schema";

export const POST_LIMITS = { x: 280, bluesky: 300, truthSocial: 500, linkedin: 3000 } as const;
/** X counts every link as 23 characters. */
const X_LINK_LENGTH = 23;

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/** A short label for an item: its bold lead, else its link labels, else its first sentence. */
function highlight(item: string): string {
  const bold = item.match(/^\*\*([^*]+)\*\*/);
  if (bold) return inlinePlain(bold[1]).replace(/[.:]$/, "");
  const labels = [...item.matchAll(/\[([^\]]+)\]\(/g)].map((m) => m[1]);
  if (labels.length) return labels[0].length > 25 ? labels[0] : labels.slice(0, 3).join(", ");
  return clip(inlinePlain(item).split(/(?<=\.)\s/)[0].replace(/\.$/, ""), 80);
}

export function shareKit(issue: NewsletterIssue, url: string): { x: string; bluesky: string; truthSocial: string; linkedin: string } {
  const heads = issue.sections.flatMap((s) => s.items.slice(0, 1).map(highlight)).slice(0, 3);
  const lead = `The USASI weekly, issue ${issue.number}: ${issue.subject.replace(/^Issue \d+:\s*/, "")}.`;
  const tail = "Every item links to its sources.";
  const xBudget = POST_LIMITS.x - X_LINK_LENGTH - 2;
  const x = `${clip(`${lead} ${tail}`, xBudget)}\n\n${url}`;
  const bluesky = clip(`${lead} ${tail}`, POST_LIMITS.bluesky - url.length - 2) + `\n\n${url}`;
  const truthSocial = clip(`${lead}\n\n${heads.map((h) => `• ${h}`).join("\n")}\n\n${tail}`, POST_LIMITS.truthSocial - url.length - 2) + `\n\n${url}`;
  const linkedin = [
    lead,
    "",
    ...issue.sections.filter((s) => s.items.length).map((s) => `• ${s.heading}: ${s.items.map(highlight).slice(0, 4).join("; ")}`),
    "",
    "USASI is an independent, sourced catalog of U.S. AI organizations and U.S.-led open models and tools. Nothing in the issue is new: each item links to a page that cites its sources.",
    "",
    url,
  ].join("\n");
  return { x, bluesky, truthSocial, linkedin };
}
