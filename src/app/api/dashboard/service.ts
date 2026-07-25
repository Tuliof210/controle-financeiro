import { goalRepository } from "@/infra/repositories/goal.prisma.repository";
import { movementRepository } from "@/infra/repositories/movement.prisma.repository";
import { recurrenceRepository } from "@/infra/repositories/recurrence.prisma.repository";
import { settingsRepository } from "@/infra/repositories/settings.prisma.repository";
import { buildMonths, currentYYYYMM } from "@/lib/months";
import { visibleFor } from "@/lib/ownership";
import { buildPayload } from "./payload.helper";
import type { DashboardData } from "./types";

// `now` is injected so tests can pin the clock — this repo has no fake timers
// and injects a Date instead (see src/lib/months.test.ts).
export async function getDashboard(
  owner: string,
  now = new Date(),
): Promise<DashboardData> {
  const [settings, movements, recurrences, goals] = await Promise.all([
    settingsRepository.get(),
    movementRepository.list(),
    recurrenceRepository.list(),
    goalRepository.list(),
  ]);

  const { rangeStart, rangeEnd } = settings;
  if (rangeStart == null || rangeEnd == null) return { status: "no_range" };

  // An inverted range is reachable: PUT /api/settings validates the incoming
  // patch, never the merged result, so a lone rangeStart can land past a
  // stored rangeEnd. buildMonths yields [] for it.
  const months = buildMonths(rangeStart, rangeEnd);
  if (months.length === 0) return { status: "no_range" };

  const range = {
    start: rangeStart,
    end: rangeEnd,
    current: currentYYYYMM(now),
  };
  const currentIndex = months.indexOf(range.current);
  if (currentIndex === -1) return { status: "out_of_range", range };

  return buildPayload({
    range,
    months,
    currentIndex,
    goalCents: settings.monthlyGoalCents,
    // Goals are family-wide — the entity has no ownerId — so they are not
    // filtered by the active profile the way movements and recurrences are.
    goals,
    movements: visibleFor(movements, owner),
    recurrences: visibleFor(recurrences, owner),
  });
}
