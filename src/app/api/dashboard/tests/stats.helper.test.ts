/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { computeStats } from "@/app/api/dashboard/stats.helper.ts";

describe("computeStats", () => {
  it("zeroes everything for an empty range", () => {
    expect(computeStats([], 0)).toEqual({
      total: 0,
      current: 0,
      mean: 0,
    });
  });

  it("sums the whole range and only up to the current month", () => {
    const stats = computeStats([100, 200, 300, 400], 1);

    expect(stats.total).toBe(1000);
    expect(stats.current).toBe(300);
  });

  it("rounds the mean to whole cents", () => {
    expect(computeStats([100, 101], 1).mean).toBe(101);
  });

  it("counts a negative month against the current sum", () => {
    expect(computeStats([-100, 50], 0).current).toBe(-100);
  });
});
