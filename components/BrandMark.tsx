/** Small decorative mark echoing the artwork's arcs. Purely presentational. */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="12" fill="#0b1224" stroke="rgba(120,180,255,0.3)" />
      <path d="M6 44 C 20 22, 44 14, 60 16" fill="none" stroke="#4cc9ff" strokeWidth="3" strokeLinecap="round" />
      <path d="M10 52 C 26 40, 42 38, 56 42" fill="none" stroke="#2f6bff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <path d="M18 56 C 30 30, 40 28, 50 30" fill="none" stroke="#ff4d6d" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
      <circle cx="44" cy="17.5" r="4" fill="#e8eefc" />
    </svg>
  );
}
