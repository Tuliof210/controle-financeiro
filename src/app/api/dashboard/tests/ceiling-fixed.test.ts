/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { buildCeiling } from "@/app/api/dashboard/ceiling.helper.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

// Its own file rather than more cases in ceiling.helper.test.ts: that file's
// cases pin the percentage budgets, and leaving them untouched is the proof
// that the fixed mode did not reach them.
const point = (month: number, cumulative: number) =>
  ({ month, cumulative }) as MonthPoint;

const flat = [point(202_601, 1000), point(202_602, 1000), point(202_603, 1000)];

const fixed = (cents: number) => ({ mode: "fixed", cents }) as const;

describe("buildCeiling with a fixed target", () => {
  it("hands out a fixed amount as it stands, month after month", () => {
    const ceiling = buildCeiling(flat, 202_601, fixed(300));

    expect(ceiling.months.map((month) => month.budget)).toEqual([
      300, 300, 300,
    ]);
    expect(ceiling.fixed).toBe(true);
  });

  it("lets a fixed amount above the headroom sink the later months", () => {
    const ceiling = buildCeiling(flat, 202_601, fixed(600));

    expect(ceiling.months.map((month) => month.budget)).toEqual([
      600, 600, 600,
    ]);
    expect(ceiling.months.map((month) => month.ceilingLeft)).toEqual([
      400, -200, -800,
    ]);
  });

  it("hands out a fixed amount over a period that already has a hole", () => {
    const ceiling = buildCeiling(
      [point(202_601, 1000), point(202_602, -200)],
      202_601,
      fixed(300),
    );

    expect(ceiling.monthly).toBe(300);
    expect(ceiling.firstRed).toEqual({ month: 202_602, shortfall: 200 });
  });

  it("reports a percentage target as not fixed", () => {
    expect(
      buildCeiling(flat, 202_601, { mode: "percent", percent: 50 }).fixed,
    ).toBe(false);
  });
});
