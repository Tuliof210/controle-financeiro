import { derivePeriod } from "@/core/use-cases/period.service.ts";
import { forecastRepository } from "@/infra/repositories/forecast.prisma.repository.ts";
import { goalRepository } from "@/infra/repositories/goal.prisma.repository.ts";
import { movementRepository } from "@/infra/repositories/movement.prisma.repository.ts";
import { settingsRepository } from "@/infra/repositories/settings.prisma.repository.ts";
import { type CeilingCap, capPercent } from "@/lib/ceiling-caps.ts";
import { buildMonths, currentYyyymm } from "@/lib/months.ts";
import { visibleFor } from "@/lib/ownership.ts";
import type { SimulationView } from "@/lib/simulation.ts";
import {
  forecastsFor,
  limitFor,
  metaOf,
  targetCap,
} from "./dashboard-inputs.helper.ts";
import { buildPayload } from "./payload.helper.ts";
import type { DashboardData } from "./types.ts";

export async function getDashboard(
  owner: string,
  cap: CeilingCap,
  simulation: SimulationView,
): Promise<DashboardData> {
  const [movements, all, goals, settings] = await Promise.all([
    movementRepository.list(),
    forecastRepository.list(),
    goalRepository.list(),
    settingsRepository.get(),
  ]);

  const meta = metaOf(settings?.ceilingCents);
  const target = targetCap(cap, meta);

  const forecasts = forecastsFor(simulation, all);

  // The period is derived from the entries themselves, not typed by hand —
  // start/end are a min/max over the same set, so this can never be inverted
  // the way a hand-saved range could.
  const period = derivePeriod(movements, forecasts);
  if (period === null) {
    return { status: "no_range" };
  }

  const months = buildMonths(period.start, period.end);
  const range = { ...period, current: currentYyyymm(new Date()) };
  const currentIndex = months.indexOf(range.current);
  if (currentIndex === -1) {
    return { status: "out_of_range", range };
  }

  return buildPayload({
    range,
    months,
    currentIndex,
    // Goals are family-wide — the entity has no ownerId — so they are not
    // filtered by the active profile the way movements and forecasts are.
    goals,
    movements: visibleFor(movements, owner),
    forecasts: visibleFor(forecasts, owner),
    cap: capPercent(target),
    limit: limitFor(target, meta),
    meta,
  });
}
