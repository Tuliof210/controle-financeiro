import { describe, expect, it } from "vitest";
import { movement as mv, recurrence as rc } from "./fixtures.helper";
import { buildSeries, firstEstimatedMonth } from "./series.helper";

const MONTHS = [202601, 202602, 202603];

describe("buildSeries", () => {
  it("counts a recurrence once per active month, never divided", () => {
    const points = buildSeries(MONTHS, [], [rc(MONTHS, "income", 500000)]);
    expect(points.map((p) => p.income)).toEqual([500000, 500000, 500000]);
  });

  it("takes the bigger side per month and per type", () => {
    const points = buildSeries(
      MONTHS,
      [mv(202601, "income", 700000), mv(202602, "income", 100000)],
      [rc(MONTHS, "income", 500000)],
    );
    expect(points.map((p) => p.income)).toEqual([700000, 500000, 500000]);
    expect(points.map((p) => p.incomeEstimated)).toEqual([false, true, true]);
  });

  it("does not flag a tie as estimated", () => {
    const points = buildSeries(
      [202601],
      [mv(202601, "expense", 500000)],
      [rc([202601], "expense", 500000)],
    );
    expect(points[0].expense).toBe(500000);
    expect(points[0].expenseEstimated).toBe(false);
  });

  it("keeps a month with no data as a zeroed point", () => {
    const points = buildSeries(MONTHS, [mv(202601, "income", 1000)], []);
    expect(points).toHaveLength(3);
    expect(points[1]).toMatchObject({ month: 202602, income: 0, balance: 0 });
  });

  it("ignores entries outside the given months", () => {
    const points = buildSeries(
      MONTHS,
      [mv(202512, "income", 999)],
      [rc([202512, 202601], "expense", 400)],
    );
    expect(points[0].expense).toBe(400);
    expect(points.reduce((sum, p) => sum + p.income, 0)).toBe(0);
  });

  it("carries a negative monthly balance into the cumulative", () => {
    const points = buildSeries(
      MONTHS,
      [
        mv(202601, "income", 1000),
        mv(202602, "expense", 3000),
        mv(202603, "income", 500),
      ],
      [],
    );
    expect(points.map((p) => p.balance)).toEqual([1000, -3000, 500]);
    expect(points.map((p) => p.cumulative)).toEqual([1000, -2000, -1500]);
  });
});

describe("firstEstimatedMonth", () => {
  it("returns the first projected month", () => {
    const points = buildSeries(
      MONTHS,
      [mv(202601, "income", 900000)],
      [rc(MONTHS, "income", 500000)],
    );
    expect(firstEstimatedMonth(points)).toBe(202602);
  });

  it("returns null when every month is real-dominant", () => {
    const points = buildSeries(MONTHS, [mv(202601, "income", 10)], []);
    expect(firstEstimatedMonth(points)).toBeNull();
  });
});
