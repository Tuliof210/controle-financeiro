// The dashboard read model — the whole board in one payload. Imported by the
// service that produces it and by the screen that renders it; a derived view,
// not a persisted entity, so it lives here rather than in core/entities.

// One month of the global range, with "real" (Movement) and "estimated"
// (Forecast) already reconciled by the most-complete-picture-wins rule:
// the bigger of the two sides is the truth for that month AND that type.
export type MonthPoint = {
  month: number; // YYYYMM
  income: number; // max(real, estimated) — cents
  expense: number;
  balance: number; // income - expense, may be negative
  cumulative: number; // running sum of balance from the range's first month
  incomeEstimated: boolean; // estimated > real -> projection, render at 50% opacity
  expenseEstimated: boolean;
};

export type Stats = {
  total: number; // sum over the whole range
  current: number; // sum over rangeStart .. currentMonth inclusive
  mean: number;
  stdDev: number; // population (divided by N)
  median: number;
};

// What the remaining period can carry as EXTRA spending, month by month: each
// month's figure is already net of everything the earlier months authorised, so
// the column can be spent in order with no month closing under. Arithmetic in
// ceiling.helper.ts.
export type CeilingMonth = {
  month: number;
  budget: number; // cents, >= 0 — this month's own extra-spending figure
  worstAhead: number; // worst projected balance from this month to the range end
  remaining: number; // worstAhead, less every budget up to and including this one
};

// One figure at three cadences — the shape both of the card's headlines take.
export type CeilingRates = {
  monthly: number; // cents, >= 0
  weekly: number; // floor(monthly / 4)
  daily: number; // floor(monthly / 30)
};

// Spread, not nested: the top-level trio is the CURRENT month's budget.
export type Ceiling = CeilingRates & {
  // Raw mean over ALL of `months`, zeros included — never over the rendered rows.
  average: CeilingRates;
  tightest: number | null; // month holding the worst balance ahead; null iff monthly is 0
  // Earliest month already underwater. Non-null implies `monthly === 0`, since a
  // red month zeroes every budget; that zero is the card's empty state.
  firstRed: { month: number; shortfall: number } | null;
  // Current month .. range end, never empty. `monthly > 0` requires every
  // `worstAhead` here to be positive, so the card's bars never divide by zero.
  months: CeilingMonth[];
};

// How long one goal takes under one funding assumption, and the month it lands
// in. Null exactly when the saving pace is 0 — no rate reaches any target, and
// the card says so in words rather than printing a date it cannot support.
// The date is NOT clamped to the range end (owner's decision, 2026-07-30): a
// goal that closes after the period still names its month.
export type GoalPace = { months: number; doneMonth: number } | null;

// The same goal read three ways. They differ only in how much of the monthly
// capacity this goal is assumed to get: all of it, an even share of it, or all
// of it but only once every cheaper goal ahead of it in the queue is funded.
export type GoalProjection = {
  id: string;
  name: string;
  targetCents: number;
  dedicated: GoalPace; // the whole capacity, this goal alone
  parallel: GoalPace; // capacity split evenly across every goal
  serialized: GoalPace; // whole capacity, one goal at a time, cheapest first
};

export type DashboardRange = { start: number; end: number; current: number };

// Discriminated on `status` so the screen renders one of three states without
// inspecting nullable fields. "no_range" is the empty-database state: the
// period is derived from the entries (derivePeriod), so it is never inverted.
export type DashboardData =
  | { status: "no_range" }
  | { status: "out_of_range"; range: DashboardRange }
  | {
      status: "ok";
      range: DashboardRange;
      points: MonthPoint[];
      // First month with incomeEstimated || expenseEstimated; null when every
      // month is real-dominant. Owner's decision (2026-07-25): this is NOT
      // clamped to the current month, so an under-recorded PAST month starts
      // the dashed run early — dashed means "from here on the recorded data no
      // longer covers the commitments", not "future".
      dashedFrom: number | null;
      income: Stats;
      expense: Stats;
      balance: Stats;
      ceiling: Ceiling;
      pace: number;
      goals: GoalProjection[];
    };
