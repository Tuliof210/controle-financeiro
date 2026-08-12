/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import type { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/goals/route.ts";
import { createGoal, listGoals } from "@/app/api/goals/service.ts";

jest.mock("../service.ts", () => ({
  listGoals: jest.fn(),
  createGoal: jest.fn(),
  updateGoal: jest.fn(),
  deleteGoal: jest.fn(),
}));

const list = jest.mocked(listGoals);
const create = jest.mocked(createGoal);

const post = (body: unknown) =>
  POST(
    new Request("http://x/api/goals", {
      method: "POST",
      body: JSON.stringify(body),
    }) as NextRequest,
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET", () => {
  it("wraps the list in the data envelope", async () => {
    list.mockResolvedValue([{ id: "g1" }] as never);
    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: [{ id: "g1" }] });
  });

  it("answers 500 when the service throws", async () => {
    list.mockRejectedValue(new Error("db"));

    expect((await GET()).status).toBe(500);
  });
});

describe("POST", () => {
  it("answers 201 with the created goal", async () => {
    create.mockResolvedValue({ id: "g1" } as never);
    const res = await post({ name: "Casa", targetCents: 5000 });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ data: { id: "g1" } });
  });

  it("answers 422 on an empty name or a non-positive target", async () => {
    expect((await post({ name: " ", targetCents: 5000 })).status).toBe(422);
    expect((await post({ name: "Casa", targetCents: 0 })).status).toBe(422);
    expect(create).not.toHaveBeenCalled();
  });

  it("answers 422 on a malformed body", async () => {
    const res = await POST(
      new Request("http://x/api/goals", {
        method: "POST",
        body: "{",
      }) as NextRequest,
    );

    expect(res.status).toBe(422);
  });
});
