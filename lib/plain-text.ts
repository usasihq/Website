/** Text with `code` backticks removed, for meta tags, feeds and search. */
export function plainText(text: string): string {
  return text.replace(/`([^`\n]+)`/g, "$1");
}
