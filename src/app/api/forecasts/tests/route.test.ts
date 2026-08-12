/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import type { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/forecasts/route.ts";
import { createForecast, listForecasts } from "@/app/api/forecasts/service.ts";
import { Prisma } from "@/generated/prisma/client.ts";

jest.mock("../service.ts", () => ({
  listForecasts: jest.fn(),
  createForecast: jest.fn(),
  updateForecast: jest.fn(),
  deleteForecast: jest.fn(),
}));

const list = jest.mocked(listForecasts);
const create = jest.mocked(createForecast);

const valid = {
  name: "Aluguel",
  valueCents: 150_000,
  type: "expense",
  ownerId: "p1",
  months: [202_608],
};

const post = (body: unknown) =>
  POST(
    new Request("http://x/api/forecasts", {
      method: "POST",
      body: JSON.stringify(body),
    }) as NextRequest,
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET", () => {
  it("wraps the list in the data envelope", async () => {
    list.mockResolvedValue([{ id: "f1" }] as never);

    expect(await (await GET()).json()).toEqual({ data: [{ id: "f1" }] });
  });

  it("answers 500 when the service throws", async () => {
    list.mockRejectedValue(new Error("db"));

    expect((await GET()).status).toBe(500);
  });
});

describe("POST", () => {
  it("answers 201 with the created forecast", async () => {
    create.mockResolvedValue({ id: "f1" } as never);

    expect((await post(valid)).status).toBe(201);
  });

  it("answers 422 without an active month", async () => {
    expect((await post({ ...valid, months: [] })).status).toBe(422);
    expect(create).not.toHaveBeenCalled();
  });

  it("answers 404 when the owner names nobody", async () => {
    create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("boom", {
        code: "P2003",
        clientVersion: "7",
      }),
    );
    const res = await post(valid);

    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: { code: "not_found" } });
  });

  it("rethrows anything else", async () => {
    create.mockRejectedValue(new Error("db"));

    await expect(post(valid)).rejects.toThrow();
  });
});
