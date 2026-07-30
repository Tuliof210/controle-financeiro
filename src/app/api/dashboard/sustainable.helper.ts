import type { MonthPoint } from "./types";

// 20% safety margin on the month that pins the rate.
const MARGIN = 0.8;

// The flat rate that survives being spent in EVERY remaining month — the single
// figure the card showed before it started listing one per month. It outlived
// that card because `savingPace` multiplies it by the months left
// (goals.helper), arithmetic that only holds for a rate; a front-loaded
// allowance is not one.
//
// Spending X extra every month lowers the month sitting `j` places ahead by
// X * (j + 1) — the withdrawals accumulate. Solvency is
// `cumulative[j] - X * (j + 1) >= 0` for every j, so the rate is
// `MARGIN * min(cumulative[j] / (j + 1))`: a minimum of RATIOS.
//
// `j` counts months from the current one, NOT positions in `points`. Past months
// are baked into `cumulative` — it is a stock, the money in the bank — but they
// must never contribute a position to the divisor. Callers pass the already
// filtered `ahead`, so index and position agree.
export function sustainableRate(ahead: MonthPoint[]): number {
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

  // A negative cumulative makes the minimum ratio negative; the clamp turns that
  // into 0, which is what makes a red period yield no rate at all.
  return Math.max(0, Math.floor((MARGIN * ahead[pin].cumulative) / (pin + 1)));
}
