/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { getSettings, saveSettings } from "@/app/api/settings/service.ts";
import { settingsRepository } from "@/infra/repositories/settings.prisma.repository.ts";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults.ts";

jest.mock("@/infra/repositories/settings.prisma.repository.ts", () => ({
  settingsRepository: { get: jest.fn(), save: jest.fn() },
}));

const repository = jest.mocked(settingsRepository);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getSettings", () => {
  it("hands the saved singleton back", async () => {
    const saved = { ...DEFAULT_SETTINGS, ceilingCents: 50_000 };
    repository.get.mockResolvedValue(saved);

    await expect(getSettings()).resolves.toEqual(saved);
  });

  it("passes null through as the never-saved state", async () => {
    repository.get.mockResolvedValue(null);

    await expect(getSettings()).resolves.toBeNull();
  });
});

describe("saveSettings", () => {
  it("forwards the whole settings object", async () => {
    const input = { ...DEFAULT_SETTINGS, goalsMode: "fixed" as const };
    repository.save.mockResolvedValue(input);

    await expect(saveSettings(input)).resolves.toEqual(input);
    expect(repository.save).toHaveBeenCalledWith(input);
  });
});
