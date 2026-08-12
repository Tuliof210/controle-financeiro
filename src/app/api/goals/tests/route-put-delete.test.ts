/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { NextRequest } from "next/server";
import { DELETE, PUT } from "@/app/api/goals/route.ts";
import { deleteGoal, updateGoal } from "@/app/api/goals/service.ts";
import { Prisma } from "@/generated/prisma/client.ts";

jest.mock("../service.ts", () => ({
  listGoals: jest.fn(),
  createGoal: jest.fn(),
  updateGoal: jest.fn(),
  deleteGoal: jest.fn(),
}));

const update = jest.mocked(updateGoal);
const remove = jest.mocked(deleteGoal);

const valid = { id: "g1", name: "Casa", targetCents: 5000 };

const put = (body: unknown) =>
  PUT(
    new NextRequest("http://x/api/goals", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  );

const del = (query: string) =>
  DELETE(new NextRequest(`http://x/api/goals${query}`, { method: "DELETE" }));

const known = (code: string) =>
  new Prisma.PrismaClientKnownRequestError("boom", {
    code,
    clientVersion: "7",
  });

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PUT", () => {
  it("answers 200 with the updated goal", async () => {
    update.mockResolvedValue(valid as never);

    expect(await (await put(valid)).json()).toEqual({ data: valid });
  });

  it("answers 422 without an id", async () => {
    expect((await put({ name: "Casa", targetCents: 1 })).status).toBe(422);
  });

  it("answers 404 when the row is gone", async () => {
    update.mockRejectedValue(known("P2025"));
    const res = await put(valid);

    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: { code: "not_found" } });
  });

  it("answers 500 on anything else", async () => {
    update.mockRejectedValue(new Error("db"));

    expect((await put(valid)).status).toBe(500);
  });
});

describe("DELETE", () => {
  it("echoes the id it removed", async () => {
    remove.mockResolvedValue(undefined);

    expect(await (await del("?id=g1")).json()).toEqual({ data: { id: "g1" } });
  });

  it("answers 422 without an id", async () => {
    expect((await del("")).status).toBe(422);
  });

  it("answers 404 when the row is gone", async () => {
    remove.mockRejectedValue(known("P2025"));

    expect((await del("?id=g1")).status).toBe(404);
  });

  it("rethrows anything else", async () => {
    remove.mockRejectedValue(new Error("db"));

    await expect(del("?id=g1")).rejects.toThrow();
  });
});
