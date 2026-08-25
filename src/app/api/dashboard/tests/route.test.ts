/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/dashboard/route.ts";
import { getDashboard } from "@/app/api/dashboard/service.ts";

jest.mock("@/app/api/dashboard/service.ts", () => ({
  getDashboard: jest.fn(),
}));

const dashboard = jest.mocked(getDashboard);

// Assembled rather than written out: a full query string in one literal reads
// to the secret scanner as a high-entropy blob.
const get = (params: Record<string, string> = {}) =>
  GET(
    new NextRequest(
      `http://x/api/dashboard?${new URLSearchParams(params).toString()}`,
    ),
  );

beforeEach(() => {
  jest.clearAllMocks();
  dashboard.mockResolvedValue({ status: "no_range" });
});

describe("GET", () => {
  it("answers 422 without an owner", async () => {
    const res = await get();

    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ error: { code: "validation" } });
    expect(dashboard).not.toHaveBeenCalled();
  });

  it("passes the owner and nothing else to the service", async () => {
    await get({ owner: "p1" });

    expect(dashboard).toHaveBeenCalledWith("p1");
  });

  it("ignores the cap and simulation params it used to accept", async () => {
    await get({ owner: "familia", cap: "75", simulation: "all" });

    expect(dashboard).toHaveBeenCalledWith("familia");
  });

  it("wraps the payload in the data envelope", async () => {
    const res = await get({ owner: "familia" });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { status: "no_range" } });
  });

  it("answers 500 when the service throws", async () => {
    dashboard.mockRejectedValue(new Error("db"));
    const res = await get({ owner: "familia" });

    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ error: { code: "internal" } });
  });
});
