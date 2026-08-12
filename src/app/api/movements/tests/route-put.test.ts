/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { NextRequest } from "next/server";
import { PUT } from "@/app/api/movements/route.ts";
import { updateMovement } from "@/app/api/movements/service.ts";
import { Prisma } from "@/generated/prisma/client.ts";

jest.mock("../service.ts", () => ({
  listMovements: jest.fn(),
  createMovement: jest.fn(),
  updateMovement: jest.fn(),
  deleteMovement: jest.fn(),
}));

const update = jest.mocked(updateMovement);

const valid = {
  id: "m1",
  name: "Mercado",
  valueCents: 1000,
  type: "expense",
  month: 202_608,
  ownerId: "p1",
};

const put = (body: unknown) =>
  PUT(
    new NextRequest("http://x/api/movements", {
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
  it("answers 200 with the updated movement", async () => {
    update.mockResolvedValue(valid as never);

    expect((await put(valid)).status).toBe(200);
  });

  it("answers 422 on a month outside the picker's domain", async () => {
    expect((await put({ ...valid, month: 199_912 })).status).toBe(422);
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
