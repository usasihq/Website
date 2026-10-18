import { Fragment } from "react";

/**
 * Plain text where `backtick spans` (as written in news summaries) render as
 * inline code instead of showing the backticks.
 */
export function CodeText({ text }: { text: string }) {
  const parts = text.split(/`([^`\n]+)`/);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="rounded bg-muted/12 px-1 font-mono text-[0.9em] [overflow-wrap:anywhere]">
            {part}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
