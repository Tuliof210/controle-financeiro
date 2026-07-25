import { describe, expect, it } from "vitest";
import { point } from "./fixtures.helper";
import { buildLimit } from "./limit.helper";

const months = [500, 1000, 2000].map((expense, i) =>
  point(202601 + i, { expense }),
);

describe("buildLimit", () => {
  it("reports the share of the ceiling each month consumed", () => {
    const { months: rows } = buildLimit(months, 1000);
    expect(rows.map((row) => row.percent)).toEqual([50, 100, 200]);
  });

  it("keeps the spend visible but drops the percent when no ceiling is saved", () => {
    const { goalCents, months: rows } = buildLimit(months, null);
    expect(goalCents).toBeNull();
    expect(rows.map((row) => row.percent)).toEqual([null, null, null]);
    expect(rows.map((row) => row.spent)).toEqual([500, 1000, 2000]);
  });

  it("treats a zero ceiling as unset rather than dividing by it", () => {
    expect(buildLimit(months, 0).months.map((row) => row.percent)).toEqual([
      null,
      null,
      null,
    ]);
  });

  it("reports 0% for a month with no expense", () => {
    expect(buildLimit([point(202601)], 1000).months[0].percent).toBe(0);
  });

  it("covers every month of the range, in range order", () => {
    expect(buildLimit(months, 1000).months.map((row) => row.month)).toEqual([
      202601, 202602, 202603,
    ]);
  });

  it("rounds a fractional percentage", () => {
    // 333 / 1000 = 33.3%
    expect(
      buildLimit([point(202601, { expense: 333 })], 1000).months[0].percent,
    ).toBe(33);
  });
});
