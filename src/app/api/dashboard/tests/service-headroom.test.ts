/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { getDashboard } from "@/app/api/dashboard/service.ts";
import { forecastRepository } from "@/infra/repositories/forecast.prisma.repository.ts";
import { goalRepository } from "@/infra/repositories/goal.prisma.repository.ts";
import { movementRepository } from "@/infra/repositories/movement.prisma.repository.ts";
import { settingsRepository } from "@/infra/repositories/settings.prisma.repository.ts";
import { currentYyyymm } from "@/lib/months.ts";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults.ts";

jest.mock("@/infra/repositories/movement.prisma.repository.ts", () => ({
  movementRepository: { list: jest.fn() },
}));
jest.mock("@/infra/repositories/forecast.prisma.repository.ts", () => ({
  forecastRepository: { list: jest.fn() },
}));
jest.mock("@/infra/repositories/goal.prisma.repository.ts", () => ({
  goalRepository: { list: jest.fn() },
}));
jest.mock("@/infra/repositories/settings.prisma.repository.ts", () => ({
  settingsRepository: { get: jest.fn() },
}));

const settings = jest.mocked(settingsRepository);
const NOW = currentYyyymm();

// One income of 1000 in the current month and nothing else, so the whole period
// is one month and its headroom is exactly 1000 — the ruler a fixed ceiling is
// measured against.
const HEADROOM = 1000;

const seed = () => {
  jest
    .mocked(movementRepository)
    .list.mockResolvedValue([
      { month: NOW, type: "income", valueCents: HEADROOM, ownerId: "p1" },
    ] as never);
  jest.mocked(forecastRepository).list.mockResolvedValue([]);
  jest.mocked(goalRepository).list.mockResolvedValue([]);
};

const overHeadroom = async (over: Partial<typeof DEFAULT_SETTINGS>) => {
  settings.get.mockResolvedValue({ ...DEFAULT_SETTINGS, ...over });
  const data = await getDashboard("familia");
  return data.status === "ok" && data.overHeadroom;
};

beforeEach(() => {
  jest.clearAllMocks();
  seed();
});

describe("getDashboard overHeadroom", () => {
  it("is off while both adjustments are percentages", async () => {
    await expect(overHeadroom({ ceilingPercent: 100 })).resolves.toBe(false);
  });

  it("is on when the fixed ceiling passed what the period carries", async () => {
    await expect(
      overHeadroom({ ceilingMode: "fixed", ceilingCents: HEADROOM + 1 }),
    ).resolves.toBe(true);
  });

  it("is off when the fixed ceiling still fits", async () => {
    await expect(
      overHeadroom({ ceilingMode: "fixed", ceilingCents: HEADROOM }),
    ).resolves.toBe(false);
  });

  it("stays off when a fixed goals amount passed the headroom", async () => {
    await expect(
      overHeadroom({ goalsMode: "fixed", goalsCents: HEADROOM + 1 }),
    ).resolves.toBe(false);
  });
});
