import { derivePeriod } from "@/core/use-cases/period.service";
import { forecastRepository } from "@/infra/repositories/forecast.prisma.repository";
import { goalRepository } from "@/infra/repositories/goal.prisma.repository";
import { movementRepository } from "@/infra/repositories/movement.prisma.repository";
import { buildMonths, currentYYYYMM } from "@/lib/months";
import { visibleFor } from "@/lib/ownership";
import { buildPayload } from "./payload.helper";
import type { DashboardData } from "./types";

export async function getDashboard(owner: string): Promise<DashboardData> {
  const [movements, forecasts, goals] = await Promise.all([
    movementRepository.list(),
    forecastRepository.list(),
    goalRepository.list(),
  ]);

  // The period is derived from the entries themselves, not typed by hand —
  // start/end are a min/max over the same set, so this can never be inverted
  // the way a hand-saved range could.
  const period = derivePeriod(movements, forecasts);
  if (period === null) return { status: "no_range" };

  const months = buildMonths(period.start, period.end);
  const range = { ...period, current: currentYYYYMM(new Date()) };
  const currentIndex = months.indexOf(range.current);
  if (currentIndex === -1) return { status: "out_of_range", range };

  return buildPayload({
    range,
    months,
    currentIndex,
    // Goals are family-wide — the entity has no ownerId — so they are not
    // filtered by the active profile the way movements and forecasts are.
    goals,
    movements: visibleFor(movements, owner),
    forecasts: visibleFor(forecasts, owner),
  });
}
