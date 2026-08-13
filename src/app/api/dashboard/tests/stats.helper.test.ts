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
      stdDev: 0,
      median: 0,
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

  it("uses the population standard deviation", () => {
    // mean 300, deviations ±200 -> sqrt(40000) = 200.
    expect(computeStats([100, 500], 1).stdDev).toBe(200);
  });

  it("takes the middle value of an odd-length range", () => {
    expect(computeStats([300, 100, 200], 2).median).toBe(200);
  });

  it("averages the two middle values of an even-length range", () => {
    expect(computeStats([100, 200, 300, 401], 3).median).toBe(250);
  });

  it("counts a negative month against the current sum", () => {
    expect(computeStats([-100, 50], 0).current).toBe(-100);
  });
});
