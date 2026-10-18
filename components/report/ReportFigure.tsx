import Link from "@/components/Link";
import { percent, type ReportRow, type ReportTable } from "@/lib/report";
import type { ReportHref } from "@/lib/report-editions";

const nf = (v: number) => v.toLocaleString("en-US");
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * One figure of an edition: title, plain caption, the table (the source of
 * truth, with a decorative bar in each row that screen readers skip), and how
 * the figure is counted. Time series also get a column chart (aria-hidden),
 * drawn in HTML so its text stays legible at any width.
 */
export function ReportFigure({ table, hrefFor, wide = false }: { table: ReportTable; hrefFor: ReportHref; wide?: boolean }) {
  const titleId = `fig-${table.id}-title`;
  const limited = table.show !== null && table.rows.length > table.show + 2;
  const shown = limited ? table.rows.slice(0, table.show!) : table.rows;
  return (
    <section id={`fig-${table.id}`} aria-labelledby={titleId} className={`grid min-w-0 content-start gap-3 scroll-mt-24 ${wide ? "lg:col-span-2" : ""}`} data-report-table={table.id}>
      <div>
        <h3 id={titleId} className="text-lg font-semibold text-text">
          {table.title}
        </h3>
        <p className="mt-1 text-[0.9375rem] text-muted">{table.caption}</p>
      </div>
      {table.series ? (
        // A time series: the columns and the counting note beside the table on wide screens.
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-10">
          <div className="grid gap-3">
            <ColumnChart table={table} />
            <Counted table={table} />
          </div>
          <RowsTable table={table} rows={table.rows} hrefFor={hrefFor} label={table.title} />
        </div>
      ) : (
        <RowsTable table={table} rows={shown} hrefFor={hrefFor} label={limited ? `${table.title}: the ${shown.length} largest counts` : table.title} />
      )}
      {limited && !table.series ? (
        <details className="group">
          <summary className="cursor-pointer text-[0.9375rem] text-ice hover:text-strong">
            Show all {nf(table.rows.length)} rows
          </summary>
          <div className="mt-3">
            <RowsTable table={table} rows={table.rows} hrefFor={hrefFor} label={`${table.title}: all rows`} />
          </div>
        </details>
      ) : null}
      {table.series ? null : <Counted table={table} />}
    </section>
  );
}

function Counted({ table }: { table: ReportTable }) {
  return (
    <p className="text-sm text-muted" data-counted>
      <strong className="font-semibold text-ice">How this is counted.</strong> {table.counted}
    </p>
  );
}

function RowsTable({ table, rows, hrefFor, label }: { table: ReportTable; rows: ReportRow[]; hrefFor: ReportHref; label: string }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col" className="num">
              <span aria-hidden="true">{capitalize(table.unit.split(" ").at(-1)!)}</span>
              <span className="sr-only">{capitalize(table.unit)}</span>
            </th>
            <th scope="col" className="num">
              Share
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const href = hrefFor(table.link, r.key);
            const share = table.universe ? (100 * r.count) / table.universe : 0;
            return (
              <tr key={r.key} data-row={r.key}>
                <th scope="row" className="w-full font-normal text-text">
                  {href ? (
                    <Link prefetch={false} href={href} className="link">
                      {r.label}
                    </Link>
                  ) : (
                    r.label
                  )}
                  <span aria-hidden="true" className="mt-1.5 block h-1.5 w-full rounded-r-[3px] bg-cyan/10">
                    <span
                      className="block h-full rounded-r-[3px] bg-cyan"
                      style={{ width: `${r.count > 0 ? Math.max(share, 0.8).toFixed(2) : 0}%` }}
                    />
                  </span>
                </th>
                <td className="num whitespace-nowrap">{nf(r.count)}</td>
                <td className="num whitespace-nowrap text-muted">{percent(r.count, table.universe)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="font-semibold text-text">
              {table.overlapping ? "Records counted (rows overlap)" : "Total"}
            </th>
            <td className="num font-semibold">{nf(table.universe)}</td>
            <td className="num text-muted">{table.overlapping ? "" : "100%"}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/** Columns for the dated rows of a time series; the table beside it carries every value. */
function ColumnChart({ table }: { table: ReportTable }) {
  const rows = table.rows.filter((r) => /^\d{4}-Q[1-4]$/.test(r.key));
  if (rows.length < 2) return null;
  const max = Math.max(...rows.map((r) => r.count), 1);
  const step = max <= 5 ? 1 : max <= 10 ? 2 : max <= 25 ? 5 : max <= 50 ? 10 : Math.ceil(max / 50) * 10;
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const years = [...new Set(rows.map((r) => r.key.slice(0, 4)))];
  return (
    <div aria-hidden="true" className="rounded-[0.875rem] border border-line bg-surface/70 px-3 pb-3 pt-5 sm:px-4 sm:pb-4" data-chart={table.id}>
      <div className="flex gap-2">
        <div className="relative h-40 w-6 flex-none text-right font-mono text-[0.6875rem] text-muted">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 translate-y-1/2 leading-none" style={{ bottom: `${(100 * t) / top}%` }}>
              {t}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-40">
            {ticks.map((t) => (
              <span key={t} className="absolute inset-x-0 border-t border-line" style={{ bottom: `${(100 * t) / top}%` }} />
            ))}
            <div className="absolute inset-0 flex items-end gap-[2px]">
              {rows.map((r) => (
                <div key={r.key} className="flex h-full min-w-0 flex-1 items-end justify-center">
                  <span className="block w-full max-w-6 rounded-t-[4px] bg-cyan" style={{ height: `${(100 * r.count) / top}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-1.5 flex gap-[2px] font-mono text-[0.6875rem] text-muted">
            {years.map((y) => {
              const n = rows.filter((r) => r.key.startsWith(y)).length;
              return (
                <span key={y} className="min-w-0 overflow-hidden border-l border-line pl-1" style={{ flex: `${n} ${n} 0%` }}>
                  {n >= 2 ? y : y.slice(2)}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
