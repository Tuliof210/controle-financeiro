import { describe, expect, it } from "vitest";
import type { MonthPoint } from "@/app/api/dashboard/types";
import type { BoardData } from "../Board/hook";
import { useGeneralTab } from "./hook";

// useGeneralTab calls no React hook, and reads nothing off the board but
// `points`, so the series are testable without a whole payload.
const point = (
  month: number,
  income: number,
  expense: number,
  cumulative: number,
): MonthPoint => ({
  month,
  income,
  expense,
  balance: income - expense,
  cumulative,
  incomeEstimated: false,
  expenseEstimated: false,
});

// Every month's running total differs from its own delta after the first, so a
// series built from the wrong field cannot match by coincidence.
const data = {
  points: [
    point(202601, 100, 40, 60),
    point(202602, 200, 150, 110),
    point(202603, 90, 130, 70),
  ],
} as BoardData;

describe("useGeneralTab", () => {
  it("gives each KPI card its own monthly series", () => {
    const tab = useGeneralTab({ data });
    expect(tab.income).toEqual([100, 200, 90]);
    expect(tab.expense).toEqual([40, 150, 130]);
  });

  it("draws Saldo from the running cumulative, not the per-month balance", () => {
    // The Saldo card's headline is the running balance; a sparkline of
    // `point.balance` ([60, 50, -40] here) would tell a different story from
    // the number above it.
    expect(useGeneralTab({ data }).balance).toEqual([60, 110, 70]);
  });
});
