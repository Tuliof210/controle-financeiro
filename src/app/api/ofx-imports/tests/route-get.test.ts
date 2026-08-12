/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/ofx-imports/route.ts";
import { isOfxImported } from "@/app/api/ofx-imports/service.ts";

jest.mock("../service.ts", () => ({
  isOfxImported: jest.fn(),
  importOfx: jest.fn(),
}));

const asked = jest.mocked(isOfxImported);

const get = (query: string) =>
  GET(new NextRequest(`http://x/api/ofx-imports${query}`));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET", () => {
  it("answers 422 without a hash", async () => {
    const res = await get("");

    expect(res.status).toBe(422);
    expect(asked).not.toHaveBeenCalled();
  });

  it("reports what the service found", async () => {
    asked.mockResolvedValue({ imported: false, importedAt: null });

    expect(await (await get("?hash=abc")).json()).toEqual({
      data: { imported: false, importedAt: null },
    });
  });

  it("answers 500 when the service throws", async () => {
    asked.mockRejectedValue(new Error("db"));
    const res = await get("?hash=abc");

    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ error: { code: "internal" } });
  });
});
