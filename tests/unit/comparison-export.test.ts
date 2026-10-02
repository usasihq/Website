import { describe, expect, it } from "vitest";
import { comparisonExport, toCsv } from "@/components/ModelComparison";
import { MODEL_COLUMNS, type ModelMatrixRow } from "@/lib/matrix";

const cell = (count: number) => ({ count, href: "/open/", slugs: [] });
const row = (slug: string, name: string): ModelMatrixRow =>
  ({ org: { slug, name } as ModelMatrixRow["org"], hosted: cell(1), cells: Object.fromEntries(MODEL_COLUMNS.map((c, i) => [c.key, cell(i)])) }) as ModelMatrixRow;

describe("comparison export", () => {
  const columns = MODEL_COLUMNS.slice(0, 2);
  const data = comparisonExport([row("acme", 'Acme, "Labs"')], columns, "2026-10-01T00:00:00.000Z");
  it("matches the visible columns and keeps the caveat, snapshot, and record links", () => {
    expect(data.fields.map((f) => f.key)).toEqual(["slug", "name", "record_page", "hosted_model_products", ...columns.map((c) => c.key)]);
    expect(data.caveat).toMatch(/not capability/);
    expect(data.snapshot).toBe("2026-10-01T00:00:00.000Z");
    expect(data.rows[0].record_page).toMatch(/\/companies\/acme\/$/);
  });
  it("escapes CSV values", () => {
    const csv = toCsv(data);
    expect(csv.split("\n")[0]).toBe(["slug", "name", "record_page", "hosted_model_products", ...columns.map((c) => c.key)].join(","));
    expect(csv).toContain('"Acme, ""Labs"""');
  });
});
