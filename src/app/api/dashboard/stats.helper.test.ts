import { describe, expect, it } from "vitest";
import { computeStats } from "./stats.helper";

describe("computeStats", () => {
  it("sums the whole series into total and up to currentIndex into current", () => {
    expect(computeStats([100, 200, 300], 1)).toMatchObject({
      total: 600,
      current: 300,
    });
  });

  it("includes every month when currentIndex is the last position", () => {
    expect(computeStats([100, 200, 300], 2).current).toBe(600);
  });

  it("includes only the first month when currentIndex is zero", () => {
    expect(computeStats([100, 200, 300], 0).current).toBe(100);
  });

  it("computes mean, population stdDev and median for an odd count", () => {
    expect(computeStats([100, 200, 300], 2)).toEqual({
      total: 600,
      current: 600,
      mean: 200,
      stdDev: 82,
      median: 200,
    });
  });

  it("averages the two middle values for an even count", () => {
    expect(computeStats([100, 200, 300, 400], 3)).toEqual({
      total: 1000,
      current: 1000,
      mean: 250,
      stdDev: 112,
      median: 250,
    });
  });

  it("rounds an even-count median that lands on a half cent", () => {
    expect(computeStats([100, 201], 1).median).toBe(151);
  });

  it("handles a single value with a zero deviation", () => {
    expect(computeStats([500], 0)).toEqual({
      total: 500,
      current: 500,
      mean: 500,
      stdDev: 0,
      median: 500,
    });
  });

  it("returns zeros for an empty series instead of dividing by zero", () => {
    expect(computeStats([], 0)).toEqual({
      total: 0,
      current: 0,
      mean: 0,
      stdDev: 0,
      median: 0,
    });
  });

  it("handles a series containing negatives", () => {
    expect(computeStats([-100, 300], 0)).toEqual({
      total: 200,
      current: -100,
      mean: 100,
      stdDev: 200,
      median: 100,
    });
  });
});
