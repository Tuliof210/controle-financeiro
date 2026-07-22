import { describe, expect, it, vi } from "vitest";

vi.mock("@/infra/repositories/settings.prisma.repository", () => ({
  settingsRepository: {
    get: vi.fn(),
    save: vi.fn(),
  },
}));

import { settingsRepository } from "@/infra/repositories/settings.prisma.repository";
import { getSettings, saveSettings } from "./service";

describe("settings service", () => {
  it("getSettings delegates to the repository", async () => {
    const settings = {
      rangeStart: null,
      rangeEnd: null,
      monthlyGoalCents: null,
    };
    vi.mocked(settingsRepository.get).mockResolvedValue(settings);
    const result = await getSettings();
    expect(settingsRepository.get).toHaveBeenCalledOnce();
    expect(result).toEqual(settings);
  });

  it("saveSettings delegates the patch to the repository", async () => {
    const patch = { monthlyGoalCents: 50000 };
    const saved = { rangeStart: null, rangeEnd: null, monthlyGoalCents: 50000 };
    vi.mocked(settingsRepository.save).mockResolvedValue(saved);
    const result = await saveSettings(patch);
    expect(settingsRepository.save).toHaveBeenCalledWith(patch);
    expect(result).toEqual(saved);
  });
});
