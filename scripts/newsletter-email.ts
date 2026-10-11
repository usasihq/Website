/**
 * Writes the email HTML for a weekly issue to reports/automation/newsletter/
 * and prints its length and SHA-256, so the copy typed into the email
 * provider's HTML snippet block can be checked against it.
 *
 * Usage: npx tsx scripts/newsletter-email.ts <issue-slug>
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { readRawContent, todayIso } from "../lib/content-loader";
import { issueEmailHtml } from "../lib/newsletter-email";
import { absoluteUrl } from "../lib/paths";
import { validateContent } from "../lib/validate";

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: npx tsx scripts/newsletter-email.ts <issue-slug>");
  process.exit(2);
}
// Drafts included: an issue is a draft until it has been sent.
const validated = validateContent(readRawContent(), { today: todayIso() });
const problems = validated.issues.filter((i) => i.level === "error" && i.file.includes(`newsletter/${slug}.yml`));
for (const p of problems) console.error(`${p.file} ${p.path ?? ""}: ${p.message}`);
const issue = validated.newsletter.find((n) => n.slug === slug);
if (!issue || problems.length > 0) {
  console.error(`No valid issue "${slug}" in content/newsletter/ (run npm run validate for details).`);
  process.exit(1);
}
const html = issueEmailHtml(issue, (href) => (href.startsWith("/") ? absoluteUrl(href) : href));
const outDir = path.join("reports", "automation", "newsletter");
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${slug}.inline.html`);
fs.writeFileSync(out, html);
console.log(`${out}: ${html.length} characters, sha256 ${crypto.createHash("sha256").update(html).digest("hex")}`);
console.log(`Subject: ${issue.subject}`);
console.log(`Preview text: ${issue.preview}`);
