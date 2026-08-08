// Which target the Teto de Gastos hands out — how much of each month's worst
// projected balance is released as spendable. Strings, because this is what
// travels as a query param and what a radio group's `value` is; the arithmetic
// in `buildCeiling` converts once.
//
// Both ends of the wire read the default from here. The route parses `?cap=`
// against this tuple and the screen seeds its state from it, so the server's
// idea of "no cap given" and the UI's idea of "nothing picked yet" cannot drift.

// The one member that is not a percentage: it releases the whole headroom and
// is then limited by the monthly spending goal saved in /configuracoes. Named,
// because three files have to recognise it and a bare "meta" in each is three
// chances to typo it.
export const META_CAP = "meta";

export const CEILING_CAPS = ["25", "50", "75", META_CAP] as const;

export type CeilingCap = (typeof CEILING_CAPS)[number];

export const DEFAULT_CEILING_CAP: CeilingCap = "50";

// The share of the headroom a target releases. `Number(cap)` alone used to live
// inline in the route as `.transform(Number)`, and adding a non-numeric member
// to the tuple is exactly what turns that into NaN in every budget, every pace
// and every goal date on the board. Meta reads as 100 because it starts from
// the WHOLE headroom; the goal amount then caps the result in buildCeiling.
export const capPercent = (cap: CeilingCap): number =>
  cap === META_CAP ? 100 : Number(cap);
