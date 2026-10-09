"use client";

import { Download } from "lucide-react";
import { exportCsv, type DirectoryExport } from "@/lib/export";

function save(name: string, type: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** CSV and JSON downloads of exactly the records currently shown. Built in the browser; nothing is sent anywhere. */
export function DownloadResults({ build, filename, count }: { build: () => DirectoryExport; filename: string; count: number }) {
  if (count === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm" role="group" aria-label={`Download these ${count} results`}>
      <span className="inline-flex items-center gap-1.5 text-muted">
        <Download aria-hidden="true" className="h-4 w-4" /> Download these {count}:
      </span>
      <button type="button" className="link min-h-11" onClick={() => save(`${filename}.csv`, "text/csv", exportCsv(build()))}>
        CSV
      </button>
      <button type="button" className="link min-h-11" onClick={() => save(`${filename}.json`, "application/json", JSON.stringify(build(), null, 2) + "\n")}>
        JSON
      </button>
    </div>
  );
}
