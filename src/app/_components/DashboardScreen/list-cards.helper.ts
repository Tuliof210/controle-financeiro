// Small derivations CeilingCard and GoalCard share. `goalLabel` lived here until
// GoalCard replaced GoalsCard — its wording ("~7 meses", "inalcançável no ritmo
// atual") is now GoalCard's own `eta`, but the zero-divisor guard below is still
// shared by both.

// Each caller's share of ITS OWN whole — a month's own cumulative balance
// (CeilingCard), a goal's own target (GoalCard) — never the largest across
// rows, despite the parameter's old name. `whole` is 0 whenever the caller's
// own whole is 0 (an all-underwater range leaves no ceiling at all), and
// dividing by it would give NaN and a bar of width "NaN%".
export function sharePercent(value: number, whole: number): number {
  return whole > 0 ? (value / whole) * 100 : 0;
}
