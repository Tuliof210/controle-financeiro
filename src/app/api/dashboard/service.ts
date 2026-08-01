import { derivePeriod } from "@/core/use-cases/period.service";
import { forecastRepository } from "@/infra/repositories/forecast.prisma.repository";
import { goalRepository } from "@/infra/repositories/goal.prisma.repository";
import { movementRepository } from "@/infra/repositories/movement.prisma.repository";
import { buildMonths, currentYYYYMM } from "@/lib/months";
import { visibleFor } from "@/lib/ownership";
import type { SimulationView } from "@/lib/simulation";
import { buildPayload } from "./payload.helper";
import type { DashboardData } from "./types";

export async function getDashboard(
  owner: string,
  cap: number,
  simulation: SimulationView,
): Promise<DashboardData> {
  const [movements, all, goals] = await Promise.all([
    movementRepository.list(),
    forecastRepository.list(),
    goalRepository.list(),
  ]);

  // Filtered here rather than beside visibleFor below, because "as if they had
  // never been registered" has to include the range: derivePeriod reads this
  // list too. The consequence is deliberate — a board whose only reach into the
  // current month is a simulation answers no_range/out_of_range on "real", and
  // the screen already has a notice for each.
  const forecasts =
    simulation === "all" ? all : all.filter((forecast) => !forecast.simulated);

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
    cap,
  });
}
