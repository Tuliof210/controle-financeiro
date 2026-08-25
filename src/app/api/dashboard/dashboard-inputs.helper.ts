// The choices the dashboard makes about its own inputs before any arithmetic
// runs. Every one of them now reads the saved `Settings` row: the board has no
// controls of its own, so nothing here comes off the query string. Split off
// service.ts for the 100-line cap.
import type { Forecast } from "@/core/entities/forecast.entity.ts";
import type { Settings } from "@/core/entities/settings.entity.ts";
import type { CeilingTarget } from "./ceiling.types.ts";
import type { GoalsTarget } from "./pace.helper.ts";

// The mode picks which of the two saved figures is the answer; the other one
// stays on the row untouched, so switching back does not lose it.
export function ceilingTargetOf(settings: Settings): CeilingTarget {
  if (settings.ceilingMode === "fixed") {
    return { mode: "fixed", cents: settings.ceilingCents };
  }
  return { mode: "percent", percent: settings.ceilingPercent };
}

export function goalsTargetOf(settings: Settings): GoalsTarget {
  if (settings.goalsMode === "fixed") {
    return { mode: "fixed", cents: settings.goalsCents };
  }
  return { mode: "percent", percent: settings.goalsPercent };
}

// Filtered here rather than beside visibleFor in service.ts, because "as if they
// had never been registered" has to include the range: derivePeriod reads this
// list too. The consequence is deliberate — a board whose only reach into the
// current month is a simulation answers no_range/out_of_range while simulations
// are off, and the screen already has a notice for each.
export function forecastsFor(
  showSimulated: boolean,
  all: Forecast[],
): Forecast[] {
  if (showSimulated) {
    return all;
  }
  return all.filter((forecast) => !forecast.simulated);
}

// A saved fixed ceiling that the period can no longer carry. Only the ceiling
// paints months red (`ceilingLeft` negative); a goals amount does not, so it is
// not asked. A percentage cannot overflow headroom by construction.
export function overHeadroomOf(
  settings: Settings,
  headroomCents: number,
): boolean {
  return (
    settings.ceilingMode === "fixed" && settings.ceilingCents > headroomCents
  );
}
