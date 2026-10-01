"use client";

import { Search, X } from "lucide-react";
import { useId } from "react";

export function SearchField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text">
        {label}
      </label>
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          id={id}
          type="search"
          className="field pl-9"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  allLabel = "All",
}: {
  label: string;
  value: T | "";
  options: Array<{ value: T; label: string }>;
  onChange: (value: T | "") => void;
  allLabel?: string;
}) {
  const id = useId();
  return (
    <div className="min-w-0 max-w-full">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text">
        {label}
      </label>
      <select id={id} className="field" value={value} onChange={(e) => onChange(e.target.value as T | "")}>
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[rgba(76,201,255,0.4)] bg-[rgba(76,201,255,0.08)] px-3 text-sm text-text hover:border-cyan"
      >
        {label}
        <X aria-hidden="true" className="h-3.5 w-3.5" />
        <span className="sr-only">— remove this filter</span>
      </button>
    </li>
  );
}

export function ResultSummary({
  visible,
  total,
  noun,
  announce,
  pending = false,
}: {
  visible: number;
  total: number;
  noun: [string, string];
  announce: string;
  pending?: boolean;
}) {
  return (
    <>
      <p className="meta" aria-hidden="true">
        {pending ? `Loading all ${noun[1]}…` : `Showing ${visible} of ${total} ${total === 1 ? noun[0] : noun[1]}`}
      </p>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announce}
      </p>
    </>
  );
}
