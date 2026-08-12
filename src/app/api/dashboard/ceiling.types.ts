// The ceiling read model, split off `types.ts` when the month table pushed that
// file over the 100-line cap. Same read model, same producer
// (ceiling.helper.ts) — only the file boundary is new.

// What the remaining period can carry as EXTRA spending, month by month: each
// month's figure is already net of everything the earlier months authorised, so
// the column can be spent in order with no month closing under.
//
// `ceilingBalance` is the balance ARRIVING at the month, after every earlier
// month spent its own ceiling; `ceilingLeft` is that balance once this month has
// spent too. Neither can go negative: each budget is floored against a suffix
// minimum that is itself at or below the month's own balance.
export interface CeilingMonth {
  month: number;
  budget: number; // cents, >= 0 — this month's own extra-spending figure
  ceilingBalance: number;
  ceilingLeft: number;
}

// One figure at three cadences — the shape the card's headline takes.
export interface CeilingRates {
  monthly: number; // cents, >= 0
  weekly: number; // floor(monthly / 4)
  daily: number; // floor(monthly / 30)
}

// Spread, not nested: the top-level trio is the CURRENT month's budget.
export type Ceiling = CeilingRates & {
  tightest: number | null; // month holding the worst balance ahead; null iff monthly is 0
  // Earliest month already underwater. Non-null implies `monthly === 0`, since a
  // red month zeroes every budget; that zero is the card's empty state.
  firstRed: { month: number; shortfall: number } | null;
  // Current month .. range end, never empty — it is also savingPace's divisor.
  months: CeilingMonth[];
};
