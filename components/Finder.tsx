"use client";

import Link from "next/link";
import { useState } from "react";
import { CircleAlert, CircleCheck, CircleX, Cpu, Globe, Link2, Monitor } from "lucide-react";
import { ExternalLink } from "@/components/ExternalLink";
import { useQueryState } from "@/components/useQueryState";
import { DEFAULT_INPUT, findConfigs, parseInput, serializeInput, TASK_LABELS, type Assessment, type FinderInput } from "@/lib/finder";
import type { FinderConfig, FinderTask } from "@/lib/schema";

const RUNS_LABEL = { local: "On your computer", hosted: "Hosted service", hybrid: "Local app, hosted model" } as const;
const RUNS_ICON = { local: Monitor, hosted: Globe, hybrid: Cpu } as const;
const SKILL_LABEL = { beginner: "Installer app", intermediate: "Command line or extension", advanced: "Developer setup" } as const;
const COST_LABEL = {
  "free-download": "Free to download",
  "free-tier-with-limits": "Free tier with limits",
  subscription: "Subscription",
  "usage-billed": "Billed by usage",
  mixed: "Depends on use",
} as const;

function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-text">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value || "any"}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-lg border px-3 py-2 text-sm transition-colors ${value === o.value ? "border-cyan bg-cyan/10 text-white" : "border-line-strong text-text hover:border-cyan"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function NumberField({ label, value, onChange, hint }: { label: string; value: number | null; onChange: (v: number | null) => void; hint: string }) {
  const [text, setText] = useState(value === null ? "" : String(value));
  return (
    <label className="block">
      <span className="text-sm font-semibold text-text">{label}</span>
      <input
        inputMode="decimal"
        className="field mt-2"
        placeholder="Not sure"
        value={text}
        onChange={(e) => {
          const t = e.target.value.replace(/[^0-9.]/g, "");
          setText(t);
          onChange(t && /^\d+(\.\d+)?$/.test(t) ? Number(t) : null);
        }}
      />
      <span className="mt-1 block text-xs text-muted">{hint}</span>
    </label>
  );
}

function Result({ a, names }: { a: Assessment; names: Record<string, string> }) {
  const c = a.config;
  const Icon = RUNS_ICON[c.runs];
  const memTone =
    a.memory.kind === "fits" || a.memory.kind === "tested"
      ? "border-cyan/40 text-text"
      : a.memory.kind === "too-small"
        ? "border-arc/50 text-text"
        : "border-line text-muted";
  return (
    <article id={c.slug} className="card scroll-mt-28 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="badge gap-1.5">
          <Icon aria-hidden="true" className="h-3.5 w-3.5 text-cyan" />
          {RUNS_LABEL[c.runs]}
        </span>
        <span className="badge">{SKILL_LABEL[c.skill]}</span>
        <span className="badge">{COST_LABEL[c.cost_basis.value]}</span>
        <span className="badge border-line text-muted">{c.tested ? `Tested by USASI ${c.tested.date}` : "Not tested by USASI"}</span>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-text">{c.title}</h3>
      <p className="mt-2 text-[0.9375rem] text-[#d5def2]">{c.summary.text}</p>
      <p className="mt-3 text-sm text-muted">
        Uses:{" "}
        {c.components.map((comp, i) => (
          <span key={comp.name}>
            {i > 0 ? ", " : ""}
            {comp.record_slug && names[comp.record_slug] ? (
              <Link prefetch={false} href={names[comp.record_slug]} className="link">
                {comp.name}
              </Link>
            ) : (
              <ExternalLink href={comp.url}>{comp.name}</ExternalLink>
            )}
          </span>
        ))}
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-ice">How it fits your answers</h4>
          <ul className="mt-2 space-y-1.5 text-sm">
            {a.reasons.map((r) => (
              <li key={r} className="flex gap-2 text-text">
                <CircleCheck aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none text-cyan" />
                <span>{r}</span>
              </li>
            ))}
            {a.blockers.map((r) => (
              <li key={r} className="flex gap-2 text-text">
                <CircleX aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none text-[#ff8fa3]" />
                <span>
                  <span className="sr-only">Does not fit: </span>
                  {r}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-ice">Check before you start</h4>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            {a.checks.map((r) => (
              <li key={r} className="flex gap-2">
                <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none text-ice" />
                <span>{r}</span>
              </li>
            ))}
            <li className="flex gap-2">
              <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none text-ice" />
              <span>{c.data_location.text}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className={`mt-5 rounded-lg border p-3 text-sm ${memTone}`}>
        <span className="font-semibold">Can I run it? </span>
        {a.memory.text}
        {c.memory && c.runs !== "hosted" ? <span className="block pt-1 text-xs text-muted">Publisher&apos;s statement: {c.memory.statement.text}</span> : null}
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-semibold text-text">Getting started, limitations, and what is not verified</summary>
        <div className="mt-3 grid gap-4 text-muted md:grid-cols-2">
          <div>
            <h5 className="font-semibold text-text">Getting started</h5>
            <ol className="mt-1 list-decimal space-y-1 pl-5">
              {c.getting_started.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
          <div>
            <h5 className="font-semibold text-text">Limitations</h5>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {c.limitations.map((l) => (
                <li key={l.text}>{l.text}</li>
              ))}
            </ul>
            <h5 className="mt-3 font-semibold text-text">Not verified</h5>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {c.unverified.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </div>
        </div>
        <h5 className="mt-4 font-semibold text-text">Sources (read {c.last_reviewed})</h5>
        <ul className="mt-1 space-y-1 text-muted">
          {c.sources.map((s) => (
            <li key={s.id}>
              <ExternalLink href={s.url}>{s.title}</ExternalLink> <span className="meta">· {s.publisher}</span>
            </li>
          ))}
        </ul>
      </details>
    </article>
  );
}

export function Finder({ configs, recordHrefs }: { configs: FinderConfig[]; recordHrefs: Record<string, string> }) {
  const { state, update } = useQueryState(parseInput, serializeInput);
  const set = (patch: Partial<FinderInput>) => update({ ...state, ...patch }, "replace");
  const results = findConfigs(configs, state);
  const matches = results.filter((r) => r.fit === "match");
  const close = results.filter((r) => r.fit === "close");
  const rest = results.filter((r) => r.fit === "no");
  const [copied, setCopied] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const counts = (Object.keys(TASK_LABELS) as FinderTask[]).map((t) => [t, configs.filter((c) => c.tasks.includes(t)).length] as const);

  return (
    <div className="grid gap-10 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <form className="card h-fit space-y-6 p-5 lg:sticky lg:top-28" onSubmit={(e) => e.preventDefault()} aria-label="Your needs">
        <Choice
          label="I want to"
          value={state.task}
          options={counts.map(([t, n]) => ({ value: t, label: `${TASK_LABELS[t]} (${n})` }))}
          onChange={(task) => set({ task })}
        />
        <Choice
          label="Where it runs"
          value={state.where}
          options={[
            { value: "either", label: "Either" },
            { value: "local", label: "On my computer" },
            { value: "hosted", label: "Hosted online" },
          ]}
          onChange={(where) => set({ where })}
        />
        <Choice
          label="My computer"
          value={state.os}
          options={[
            { value: "", label: "Any" },
            { value: "windows", label: "Windows" },
            { value: "macos", label: "macOS" },
            { value: "linux", label: "Linux" },
          ]}
          onChange={(os) => set({ os })}
        />
        <Choice
          label="Graphics"
          value={state.gpu}
          options={[
            { value: "", label: "Not sure" },
            { value: "nvidia", label: "NVIDIA" },
            { value: "amd", label: "AMD" },
            { value: "apple-silicon", label: "Apple silicon" },
            { value: "intel", label: "Intel" },
            { value: "none", label: "No graphics card" },
          ]}
          onChange={(gpu) => set({ gpu })}
        />
        <div key={resetKey} className="grid grid-cols-2 gap-3">
          <NumberField label="Graphics memory (GB)" value={state.gpuGb} onChange={(gpuGb) => set({ gpuGb })} hint="Also called VRAM" />
          <NumberField label="System memory (GB)" value={state.ramGb} onChange={(ramGb) => set({ ramGb })} hint="RAM; on Apple silicon, unified memory" />
        </div>
        <Choice
          label="I am comfortable with"
          value={state.skill}
          options={[
            { value: "beginner", label: "Installer apps" },
            { value: "intermediate", label: "The command line" },
            { value: "advanced", label: "Writing code" },
          ]}
          onChange={(skill) => set({ skill })}
        />
        <Choice
          label="Ongoing charges"
          value={state.charges}
          options={[
            { value: "none", label: "None" },
            { value: "subscription", label: "A subscription is fine" },
            { value: "any", label: "Usage billing is fine" },
          ]}
          onChange={(charges) => set({ charges })}
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
          <input type="checkbox" className="h-4 w-4 accent-[var(--cyan)]" checked={!state.account} onChange={(e) => set({ account: !e.target.checked })} />
          I do not want to create an online account
        </label>
        <div className="flex flex-wrap gap-3 border-t border-line pt-4 text-sm">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-muted hover:text-text"
            onClick={() => {
              try {
                void navigator.clipboard.writeText(window.location.href).then(() => setCopied(true));
              } catch {
                setCopied(false);
              }
            }}
          >
            <Link2 aria-hidden="true" className="h-4 w-4" /> {copied ? "Link copied" : "Copy a link to these answers"}
          </button>
          <button type="button" className="text-muted hover:text-text" onClick={() => {
              update(DEFAULT_INPUT);
              setResetKey((k) => k + 1);
            }}>
            Start over
          </button>
        </div>
        <p className="text-xs text-muted">Your answers live only in this page&apos;s address. Nothing is saved or sent to USASI.</p>
      </form>

      <section aria-label="Results" aria-live="polite">
        {!state.task ? (
          <div className="card p-6 text-muted">
            <p className="text-lg font-semibold text-text">Start by choosing what you want to do.</p>
            <p className="mt-2">
              The finder then checks each documented configuration against your answers and explains every match. It is not a ranking: results are ordered by how
              many of your requirements they meet, and each says what remains unverified.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-semibold text-text">
                {matches.length} {matches.length === 1 ? "configuration fits" : "configurations fit"} everything you entered
              </h2>
              <div className="mt-4 space-y-5">
                {matches.length ? matches.map((a) => <Result key={a.config.slug} a={a} names={recordHrefs} />) : <p className="text-muted">None fit every answer. See the close options below.</p>}
              </div>
            </div>
            {close.length ? (
              <div>
                <h2 className="text-xl font-semibold text-text">Close: one thing would need to change ({close.length})</h2>
                <div className="mt-4 space-y-5">
                  {close.map((a) => (
                    <Result key={a.config.slug} a={a} names={recordHrefs} />
                  ))}
                </div>
              </div>
            ) : null}
            {rest.length ? (
              <details>
                <summary className="cursor-pointer text-lg font-semibold text-text">Not a fit for your answers ({rest.length})</summary>
                <div className="mt-4 space-y-5">
                  {rest.map((a) => (
                    <Result key={a.config.slug} a={a} names={recordHrefs} />
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
