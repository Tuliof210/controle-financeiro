import type { Movement } from "@/core/entities/movement.entity";
import type { Recurrence } from "@/core/entities/recurrence.entity";
import type { EntryType } from "@/lib/entry-types";
import type { MonthPoint } from "./types";

// Entry factories shared by this folder's test suites. Not a *.test.ts file,
// so Vitest does not collect it, and no app code imports it.

// A zeroed MonthPoint, so a suite states only the fields its rule reads —
// slack cares about `cumulative`, coverage about the four unreconciled sums.
export const point = (
  month: number,
  overrides: Partial<MonthPoint> = {},
): MonthPoint => ({
  month,
  income: 0,
  expense: 0,
  balance: 0,
  cumulative: 0,
  incomeEstimated: false,
  expenseEstimated: false,
  realIncome: 0,
  realExpense: 0,
  estimatedIncome: 0,
  estimatedExpense: 0,
  ...overrides,
});

export const movement = (
  month: number,
  type: EntryType,
  valueCents: number,
  ownerId = "p1",
): Movement => ({
  id: `m-${month}-${ownerId}-${type}-${valueCents}`,
  name: "m",
  valueCents,
  type,
  ownerId,
  month,
  createdAt: new Date(0),
});

export const recurrence = (
  months: number[],
  type: EntryType,
  valueCents: number,
  ownerId = "p1",
): Recurrence => ({
  id: `r-${ownerId}-${type}-${valueCents}`,
  name: "r",
  valueCents,
  type,
  ownerId,
  months,
  createdAt: new Date(0),
});
