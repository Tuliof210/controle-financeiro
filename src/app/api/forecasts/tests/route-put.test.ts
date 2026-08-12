/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { NextRequest } from "next/server";
import { PUT } from "@/app/api/forecasts/route.ts";
import { updateForecast } from "@/app/api/forecasts/service.ts";
import { Prisma } from "@/generated/prisma/client.ts";

jest.mock("../service.ts", () => ({
  listForecasts: jest.fn(),
  createForecast: jest.fn(),
  updateForecast: jest.fn(),
  deleteForecast: jest.fn(),
}));

const update = jest.mocked(updateForecast);

const valid = {
  id: "f1",
  name: "Aluguel",
  valueCents: 150_000,
  type: "expense",
  ownerId: "p1",
  months: [202_608],
};

const put = (body: unknown) =>
  PUT(
    new NextRequest("http://x/api/forecasts", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  );

const known = (code: string) =>
  new Prisma.PrismaClientKnownRequestError("boom", {
    code,
    clientVersion: "7",
  });

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PUT", () => {
  it("answers 200 with the updated forecast", async () => {
    update.mockResolvedValue(valid as never);

    expect((await put(valid)).status).toBe(200);
  });

  it("answers 422 without an id", async () => {
    expect((await put({ ...valid, id: "" })).status).toBe(422);
    expect(update).not.toHaveBeenCalled();
  });

  it("answers 404 when the row is gone", async () => {
    update.mockRejectedValue(known("P2025"));

    expect((await put(valid)).status).toBe(404);
  });

  it("answers 404 when the owner names nobody", async () => {
    update.mockRejectedValue(known("P2003"));
    const res = await put(valid);

    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: { code: "not_found" } });
  });

  it("answers 500 on anything else", async () => {
    update.mockRejectedValue(new Error("db"));

    expect((await put(valid)).status).toBe(500);
  });
});
