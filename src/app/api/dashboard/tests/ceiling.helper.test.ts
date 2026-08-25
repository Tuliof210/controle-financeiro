/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { buildCeiling } from "@/app/api/dashboard/ceiling.helper.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number, cumulative: number) =>
  ({ month, cumulative }) as MonthPoint;

const flat = [point(202_601, 1000), point(202_602, 1000), point(202_603, 1000)];

// Every case below carries the SAME expected numbers it did while buildCeiling
// took `(cap, limit)`: only the call is translated, which is what proves the
// target union did not walk into the percentage arithmetic. The fixed mode has
// its own file, ceiling-fixed.test.ts, for the same reason.
const pct = (percent: number) => ({ mode: "percent", percent }) as const;

describe("buildCeiling", () => {
  it("ignores months before the current one", () => {
    const ceiling = buildCeiling(
      [point(202_512, 10), ...flat],
      202_601,
      pct(100),
    );

    expect(ceiling.months.map((month) => month.month)).toEqual([
      202_601, 202_602, 202_603,
    ]);
  });

  it("releases the requested share of the suffix minimum", () => {
    const ceiling = buildCeiling(flat, 202_601, pct(50));

    expect(ceiling.monthly).toBe(500);
    expect(ceiling.months.map((month) => month.budget)).toEqual([
      500, 250, 125,
    ]);
  });

  it("accumulates, so a later month is offered only what is left", () => {
    const at75 = buildCeiling(flat, 202_601, pct(75));

    expect(at75.months[0].budget).toBe(750);
    // A bigger share of a smaller remainder can be less than at cap 50.
    expect(at75.months[1].budget).toBeLessThan(250);
  });

  it("reports the arriving and remaining balances per month", () => {
    const [first, second] = buildCeiling(flat, 202_601, pct(50)).months;

    expect(first).toMatchObject({ ceilingBalance: 1000, ceilingLeft: 500 });
    expect(second).toMatchObject({ ceilingBalance: 500, ceilingLeft: 250 });
  });

  it("zeroes the whole column when any month ahead is underwater", () => {
    const ceiling = buildCeiling(
      [point(202_601, 1000), point(202_602, -200)],
      202_601,
      pct(50),
    );

    expect(ceiling.months.every((month) => month.budget === 0)).toBe(true);
    expect(ceiling.monthly).toBe(0);
    expect(ceiling.tightest).toBeNull();
    expect(ceiling.firstRed).toEqual({ month: 202_602, shortfall: 200 });
  });

  it("names the month holding the worst balance ahead", () => {
    const ceiling = buildCeiling(
      [point(202_601, 1000), point(202_602, 400)],
      202_601,
      pct(50),
    );

    expect(ceiling.tightest).toBe(202_602);
    expect(ceiling.firstRed).toBeNull();
  });
});
