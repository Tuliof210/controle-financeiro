// The ceiling read model, split off `types.ts` when the month table pushed that
// file over the 100-line cap. Same read model, same producer
// (ceiling.helper.ts) — only the file boundary is new.

// Which ceiling the family asked for, read off the saved `Settings` row: a
// share of what the period can carry, or a flat amount in cents. The two are
// not interchangeable — a percentage is bounded by the projection and a fixed
// amount is not — so they travel as a discriminated union rather than as a
// number plus a mode flag nothing can see.
export type CeilingTarget =
  | { mode: "percent"; percent: number } // 0..100
  | { mode: "fixed"; cents: number };

// What the remaining period can carry as EXTRA spending, month by month: each
// month's figure is already net of everything the earlier months authorised, so
// the column can be spent in order with no month closing under.
//
// `ceilingBalance` is the balance ARRIVING at the month, after every earlier
// month spent its own ceiling; `ceilingLeft` is that balance once this month has
// spent too. Under a percentage target neither can go negative: each budget is
// floored against a suffix minimum that is itself at or below the month's own
// balance. Under a FIXED target both can — the saved amount is handed out
// literally, and showing the months it sinks is the point.
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
  // A fixed target is the exception: it hands out its amount over a red period
  // too, so `firstRed` can be non-null beside a non-zero `monthly`.
  firstRed: { month: number; shortfall: number } | null;
  // Current month .. range end, never empty.
  months: CeilingMonth[];
  // The largest monthly ceiling that still leaves no month ahead in the red:
  // the budget the current month would be offered at a 100% target, and 0 once
  // any month ahead is already underwater. Independent of the target the
  // payload was built with — it is the same number at every target, which is
  // what lets the Perfil screen clamp a fixed ceiling input against it.
  headroomCents: number; // cents, >= 0
  // This ceiling came from a fixed amount, not from a share of the balance.
  // The card reads it to label what bound the figure: under a percentage the
  // binding month is the honest answer, under a fixed amount it is the Perfil
  // setting, whatever the months would have allowed.
  fixed: boolean;
};
