import Link from "next/link";
import type { CoverageRow } from "@/lib/matrix";

export function CoverageTable({ rows, caption }: { rows: CoverageRow[]; caption: string }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Record type</th>
            <th scope="col" className="num">
              Count
            </th>
            <th scope="col" className="hidden sm:table-cell">
              What is counted
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} data-coverage={row.key}>
              <th scope="row" className="font-medium text-text">
                {row.label}
                <span className="mt-0.5 block text-sm font-normal text-muted sm:hidden">{row.note}</span>
              </th>
              <td className="num">
                <Link prefetch={false} href={row.cell.href} className="link inline-flex min-h-8 min-w-8 items-center justify-end" aria-label={`${row.cell.count} ${row.label.toLowerCase()} — view these records`}>
                  {row.cell.count}
                </Link>
              </td>
              <td className="hidden text-sm text-muted sm:table-cell">{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
