import { describe, expect, it } from "vitest";
import { FeedError, readJsonBody } from "@/lib/jobs/security";

const res = (type: string) => new Response('{"ok":true}', { status: 200, headers: { "content-type": type } });

describe("readJsonBody content types", () => {
  it("accepts JSON and JSON-suffixed types such as USAJOBS's application/hr+json", async () => {
    for (const t of ["application/json", "application/json; charset=utf-8", "application/json;charset=UTF-8", "application/hr+json; charset=utf-8"]) {
      await expect(readJsonBody(res(t))).resolves.toEqual({ ok: true });
    }
  });
  it("rejects non-JSON types", async () => {
    for (const t of ["text/html", "text/plain; application/json", "application/javascript", ""]) {
      await expect(readJsonBody(res(t))).rejects.toBeInstanceOf(FeedError);
    }
  });
});
