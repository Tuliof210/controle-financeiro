// Small derivations SlackCard, LimitCard and GoalCard share. `goalLabel` lived
// here until GoalCard replaced GoalsCard — its wording ("~7 meses",
// "inalcançável no ritmo atual") is now GoalCard's own `eta`, but the
// zero-divisor guard below is still shared by all three.

// A row's share of the largest row, for the meter fill. `max` is 0 whenever
// every row is 0 (an all-underwater range leaves no slack at all), and dividing
// by it would give NaN and a bar of width "NaN%".
export function sharePercent(value: number, max: number): number {
  return max > 0 ? (value / max) * 100 : 0;
}

// The monthly ceiling is a budget: at or under it is fine, past it is not.
export function limitTone(percent: number | null): "positive" | "negative" {
  return percent !== null && percent > 100 ? "negative" : "positive";
}
