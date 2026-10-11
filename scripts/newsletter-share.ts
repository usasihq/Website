/**
 * Writes ready-to-post social text for a sent issue to
 * reports/automation/newsletter/<slug>.share.md. Posting is done by the owner.
 *
 * Usage: npx tsx scripts/newsletter-share.ts <issue-slug>
 */
import fs from "node:fs";
import path from "node:path";
import { readRawContent } from "../lib/content-loader";
import { absoluteUrl } from "../lib/paths";
import { POST_LIMITS, shareKit } from "../lib/share-kit";
import { validateContent } from "../lib/validate";

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: npx tsx scripts/newsletter-share.ts <issue-slug>");
  process.exit(2);
}
const issue = validateContent(readRawContent(), { today: new Date().toISOString().slice(0, 10) }).newsletter.find((n) => n.slug === slug);
if (!issue) {
  console.error(`No issue "${slug}" in content/newsletter/.`);
  process.exit(1);
}
const kit = shareKit(issue, absoluteUrl(`/newsletter/${issue.slug}/`));
const section = (name: string, text: string, limit: number) => `## ${name} (${[...text].length}/${limit} characters)\n\n\`\`\`text\n${text}\n\`\`\`\n`;
const md = [
  `# Share kit: ${issue.subject}`,
  "",
  "Post from the USASI accounts after the issue is sent. Each post links to the issue's page on this site, which shows its own preview card.",
  "",
  section("X (@usasihq)", kit.x, POST_LIMITS.x),
  section("Bluesky (@usasihq.bsky.social)", kit.bluesky, POST_LIMITS.bluesky),
  section("Truth Social (@Usasihq)", kit.truthSocial, POST_LIMITS.truthSocial),
  section("LinkedIn", kit.linkedin, POST_LIMITS.linkedin),
].join("\n");
const out = path.join("reports", "automation", "newsletter", `${slug}.share.md`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, md);
console.log(md);
