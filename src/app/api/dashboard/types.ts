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

// The one figure the remaining period can sustain: how much can be spent EXTRA
// every month, from the current month to the range end, without any month's
// projected balance going under. Arithmetic in ceiling.helper.ts.
export type CeilingMonth = {
  month: number;
  cumulative: number; // the month's projected balance before the ceiling
  remaining: number; // what survives the ceiling being spent every month
};

export type Ceiling = {
  monthly: number; // cents, >= 0
  weekly: number; // floor(monthly / 4)
  daily: number; // floor(monthly / 30)
  tightest: number | null; // the month that pins `monthly`; null when it is 0
  // Earliest month already underwater. Non-null implies `monthly === 0`.
  firstRed: { month: number; shortfall: number } | null;
  // Current month .. range end, never empty. `monthly > 0` requires every
  // `cumulative` here to be positive, so the card's `remaining / cumulative`
  // bar can never divide by zero nor go negative.
  months: CeilingMonth[];
};

// How much of the monthly spending ceiling that month's expense consumed.
export type LimitMonth = {
  month: number;
  spent: number; // effective expense of the month, cents
  percent: number | null; // null when monthlyGoalCents is unset
};

// A goal measured against what the global period can actually put aside.
// `doneMonth` is the single flag the card leans on: it is non-null exactly when
// `accruedCents >= targetCents`, so the completion date, the meter's length and
// its colour can never tell three different stories.
export type GoalProjection = {
  id: string;
  name: string;
  targetCents: number;
  months: number | null; // null when the saving pace is 0
  doneMonth: number | null; // YYYYMM; null when the period never funds it
  accruedCents: number; // pace * months left in the period
  neededCents: number; // per month, to close inside the period
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
      limit: { goalCents: number | null; months: LimitMonth[] };
      goals: GoalProjection[];
    };
