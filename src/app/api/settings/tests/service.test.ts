/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { getSettings, saveSettings } from "@/app/api/settings/service.ts";
import { settingsRepository } from "@/infra/repositories/settings.prisma.repository.ts";

jest.mock("@/infra/repositories/settings.prisma.repository.ts", () => ({
  settingsRepository: { get: jest.fn(), save: jest.fn() },
}));

const repository = jest.mocked(settingsRepository);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getSettings", () => {
  it("hands the saved singleton back", async () => {
    repository.get.mockResolvedValue({ monthlyGoalCents: 50_000 });

    await expect(getSettings()).resolves.toEqual({ monthlyGoalCents: 50_000 });
  });

  it("passes null through as the no-goal state", async () => {
    repository.get.mockResolvedValue(null);

    await expect(getSettings()).resolves.toBeNull();
  });
});

describe("saveSettings", () => {
  it("forwards the whole settings object", async () => {
    const input = { monthlyGoalCents: 0 };
    repository.save.mockResolvedValue(input);

    await expect(saveSettings(input)).resolves.toEqual(input);
    expect(repository.save).toHaveBeenCalledWith(input);
  });
});
