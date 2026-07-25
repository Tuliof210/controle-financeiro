import { describe, expect, it } from "vitest";
import { buildCoverage } from "./coverage.helper";
import { point } from "./fixtures.helper";

describe("buildCoverage", () => {
  it("caps an overspent type without hiding a shortfall in the other", () => {
    // Expenses overshoot by 500, income is 400 short. Without the per-type cap
    // the month would read as fully covered.
    const points = [
      point(202601, {
        realIncome: 600,
        estimatedIncome: 1000,
        realExpense: 1500,
        estimatedExpense: 1000,
      }),
    ];
    expect(buildCoverage(points, 202601)).toMatchObject({
      committed: 2000,
      recorded: 1600, // min(600,1000) + min(1500,1000)
      percent: 80,
      months: [{ month: 202601, gap: 400 }],
    });
  });

  it("leaves a fully recorded month out of the list", () => {
    const points = [
      point(202601, { realExpense: 1000, estimatedExpense: 1000 }),
    ];
    const coverage = buildCoverage(points, 202601);
    expect(coverage.percent).toBe(100);
    expect(coverage.months).toEqual([]);
  });

  it("ignores months after the current one entirely", () => {
    const points = [
      point(202601, { realExpense: 1000, estimatedExpense: 1000 }),
      point(202602, { realExpense: 0, estimatedExpense: 5000 }),
    ];
    const coverage = buildCoverage(points, 202601);
    expect(coverage.committed).toBe(1000);
    expect(coverage.months).toEqual([]);
  });

  it("returns a null percent when nothing was committed, not NaN or zero", () => {
    const coverage = buildCoverage([point(202601)], 202601);
    expect(coverage.percent).toBeNull();
    expect(coverage.committed).toBe(0);
  });

  it("sorts the shortfalls worst first", () => {
    const points = [
      point(202601, { estimatedExpense: 100 }),
      point(202602, { estimatedExpense: 900 }),
      point(202603, { estimatedExpense: 400 }),
    ];
    expect(
      buildCoverage(points, 202603).months.map((month) => month.gap),
    ).toEqual([900, 400, 100]);
  });
});
