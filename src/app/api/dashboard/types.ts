import type { Ceiling } from "./ceiling.types.ts";

// The dashboard read model — the whole board in one payload. Imported by the
// service that produces it and by the screen that renders it; a derived view,
// not a persisted entity, so it lives here rather than in core/entities.

// One month of the global range, with "real" (Movement) and "estimated"
// (Forecast) already reconciled by the most-complete-picture-wins rule:
// the bigger of the two sides is the truth for that month AND that type.
export interface MonthPoint {
  month: number; // YYYYMM
  income: number; // max(real, estimated) — cents
  expense: number;
  balance: number; // income - expense, may be negative
  cumulative: number; // running sum of balance from the range's first month
  incomeEstimated: boolean; // estimated > real -> projection, render at 50% opacity
  expenseEstimated: boolean;
}

export interface Stats {
  total: number; // sum over the whole range
  current: number; // sum over rangeStart .. currentMonth inclusive
  mean: number;
  stdDev: number; // population (divided by N)
  median: number;
}

// How long one goal takes under one funding assumption, and the month it lands
// in. Null exactly when the saving pace is 0 — no rate reaches any target, and
// the card says so in words rather than printing a date it cannot support.
// The date is NOT clamped to the range end (owner's decision, 2026-07-30): a
// goal that closes after the period still names its month.
export type GoalPace = { months: number; doneMonth: number } | null;

// The same goal read three ways. They differ only in how much of the monthly
// capacity this goal is assumed to get: all of it, an even share of it, or all
// of it but only once every cheaper goal ahead of it in the queue is funded.
export interface GoalProjection {
  id: string;
  name: string;
  targetCents: number;
  dedicated: GoalPace; // the whole capacity, this goal alone
  parallel: GoalPace; // capacity split evenly across every goal
  serialized: GoalPace; // whole capacity, one goal at a time, cheapest first
}

export interface DashboardRange {
  start: number;
  end: number;
  current: number;
}

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
      // A fixed ceiling saved in /perfil has outgrown what the period can
      // carry. Decided on the server because that is the one place holding the
      // saved row and the ceiling it produced at the same time; a second fetch
      // from the screen to find out whether to warn would be a race for nothing.
      overHeadroom: boolean;
      pace: number;
      goals: GoalProjection[];
    };
