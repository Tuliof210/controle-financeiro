/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { prisma } from "@/infra/db/client.ts";
import { settingsRepository } from "@/infra/repositories/settings.prisma.repository.ts";

jest.mock("@/infra/db/client.ts", () => ({
  prisma: { settings: { findUnique: jest.fn(), upsert: jest.fn() } },
}));

const settings = jest.mocked(prisma.settings);

const select = { monthlyGoalCents: true };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("settingsRepository", () => {
  it("reads the one singleton row", async () => {
    settings.findUnique.mockResolvedValue({ monthlyGoalCents: 700 } as never);

    await expect(settingsRepository.get()).resolves.toEqual({
      monthlyGoalCents: 700,
    });
    expect(settings.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select,
    });
  });

  it("passes an absent row through as null", async () => {
    settings.findUnique.mockResolvedValue(null);

    await expect(settingsRepository.get()).resolves.toBeNull();
  });

  it("upserts onto the same id, creating or updating", async () => {
    settings.upsert.mockResolvedValue({ monthlyGoalCents: 0 } as never);

    await settingsRepository.save({ monthlyGoalCents: 0 });

    expect(settings.upsert).toHaveBeenCalledWith({
      where: { id: 1 },
      create: { id: 1, monthlyGoalCents: 0 },
      update: { monthlyGoalCents: 0 },
      select,
    });
  });
});
