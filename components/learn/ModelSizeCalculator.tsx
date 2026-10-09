"use client";

import { useId, useState } from "react";

const PRECISIONS = [
  { bits: 32, label: "32-bit", note: "full precision floating point" },
  { bits: 16, label: "16-bit", note: "half precision, such as FP16 or BF16" },
  { bits: 8, label: "8-bit", note: "such as INT8 or FP8" },
  { bits: 4, label: "4-bit", note: "common for local use" },
];

const EXAMPLE_SIZES = [1, 8, 20, 70, 405];

/** Weight storage in bytes for a parameter count and a precision in bits per weight. */
export function weightBytes(parameters: number, bitsPerWeight: number): number {
  return (parameters * bitsPerWeight) / 8;
}

const fmt = (n: number) => (n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2));

/**
 * Arithmetic only: parameters × bits per weight ÷ 8 = bytes of weights.
 * It is not a hardware requirement; running a model needs more memory.
 */
export function ModelSizeCalculator() {
  const [billions, setBillions] = useState("8");
  const [bits, setBits] = useState(16);
  const [customBits, setCustomBits] = useState("");
  const paramsId = useId();
  const bitsId = useId();

  const params = Number(billions) * 1e9;
  const effectiveBits = customBits !== "" ? Number(customBits) : bits;
  const valid = Number.isFinite(params) && params > 0 && params <= 1e13 && Number.isFinite(effectiveBits) && effectiveBits > 0 && effectiveBits <= 64;
  const bytes = valid ? weightBytes(params, effectiveBits) : 0;

  return (
    <div className="card p-5 sm:p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor={paramsId} className="block text-sm font-semibold text-text">
            Parameters, in billions
          </label>
          <input
            id={paramsId}
            inputMode="decimal"
            className="field mt-2"
            value={billions}
            onChange={(e) => setBillions(e.target.value.replace(/[^0-9.]/g, ""))}
            aria-describedby={`${paramsId}-hint`}
          />
          <p id={`${paramsId}-hint`} className="mt-2 text-sm text-muted">
            The total parameter count from the model card, for example 8 for an 8B model.
          </p>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Example sizes">
            {EXAMPLE_SIZES.map((n) => (
              <button key={n} type="button" className={`badge px-3 py-1 ${billions === String(n) ? "border-cyan text-white" : "hover:border-cyan"}`} onClick={() => setBillions(String(n))}>
                {n}B
              </button>
            ))}
          </div>
        </div>
        <fieldset>
          <legend className="text-sm font-semibold text-text">Precision (bits per weight)</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {PRECISIONS.map((p) => (
              <button
                key={p.bits}
                type="button"
                aria-pressed={customBits === "" && bits === p.bits}
                onClick={() => {
                  setBits(p.bits);
                  setCustomBits("");
                }}
                className={`rounded-lg border px-3 py-2 text-left ${customBits === "" && bits === p.bits ? "border-cyan bg-cyan/10" : "border-line-strong hover:border-cyan"}`}
              >
                <span className="block font-semibold text-text">{p.label}</span>
                <span className="block text-xs text-muted">{p.note}</span>
              </button>
            ))}
          </div>
          <label htmlFor={bitsId} className="mt-3 block text-sm text-muted">
            Or enter bits per weight
          </label>
          <input id={bitsId} inputMode="decimal" className="field mt-1" placeholder="for example 4.5" value={customBits} onChange={(e) => setCustomBits(e.target.value.replace(/[^0-9.]/g, ""))} />
        </fieldset>
      </div>

      <div className="mt-6 rounded-xl border border-cyan/30 bg-[linear-gradient(135deg,rgba(76,201,255,0.08),rgba(11,22,44,0.72))] p-5" aria-live="polite">
        {valid ? (
          <>
            <p className="text-sm text-muted">
              Weights alone, at {effectiveBits} bits per weight for {Number(billions).toLocaleString("en-US")} billion parameters:
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold text-text tabular-nums">
              {fmt(bytes / 1e9)} GB <span className="text-lg text-muted">({fmt(bytes / 2 ** 30)} GiB)</span>
            </p>
          </>
        ) : (
          <p className="text-muted">Enter a parameter count above 0 and a precision between 1 and 64 bits.</p>
        )}
      </div>

      {valid ? (
        <div className="table-scroll mt-6">
          <table className="data-table">
            <caption className="sr-only">Weight storage for the same parameter count at common precisions</caption>
            <thead>
              <tr>
                <th scope="col">Precision</th>
                <th scope="col" className="num">
                  GB
                </th>
                <th scope="col" className="num">
                  GiB
                </th>
              </tr>
            </thead>
            <tbody>
              {PRECISIONS.map((p) => {
                const b = weightBytes(params, p.bits);
                return (
                  <tr key={p.bits}>
                    <th scope="row" className="font-medium">
                      {p.label}
                    </th>
                    <td className="num">{fmt(b / 1e9)}</td>
                    <td className="num">{fmt(b / 2 ** 30)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
