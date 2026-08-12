/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import type { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/movements/route.ts";
import { createMovement, listMovements } from "@/app/api/movements/service.ts";
import { Prisma } from "@/generated/prisma/client.ts";

jest.mock("../service.ts", () => ({
  listMovements: jest.fn(),
  createMovement: jest.fn(),
  updateMovement: jest.fn(),
  deleteMovement: jest.fn(),
}));

const list = jest.mocked(listMovements);
const create = jest.mocked(createMovement);

const valid = {
  name: "Mercado",
  valueCents: 1000,
  type: "expense",
  month: 202_608,
  ownerId: "p1",
};

const post = (body: unknown) =>
  POST(
    new Request("http://x/api/movements", {
      method: "POST",
      body: JSON.stringify(body),
    }) as NextRequest,
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET", () => {
  it("wraps the list in the data envelope", async () => {
    list.mockResolvedValue([{ id: "m1" }] as never);

    expect(await (await GET()).json()).toEqual({ data: [{ id: "m1" }] });
  });

  it("answers 500 when the service throws", async () => {
    list.mockRejectedValue(new Error("db"));

    expect((await GET()).status).toBe(500);
  });
});

describe("POST", () => {
  it("answers 201 with the created movement", async () => {
    create.mockResolvedValue({ id: "m1" } as never);

    expect((await post(valid)).status).toBe(201);
  });

  it("answers 422 without an owner", async () => {
    expect((await post({ ...valid, ownerId: "" })).status).toBe(422);
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
