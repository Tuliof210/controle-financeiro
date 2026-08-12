import { forecastRepository } from "@/infra/repositories/forecast.prisma.repository.ts";
import { goalRepository } from "@/infra/repositories/goal.prisma.repository.ts";
import { movementRepository } from "@/infra/repositories/movement.prisma.repository.ts";
import { settingsRepository } from "@/infra/repositories/settings.prisma.repository.ts";
import { currentYyyymm } from "@/lib/months.ts";

// The seeding half of the dashboard service suites. The jest.mock calls
// themselves stay in each test file: only there are they hoisted above the
// import of the service under test. Not a `*.test.ts`, so testMatch skips it.
const movements = jest.mocked(movementRepository);
const forecasts = jest.mocked(forecastRepository);
const goals = jest.mocked(goalRepository);
const settings = jest.mocked(settingsRepository);

const NOW = currentYyyymm();

interface Seed {
  month?: number;
  movements?: unknown[];
  forecasts?: unknown[];
}

function seed(overrides: Seed = {}): void {
  const month = overrides.month ?? NOW;
  movements.list.mockResolvedValue(
    (overrides.movements ?? [
      { month, type: "income", valueCents: 1000, ownerId: "p1" },
    ]) as never,
  );
  forecasts.list.mockResolvedValue((overrides.forecasts ?? []) as never);
  goals.list.mockResolvedValue([]);
  settings.get.mockResolvedValue(null);
}

export { forecasts, goals, movements, NOW, seed, settings };
