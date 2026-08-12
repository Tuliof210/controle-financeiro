// The four choices the dashboard makes about its own inputs before any
// arithmetic runs. Split off service.ts for the 100-line cap.
import type { Forecast } from "@/core/entities/forecast.entity.ts";
import {
  type CeilingCap,
  DEFAULT_CEILING_CAP,
  META_CAP,
} from "@/lib/ceiling-caps.ts";

// Zero reads as unset, exactly as it does on the settings screen: clearing the
// field is how the goal is removed, there being no DELETE for it.
function metaOf(monthlyGoalCents: number | undefined): number | null {
  if (!monthlyGoalCents) {
    return null;
  }
  return monthlyGoalCents;
}

// Asking for Meta without one falls back to the default target — the same
// doctrine as route.ts's `.catch`, one step later: an unusable value on this
// parameter must never turn into an error notice over an honest board.
function targetCap(cap: CeilingCap, meta: number | null): CeilingCap {
  if (cap === META_CAP && meta === null) {
    return DEFAULT_CEILING_CAP;
  }
  return cap;
}

// Filtered here rather than beside visibleFor below, because "as if they had
// never been registered" has to include the range: derivePeriod reads this list
// too. The consequence is deliberate — a board whose only reach into the
// current month is a simulation answers no_range/out_of_range on "real", and
// the screen already has a notice for each.
function forecastsFor(simulation: string, all: Forecast[]): Forecast[] {
  if (simulation === "all") {
    return all;
  }
  return all.filter((forecast) => !forecast.simulated);
}

// Only the Meta target is capped by the goal; the percentage targets are not.
function limitFor(target: CeilingCap, meta: number | null): number | null {
  if (target === META_CAP) {
    return meta;
  }
  return null;
}

export { forecastsFor, limitFor, metaOf, targetCap };
