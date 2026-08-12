/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import type { NextRequest } from "next/server";
import { GET, PUT } from "@/app/api/settings/route.ts";
import { getSettings, saveSettings } from "@/app/api/settings/service.ts";
import { MAX_CENTS } from "@/lib/money.ts";

jest.mock("../service.ts", () => ({
  getSettings: jest.fn(),
  saveSettings: jest.fn(),
}));

const read = jest.mocked(getSettings);
const save = jest.mocked(saveSettings);

const put = (body: unknown) =>
  PUT(
    new Request("http://x/api/settings", {
      method: "PUT",
      body: JSON.stringify(body),
    }) as NextRequest,
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET", () => {
  it("answers the saved singleton", async () => {
    read.mockResolvedValue({ monthlyGoalCents: 700 });

    expect(await (await GET()).json()).toEqual({
      data: { monthlyGoalCents: 700 },
    });
  });

  it("answers null rather than 404 when nothing was ever saved", async () => {
    read.mockResolvedValue(null);
    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: null });
  });

  it("answers 500 when the service throws", async () => {
    read.mockRejectedValue(new Error("db"));

    expect((await GET()).status).toBe(500);
  });
});

describe("PUT", () => {
  it("saves a goal", async () => {
    save.mockResolvedValue({ monthlyGoalCents: 700 });
    const res = await put({ monthlyGoalCents: 700 });

    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalledWith({ monthlyGoalCents: 700 });
  });

  it("accepts zero, which is how the goal is cleared", async () => {
    save.mockResolvedValue({ monthlyGoalCents: 0 });

    expect((await put({ monthlyGoalCents: 0 })).status).toBe(200);
  });

  it("answers 422 on a negative or oversized goal", async () => {
    expect((await put({ monthlyGoalCents: -1 })).status).toBe(422);
    expect((await put({ monthlyGoalCents: MAX_CENTS + 1 })).status).toBe(422);
    expect(save).not.toHaveBeenCalled();
  });

  it("answers 500 when the service throws", async () => {
    save.mockRejectedValue(new Error("db"));

    expect((await put({ monthlyGoalCents: 1 })).status).toBe(500);
  });
});
