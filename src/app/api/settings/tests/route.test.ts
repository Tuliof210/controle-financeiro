/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import type { NextRequest } from "next/server";
import { GET, PUT } from "@/app/api/settings/route.ts";
import { getSettings, saveSettings } from "@/app/api/settings/service.ts";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults.ts";

jest.mock("@/app/api/settings/service.ts", () => ({
  getSettings: jest.fn(),
  saveSettings: jest.fn(),
}));

const read = jest.mocked(getSettings);
const save = jest.mocked(saveSettings);

const saved = { ...DEFAULT_SETTINGS, ceilingCents: 700 };

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
    read.mockResolvedValue(saved);

    expect(await (await GET()).json()).toEqual({ data: saved });
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
  it("saves the whole object", async () => {
    save.mockResolvedValue(saved);
    const res = await put(saved);

    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalledWith(saved);
  });

  it("answers 500 when the service throws", async () => {
    save.mockRejectedValue(new Error("db"));

    expect((await put(saved)).status).toBe(500);
  });
});
