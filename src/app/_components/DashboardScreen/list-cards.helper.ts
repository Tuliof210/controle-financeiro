// Small derivations the four list cards share. Pure, so they carry the tests —
// the components around them cannot be tested under this repo's node-environment
// Vitest config.

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

// Goal.months is null when the saving pace is 0 — no month in the range leaves
// anything to put aside, so no number of months would ever reach the target.
export function goalLabel(months: number | null): string {
  if (months === null) return "inalcançável no ritmo atual";
  return months === 1 ? "~1 mês" : `~${months} meses`;
}
