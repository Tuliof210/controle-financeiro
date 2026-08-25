import { derivePeriod } from "@/core/use-cases/period.service.ts";
import { forecastRepository } from "@/infra/repositories/forecast.prisma.repository.ts";
import { goalRepository } from "@/infra/repositories/goal.prisma.repository.ts";
import { movementRepository } from "@/infra/repositories/movement.prisma.repository.ts";
import { settingsRepository } from "@/infra/repositories/settings.prisma.repository.ts";
import { buildMonths, currentYyyymm } from "@/lib/months.ts";
import { visibleFor } from "@/lib/ownership.ts";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults.ts";
import {
  ceilingTargetOf,
  forecastsFor,
  goalsTargetOf,
  overHeadroomOf,
} from "./dashboard-inputs.helper.ts";
import { buildPayload } from "./payload.helper.ts";
import type { DashboardData } from "./types.ts";

export async function getDashboard(owner: string): Promise<DashboardData> {
  const [movements, all, goals, saved] = await Promise.all([
    movementRepository.list(),
    forecastRepository.list(),
    goalRepository.list(),
    settingsRepository.get(),
  ]);

  // `null` until the family saves for the first time, and the defaults are what
  // that null means — the same row the Perfil screen seeds its cards from, so
  // an untouched install and a freshly saved default read alike.
  const settings = saved ?? DEFAULT_SETTINGS;

  const forecasts = forecastsFor(settings.showSimulated, all);

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

  const payload = buildPayload({
    range,
    months,
    currentIndex,
    // Goals are family-wide — the entity has no ownerId — so they are not
    // filtered by the active profile the way movements and forecasts are.
    goals,
    movements: visibleFor(movements, owner),
    forecasts: visibleFor(forecasts, owner),
    ceilingTarget: ceilingTargetOf(settings),
    goalsTarget: goalsTargetOf(settings),
  });

  // Added here and not inside buildPayload: this is the one place holding the
  // saved row and the ceiling it produced at the same time.
  return {
    ...payload,
    overHeadroom: overHeadroomOf(settings, payload.ceiling.headroomCents),
  };
}
