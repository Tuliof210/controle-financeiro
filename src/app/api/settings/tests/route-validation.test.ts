/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import type { NextRequest } from "next/server";
import { PUT } from "@/app/api/settings/route.ts";
import { saveSettings } from "@/app/api/settings/service.ts";
import { MAX_CENTS } from "@/lib/money.ts";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults.ts";

// Split off route.test.ts for the 100-line cap: same handler, and this half
// covers only what saveSchema refuses. The other half covers GET and the saves
// that go through.
jest.mock("@/app/api/settings/service.ts", () => ({
  getSettings: jest.fn(),
  saveSettings: jest.fn(),
}));

const save = jest.mocked(saveSettings);

const saved = { ...DEFAULT_SETTINGS, ceilingCents: 700 };

const put = (body: unknown) =>
  PUT(
    new Request("http://x/api/settings", {
      method: "PUT",
      body: JSON.stringify(body),
    }) as NextRequest,
  );

// One field off the valid object at a time: everything else stays legal, so a
// 422 can only have come from the field under test.
const putWith = (field: string, value: unknown) =>
  put({ ...saved, [field]: value });

beforeEach(() => {
  jest.clearAllMocks();
  save.mockResolvedValue(saved);
});

describe("PUT saveSchema", () => {
  it("accepts zero cents, which is how an amount is cleared", async () => {
    expect((await putWith("ceilingCents", 0)).status).toBe(200);
    expect((await putWith("goalsCents", 0)).status).toBe(200);
  });

  it("accepts the fixed mode on either adjustment", async () => {
    expect((await putWith("ceilingMode", "fixed")).status).toBe(200);
    expect((await putWith("goalsMode", "fixed")).status).toBe(200);
  });

  it("accepts either end of the percentage range", async () => {
    expect((await putWith("ceilingPercent", 0)).status).toBe(200);
    expect((await putWith("goalsPercent", 100)).status).toBe(200);
  });

  it("answers 422 on a mode outside percent/fixed", async () => {
    expect((await putWith("ceilingMode", "meta")).status).toBe(422);
    expect((await putWith("goalsMode", "")).status).toBe(422);
    expect(save).not.toHaveBeenCalled();
  });

  it("answers 422 on a percentage outside 0..100", async () => {
    expect((await putWith("ceilingPercent", -1)).status).toBe(422);
    expect((await putWith("ceilingPercent", 101)).status).toBe(422);
    expect((await putWith("goalsPercent", -1)).status).toBe(422);
    expect((await putWith("goalsPercent", 101)).status).toBe(422);
    expect(save).not.toHaveBeenCalled();
  });

  it("answers 422 on a negative or oversized amount", async () => {
    expect((await putWith("ceilingCents", -1)).status).toBe(422);
    expect((await putWith("ceilingCents", MAX_CENTS + 1)).status).toBe(422);
    expect((await putWith("goalsCents", -1)).status).toBe(422);
    expect((await putWith("goalsCents", MAX_CENTS + 1)).status).toBe(422);
    expect(save).not.toHaveBeenCalled();
  });

  it("answers 422 when a field is missing — the save is all-or-nothing", async () => {
    const { showSimulated: _dropped, ...six } = saved;

    expect((await put(six)).status).toBe(422);
    expect(save).not.toHaveBeenCalled();
  });
});
