/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { NextRequest } from "next/server";
import { DELETE } from "@/app/api/forecasts/route.ts";
import { deleteForecast } from "@/app/api/forecasts/service.ts";
import { Prisma } from "@/generated/prisma/client.ts";

jest.mock("@/app/api/forecasts/service.ts", () => ({
  listForecasts: jest.fn(),
  createForecast: jest.fn(),
  updateForecast: jest.fn(),
  deleteForecast: jest.fn(),
}));

const remove = jest.mocked(deleteForecast);

const del = (query: string) =>
  DELETE(
    new NextRequest(`http://x/api/forecasts${query}`, { method: "DELETE" }),
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DELETE", () => {
  it("echoes the id it removed", async () => {
    remove.mockResolvedValue(undefined);
    const res = await del("?id=f1");

    expect(await res.json()).toEqual({ data: { id: "f1" } });
  });

  it("answers 422 without an id", async () => {
    expect((await del("")).status).toBe(422);
    expect(remove).not.toHaveBeenCalled();
  });

  it("answers 404 when the row is gone", async () => {
    remove.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("boom", {
        code: "P2025",
        clientVersion: "7",
      }),
    );
    const res = await del("?id=f1");

    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: { code: "not_found" } });
  });

  it("rethrows anything else", async () => {
    remove.mockRejectedValue(new Error("db"));

    await expect(del("?id=f1")).rejects.toThrow();
  });
});
