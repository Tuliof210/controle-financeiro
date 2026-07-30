// How much of the headroom the Teto de Gastos hands out — the share of each
// month's worst projected balance released as spendable. Strings, because this
// is what travels as a query param and what a radio group's `value` is; the
// arithmetic in `buildCeiling` converts once.
//
// Both ends of the wire read the default from here. The route parses `?cap=`
// against this tuple and the screen seeds its state from it, so the server's
// idea of "no cap given" and the UI's idea of "nothing picked yet" cannot drift.
export const CEILING_CAPS = ["25", "50", "75"] as const;

export type CeilingCap = (typeof CEILING_CAPS)[number];

export const DEFAULT_CEILING_CAP: CeilingCap = "50";
