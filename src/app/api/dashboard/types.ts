// The dashboard read model — the whole board in one payload. Imported by the
// service that produces it and by the screen that renders it; a derived view,
// not a persisted entity, so it lives here rather than in core/entities.

// One month of the global range, with "real" (Movement) and "estimated"
// (Recurrence) already reconciled by the most-complete-picture-wins rule:
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

// How much can be spent in a month without pushing any later month underwater.
export type SlackMonth = {
  month: number;
  total: number; // cents, >= 0
  weekly: number; // floor(total / 4)
  daily: number; // floor(total / 30)
};

// How much of the monthly spending ceiling that month's expense consumed.
export type LimitMonth = {
  month: number;
  spent: number; // effective expense of the month, cents
  percent: number | null; // null when monthlyGoalCents is unset
};

export type GoalProjection = {
  id: string;
  name: string;
  targetCents: number;
  months: number | null; // null when the saving pace is 0
};

export type DashboardRange = { start: number; end: number; current: number };

// Discriminated on `status` so the screen renders one of three states without
// inspecting nullable fields. "no_range" also covers a persisted inverted
// range — PUT /api/settings only validates the incoming patch, never the
// merged result, so rangeStart > rangeEnd is reachable.
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
      slack: SlackMonth[];
      pace: number;
      limit: { goalCents: number | null; months: LimitMonth[] };
      goals: GoalProjection[];
    };
