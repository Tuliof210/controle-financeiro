/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { GET } from "@/app/api/health/route.ts";

describe("GET", () => {
  it("answers the health payload in the data envelope", async () => {
    const res = GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { status: "ok" } });
  });
});
