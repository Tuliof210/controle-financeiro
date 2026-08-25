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

const simulation = [
  { months: [209_912], type: "expense", valueCents: 1, simulated: true },
];

const settings = jest.mocked(settingsRepository);
const NOW = currentYyyymm();

// Every repository armed at once: the service pulls all four in one
// Promise.all, so leaving any unset rejects before the assertion runs.
const seed = (forecastList: unknown[] = []) => {
  jest
    .mocked(movementRepository)
    .list.mockResolvedValue([
      { month: NOW, type: "income", valueCents: 1000, ownerId: "p1" },
    ] as never);
  jest.mocked(forecastRepository).list.mockResolvedValue(forecastList as never);
  jest.mocked(goalRepository).list.mockResolvedValue([]);
  settings.get.mockResolvedValue(null);
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getDashboard", () => {
  it("leaves simulated forecasts out of the real view, range included", async () => {
    seed(simulation);

    const data = await getDashboard("familia", "50", "real");

    expect(data.status === "ok" && data.range.end).toBe(NOW);
  });

  it("counts them under the all view", async () => {
    seed(simulation);

    const data = await getDashboard("familia", "50", "all");

    expect(data.status === "ok" && data.range.end).toBe(209_912);
  });

  it("filters entries by the active profile", async () => {
    seed();

    const data = await getDashboard("p2", "50", "real");

    expect(data.status === "ok" && data.income.total).toBe(0);
  });

  it("keeps every entry under the family sentinel", async () => {
    seed();

    const data = await getDashboard("familia", "50", "real");

    expect(data.status === "ok" && data.income.total).toBe(1000);
  });

  it("echoes a saved monthly goal as the Meta target", async () => {
    seed();
    settings.get.mockResolvedValue({ ...DEFAULT_SETTINGS, ceilingCents: 700 });

    const data = await getDashboard("familia", "meta", "real");

    expect(data.status === "ok" && data.meta).toBe(700);
  });

  it("reports no Meta target when nothing is saved", async () => {
    seed();

    const data = await getDashboard("familia", "meta", "real");

    expect(data.status === "ok" && data.meta).toBeNull();
  });
});
