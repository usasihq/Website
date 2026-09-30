/**
 * npm run validate
 *
 * Validates every YAML record under /content (schemas, unique slugs and IDs,
 * relationships, source references, eligibility/publication consistency,
 * dates, family/release structure, and public placeholders).
 *
 * Exit code 1 on any error. Warnings are printed but do not fail.
 * Pass --strict to fail on warnings too. Pass a directory to validate another
 * content root (used for fixtures).
 */
import path from "node:path";
import { readRawContent, todayIso } from "../lib/content-loader";
import { validateContent } from "../lib/validate";

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const quiet = args.includes("--quiet");
const dirArg = args.find((a) => !a.startsWith("--"));
const root = dirArg ? path.resolve(dirArg) : path.join(process.cwd(), "content");

const result = validateContent(readRawContent(root), { today: todayIso() });
const errors = result.issues.filter((i) => i.level === "error");
const warnings = result.issues.filter((i) => i.level === "warning");

for (const issue of [...errors, ...(quiet ? [] : warnings)]) {
  const where = issue.path ? `${issue.file} › ${issue.path}` : issue.file;
  console.log(`${issue.level === "error" ? "ERROR  " : "warning"} ${where}\n        ${issue.message}`);
}

const count = (status: string, list: Array<{ publication_status: string }>) =>
  list.filter((r) => r.publication_status === status).length;

console.log(
  `\nContent root: ${path.relative(process.cwd(), root) || "."}\n` +
    `Organizations: ${result.organizations.length} (published ${count("published", result.organizations)}, draft ${count("draft", result.organizations)}, archived ${count("archived", result.organizations)})\n` +
    `Artifacts:     ${result.artifacts.length} (published ${count("published", result.artifacts)}, draft ${count("draft", result.artifacts)}, archived ${count("archived", result.artifacts)})\n` +
    `Changelog entries: ${result.changelog.length}\n` +
    `${errors.length} error(s), ${warnings.length} warning(s)`,
);

if (errors.length > 0 || (strict && warnings.length > 0)) process.exit(1);
