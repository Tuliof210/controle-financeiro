// One derivation, kept out of CeilingCard's own hook because it is the zero
// divisor guard rather than card logic. Two other cards called it once; both
// have since lost the meters that needed it, leaving CeilingCard alone here.

// The caller's share of ITS OWN whole — a month's own cumulative balance — never
// the largest across rows, despite the parameter's old name. `whole` is 0
// whenever that own whole is 0 (an all-underwater range leaves no ceiling at
// all), and dividing by it would give NaN and a bar of width "NaN%".
export function sharePercent(value: number, whole: number): number {
  return whole > 0 ? (value / whole) * 100 : 0;
}
