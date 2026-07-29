import type { Ceiling, MonthPoint } from "./types";

// 20% safety margin on the month that pins the ceiling.
const MARGIN = 0.8;
// A quarter of the ceiling is what the owner is willing to commit to a goal
// every month.
const PACE_SHARE = 0.25;

// Spending X extra EVERY month from now on lowers the month sitting `j` places
// ahead by X * (j + 1) — the withdrawals accumulate. Solvency is
// `cumulative[j] - X * (j + 1) >= 0` for every j, so the ceiling is
// `MARGIN * min(cumulative[j] / (j + 1))`: a minimum of RATIOS.
//
// The divisor is the whole point. A minimum of plain balances prices ONE
// hypothetical spend in isolation, so its per-month answers are mutually
// exclusive — spending the first month's figure invalidates every later one,
// which is exactly how the per-month figure it replaces misled.
//
// `j` counts months from the current one, NOT positions in `points`. Past
// months are baked into `cumulative` — it is a stock, the money in the bank —
// but they must never contribute a position to the divisor.
//
// Math.floor everywhere: a spending allowance always rounds DOWN. Never
// Math.trunc — it differs on negatives, and the pre-clamp value can be one.
export function buildCeiling(
  points: MonthPoint[],
  currentMonth: number,
): Ceiling {
  // Never empty: service.ts answers "out_of_range" when the current month is
  // outside the range, and `points` is 1:1 with the months of that range.
  const ahead = points.filter((point) => point.month >= currentMonth);

  // Ratios compared by cross-multiplication rather than division, so equal
  // ratios compare equal and the earliest month keeps the pin. Cents are
  // integers and a range is months long, so the products stay far inside
  // MAX_SAFE_INTEGER.
  let pin = 0;
  for (let j = 1; j < ahead.length; j += 1) {
    if (ahead[j].cumulative * (pin + 1) < ahead[pin].cumulative * (j + 1)) {
      pin = j;
    }
  }

  const monthly = Math.max(
    0,
    Math.floor((MARGIN * ahead[pin].cumulative) / (pin + 1)),
  );

  // A negative cumulative makes the minimum ratio negative, which the clamp
  // above turns into 0 — so finding one here always means `monthly === 0`.
  const red = ahead.find((point) => point.cumulative < 0);

  return {
    monthly,
    weekly: Math.floor(monthly / 4),
    daily: Math.floor(monthly / 30),
    tightest: monthly > 0 ? ahead[pin].month : null,
    firstRed: red ? { month: red.month, shortfall: -red.cumulative } : null,
    months: ahead.map((point, j) => ({
      month: point.month,
      cumulative: point.cumulative,
      remaining: point.cumulative - monthly * (j + 1),
    })),
  };
}

// The ceiling is a rate that survives being spent every month, so a fixed share
// of it survives being SAVED every month — which is what lets goals.helper
// multiply it by the months left without overdrawing.
export function savingPace(ceiling: Ceiling): number {
  return Math.floor(PACE_SHARE * ceiling.monthly);
}
