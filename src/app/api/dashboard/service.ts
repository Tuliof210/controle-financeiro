import { derivePeriod } from "@/core/use-cases/period.service.ts";
import { forecastRepository } from "@/infra/repositories/forecast.prisma.repository.ts";
import { goalRepository } from "@/infra/repositories/goal.prisma.repository.ts";
import { movementRepository } from "@/infra/repositories/movement.prisma.repository.ts";
import { settingsRepository } from "@/infra/repositories/settings.prisma.repository.ts";
import {
  type CeilingCap,
  capPercent,
  DEFAULT_CEILING_CAP,
  META_CAP,
} from "@/lib/ceiling-caps.ts";
import { buildMonths, currentYYYYMM } from "@/lib/months.ts";
import { visibleFor } from "@/lib/ownership.ts";
import type { SimulationView } from "@/lib/simulation.ts";
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

  // Zero reads as unset, exactly as it does on the settings screen: clearing
  // the field is how the goal is removed, there being no DELETE for it.
  const meta = settings?.monthlyGoalCents ? settings.monthlyGoalCents : null;
  // Asking for Meta without one falls back to the default target — the same
  // doctrine as route.ts's `.catch`, one step later: an unusable value on this
  // parameter must never turn into an error notice over an honest board.
  const target = cap === META_CAP && meta === null ? DEFAULT_CEILING_CAP : cap;

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
  if (period === null) {
    return { status: "no_range" };
  }

  const months = buildMonths(period.start, period.end);
  const range = { ...period, current: currentYYYYMM(new Date()) };
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
    limit: target === META_CAP ? meta : null,
    meta,
  });
}
