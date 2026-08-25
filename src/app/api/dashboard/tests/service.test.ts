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

const movements = jest.mocked(movementRepository);
const forecasts = jest.mocked(forecastRepository);
const NOW = currentYyyymm();

// Every repository armed at once: the service pulls all four in one
// Promise.all, so leaving any unset rejects before the assertion runs.
const seed = (
  over: { month?: number; movements?: unknown[]; forecasts?: unknown[] } = {},
) => {
  const month = over.month ?? NOW;
  movements.list.mockResolvedValue(
    (over.movements ?? [
      { month, type: "income", valueCents: 1000, ownerId: "p1" },
    ]) as never,
  );
  forecasts.list.mockResolvedValue((over.forecasts ?? []) as never);
  jest.mocked(goalRepository).list.mockResolvedValue([]);
  jest.mocked(settingsRepository).get.mockResolvedValue(null);
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getDashboard", () => {
  it("answers no_range on an empty database", async () => {
    seed({ movements: [] });

    await expect(getDashboard("familia")).resolves.toEqual({
      status: "no_range",
    });
  });

  it("answers out_of_range when today falls outside the derived span", async () => {
    seed({ month: 200_001 });

    const data = await getDashboard("familia");

    expect(data.status).toBe("out_of_range");
    expect(data.status === "out_of_range" && data.range.current).toBe(
      currentYyyymm(),
    );
  });

  it("answers ok when today is inside the span", async () => {
    seed();

    const data = await getDashboard("familia");

    expect(data.status).toBe("ok");
    expect(data.status === "ok" && data.range).toEqual({
      start: NOW,
      end: NOW,
      current: NOW,
    });
  });
});
