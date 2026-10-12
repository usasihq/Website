import Link from "next/link";
import type { StateGroup } from "@/lib/place-index";
import { stateSlug, US_STATES } from "@/lib/places";

/**
 * A tile-grid map of the states (one equal square each, arranged roughly by
 * geography), so small states stay as visible as large ones. Shading shows how
 * many catalog organizations name the state in their documented headquarters.
 */
export const TILE_POSITIONS: Record<string, [col: number, row: number]> = {
  AK: [0, 0], ME: [11, 0],
  WI: [6, 1], VT: [10, 1], NH: [11, 1],
  WA: [1, 2], ID: [2, 2], MT: [3, 2], ND: [4, 2], MN: [5, 2], IL: [6, 2], MI: [7, 2], NY: [9, 2], MA: [10, 2],
  OR: [1, 3], NV: [2, 3], WY: [3, 3], SD: [4, 3], IA: [5, 3], IN: [6, 3], OH: [7, 3], PA: [8, 3], NJ: [9, 3], CT: [10, 3], RI: [11, 3],
  CA: [1, 4], UT: [2, 4], CO: [3, 4], NE: [4, 4], MO: [5, 4], KY: [6, 4], WV: [7, 4], VA: [8, 4], MD: [9, 4], DE: [10, 4],
  AZ: [2, 5], NM: [3, 5], KS: [4, 5], AR: [5, 5], TN: [6, 5], NC: [7, 5], SC: [8, 5], DC: [9, 5],
  OK: [4, 6], LA: [5, 6], MS: [6, 6], AL: [7, 6], GA: [8, 6],
  HI: [1, 7], TX: [4, 7], FL: [9, 7],
};

export const TILE_BUCKETS: { min: number; label: string; className: string }[] = [
  { min: 25, label: "25 or more", className: "border-[#9be3ff] bg-[rgba(120,214,255,0.88)] text-[#04101f]" },
  { min: 10, label: "10 to 24", className: "border-cyan bg-[rgba(76,201,255,0.55)] text-white" },
  { min: 5, label: "5 to 9", className: "border-cyan bg-[rgba(76,201,255,0.36)] text-text" },
  { min: 2, label: "2 to 4", className: "border-[rgba(76,201,255,0.6)] bg-[rgba(76,201,255,0.2)] text-text" },
  { min: 1, label: "1", className: "border-[rgba(76,201,255,0.45)] bg-[rgba(76,201,255,0.09)] text-text" },
];

const bucketFor = (n: number) => TILE_BUCKETS.find((b) => n >= b.min);

export function StateTileMap({ states }: { states: StateGroup[] }) {
  const counts = new Map(states.map((s) => [s.code, s.organizations.length]));
  return (
    <figure className="grid gap-4" data-testid="state-tile-map">
      <nav aria-label="Map of headquarters states">
        <ul className="grid aspect-[12/8] w-full max-w-3xl grid-cols-12 grid-rows-8 gap-[3px] sm:gap-1.5">
          {Object.entries(TILE_POSITIONS).map(([code, [col, row]]) => {
            const n = counts.get(code) ?? 0;
            const bucket = bucketFor(n);
            const style = { gridColumn: col + 1, gridRow: row + 1 };
            const tile = "flex h-full w-full flex-col items-center justify-center rounded-[3px] border font-mono leading-none sm:rounded-md";
            return (
              <li key={code} style={style} className="min-h-0 min-w-0">
                {bucket ? (
                  <Link
                    prefetch={false}
                    href={`/places/${stateSlug(code)}/`}
                    aria-label={`${US_STATES[code]}: ${n} ${n === 1 ? "organization" : "organizations"}`}
                    title={`${US_STATES[code]}: ${n}`}
                    className={`${tile} ${bucket.className} transition-transform hover:z-10 hover:scale-110 focus-visible:z-10`}
                  >
                    <span className="text-[0.6875rem] font-semibold sm:text-xs">{code}</span>
                    <span className="mt-0.5 hidden text-[0.625rem] sm:block">{n}</span>
                  </Link>
                ) : (
                  <span aria-hidden="true" title={`${US_STATES[code]}: none in the catalog`} className={`${tile} border-line text-[0.6875rem] text-muted sm:text-xs`}>
                    {code}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
        <span>Organizations headquartered there:</span>
        {[...TILE_BUCKETS].reverse().map((b) => (
          <span key={b.label} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className={`inline-block h-3.5 w-3.5 rounded-[3px] border ${b.className}`} />
            {b.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block h-3.5 w-3.5 rounded-[3px] border border-line" />
          none
        </span>
      </figcaption>
    </figure>
  );
}
